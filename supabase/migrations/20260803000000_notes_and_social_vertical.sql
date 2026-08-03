-- Migration: 20260803000000_notes_and_social_vertical.sql
-- Description: Establish canonical notes, follows, reactions, saves, comments, voice_replies, and notifications tables for Phase 1 note vertical journey.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. NOTES
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'voice')),
  note_kind TEXT NOT NULL DEFAULT 'temporary' CHECK (note_kind IN ('temporary', 'permanent')),
  audio_url TEXT,
  duration_seconds INTEGER,
  waveform_data JSONB,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS notes_expires_at_idx ON public.notes(expires_at);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON public.notes(created_at DESC);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notes_public_read_active" ON public.notes;
CREATE POLICY "notes_public_read_active" ON public.notes FOR SELECT USING (
  note_kind = 'permanent' OR expires_at > now()
);

DROP POLICY IF EXISTS "notes_own_insert" ON public.notes;
CREATE POLICY "notes_own_insert" ON public.notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notes_own_delete" ON public.notes;
CREATE POLICY "notes_own_delete" ON public.notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. FOLLOWS
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_idx ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_idx ON public.follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows_public_read" ON public.follows;
CREATE POLICY "follows_public_read" ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "follows_own_insert" ON public.follows;
CREATE POLICY "follows_own_insert" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "follows_own_delete" ON public.follows;
CREATE POLICY "follows_own_delete" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- RPC for Follow / Unfollow
CREATE OR REPLACE FUNCTION public.follow_user(p_follower UUID, p_following UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_follower = p_following THEN
    RAISE EXCEPTION 'Cannot follow self';
  END IF;
  
  INSERT INTO public.follows (follower_id, following_id, status)
  VALUES (p_follower, p_following, 'accepted')
  ON CONFLICT (follower_id, following_id) DO NOTHING;

  -- Create Notification
  INSERT INTO public.notifications (recipient_id, actor_id, type, title, message)
  VALUES (
    p_following,
    p_follower,
    'follow',
    'New Follower',
    'Someone started following you'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.unfollow_user(p_follower UUID, p_following UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.follows
  WHERE follower_id = p_follower AND following_id = p_following;
END;
$$;

-- 4. SAVES
CREATE TABLE IF NOT EXISTS public.saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, note_id)
);

CREATE INDEX IF NOT EXISTS saves_user_idx ON public.saves(user_id, created_at DESC);

ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saves_own_read" ON public.saves;
CREATE POLICY "saves_own_read" ON public.saves FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saves_own_insert" ON public.saves;
CREATE POLICY "saves_own_insert" ON public.saves FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saves_own_delete" ON public.saves;
CREATE POLICY "saves_own_delete" ON public.saves FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('voice', 'image')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_note_idx ON public.comments(note_id, created_at ASC);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_public_read" ON public.comments;
CREATE POLICY "comments_public_read" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "comments_own_insert" ON public.comments;
CREATE POLICY "comments_own_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "comments_own_delete" ON public.comments;
CREATE POLICY "comments_own_delete" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- 6. VOICE REPLIES
CREATE TABLE IF NOT EXISTS public.voice_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS voice_replies_note_idx ON public.voice_replies(note_id, created_at ASC);

ALTER TABLE public.voice_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "voice_replies_public_read" ON public.voice_replies;
CREATE POLICY "voice_replies_public_read" ON public.voice_replies FOR SELECT USING (true);

DROP POLICY IF EXISTS "voice_replies_own_insert" ON public.voice_replies;
CREATE POLICY "voice_replies_own_insert" ON public.voice_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'reply', 'voice_reply', 'follow', 'follow_request', 'system')),
  related_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_recipient_idx ON public.notifications(recipient_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_own_read" ON public.notifications;
CREATE POLICY "notifications_own_read" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "notifications_own_update" ON public.notifications;
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);
