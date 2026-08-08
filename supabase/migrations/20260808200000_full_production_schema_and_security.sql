-- Migration: 20260808200000_full_production_schema_and_security.sql
-- Description: Complete backend schema, RLS policies, blocks, outbox, rooms, karaoke queue, and private storage authorization for Matisa Production Candidate.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.blocks (
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON public.blocks (blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON public.blocks (blocked_id);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocks_own_read" ON public.blocks;
CREATE POLICY "blocks_own_read" ON public.blocks FOR SELECT TO authenticated USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "blocks_own_insert" ON public.blocks;
CREATE POLICY "blocks_own_insert" ON public.blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "blocks_own_delete" ON public.blocks;
CREATE POLICY "blocks_own_delete" ON public.blocks FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- RPC for Block / Unblock User
CREATE OR REPLACE FUNCTION public.block_user(p_blocked_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_blocker_id UUID;
BEGIN
  v_blocker_id := auth.uid();
  IF v_blocker_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF v_blocker_id = p_blocked_id THEN
    RAISE EXCEPTION 'Cannot block self';
  END IF;

  INSERT INTO public.blocks (blocker_id, blocked_id)
  VALUES (v_blocker_id, p_blocked_id)
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

  -- Automatically delete follow relationships
  DELETE FROM public.follows
  WHERE (follower_id = v_blocker_id AND following_id = p_blocked_id)
     OR (follower_id = p_blocked_id AND following_id = v_blocker_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.unblock_user(p_blocked_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.blocks
  WHERE blocker_id = auth.uid() AND blocked_id = p_blocked_id;
END;
$$;

-- 2. OUTBOX EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  last_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending ON public.outbox_events (status, available_at) WHERE status = 'pending';

ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;

-- Service role / Edge Functions process outbox events
DROP POLICY IF EXISTS "outbox_own_read" ON public.outbox_events;
CREATE POLICY "outbox_own_read" ON public.outbox_events FOR SELECT TO authenticated USING (auth.uid() = actor_id OR auth.uid() = recipient_id);

-- 3. STORIES & STORY VIEWS
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'voice', 'text')),
  media_url TEXT,
  content TEXT,
  background_gradient TEXT,
  duration_seconds INTEGER DEFAULT 15,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_active ON public.stories (expires_at DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_author ON public.stories (author_id);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stories_read_active" ON public.stories;
CREATE POLICY "stories_read_active" ON public.stories FOR SELECT USING (expires_at > now());

DROP POLICY IF EXISTS "stories_own_insert" ON public.stories;
CREATE POLICY "stories_own_insert" ON public.stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "stories_own_delete" ON public.stories;
CREATE POLICY "stories_own_delete" ON public.stories FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE TABLE IF NOT EXISTS public.story_views (
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, viewer_id)
);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "story_views_read" ON public.story_views;
CREATE POLICY "story_views_read" ON public.story_views FOR SELECT TO authenticated USING (
  auth.uid() = viewer_id OR EXISTS (SELECT 1 FROM public.stories WHERE id = story_id AND author_id = auth.uid())
);

DROP POLICY IF EXISTS "story_views_insert" ON public.story_views;
CREATE POLICY "story_views_insert" ON public.story_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = viewer_id);

-- 4. VOICE ROOMS & KARAOKE ROOMS
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  room_type TEXT NOT NULL DEFAULT 'voice' CHECK (room_type IN ('voice', 'karaoke')),
  is_private BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rooms_active ON public.rooms (status, created_at DESC);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rooms_public_read" ON public.rooms;
CREATE POLICY "rooms_public_read" ON public.rooms FOR SELECT USING (status = 'active' OR auth.uid() = host_id);

DROP POLICY IF EXISTS "rooms_own_insert" ON public.rooms;
CREATE POLICY "rooms_own_insert" ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "rooms_own_update" ON public.rooms;
CREATE POLICY "rooms_own_update" ON public.rooms FOR UPDATE TO authenticated USING (auth.uid() = host_id);

-- Room Participants
CREATE TABLE IF NOT EXISTS public.room_participants (
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'listener' CHECK (role IN ('host', 'speaker', 'listener')),
  muted BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "room_part_public_read" ON public.room_participants;
CREATE POLICY "room_part_public_read" ON public.room_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "room_part_own_insert" ON public.room_participants;
CREATE POLICY "room_part_own_insert" ON public.room_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "room_part_own_delete" ON public.room_participants;
CREATE POLICY "room_part_own_delete" ON public.room_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. KARAOKE QUEUE
CREATE TABLE IF NOT EXISTS public.karaoke_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_title TEXT NOT NULL,
  artist_name TEXT NOT NULL DEFAULT 'Unknown Artist',
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'performing', 'completed', 'skipped')),
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, user_id, status)
);

CREATE INDEX IF NOT EXISTS idx_karaoke_queue ON public.karaoke_queue (room_id, position ASC);

ALTER TABLE public.karaoke_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "karaoke_queue_read" ON public.karaoke_queue;
CREATE POLICY "karaoke_queue_read" ON public.karaoke_queue FOR SELECT USING (true);

DROP POLICY IF EXISTS "karaoke_queue_own_insert" ON public.karaoke_queue;
CREATE POLICY "karaoke_queue_own_insert" ON public.karaoke_queue FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "karaoke_queue_own_delete" ON public.karaoke_queue;
CREATE POLICY "karaoke_queue_own_delete" ON public.karaoke_queue FOR DELETE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND host_id = auth.uid()));

-- RPC for Karaoke Queue Join
CREATE OR REPLACE FUNCTION public.join_karaoke_queue(
  p_room_id UUID,
  p_song_title TEXT,
  p_artist_name TEXT DEFAULT 'Unknown Artist'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_next_pos INTEGER;
  v_entry_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COALESCE(MAX(position), 0) + 1 INTO v_next_pos
  FROM public.karaoke_queue
  WHERE room_id = p_room_id AND status = 'waiting';

  INSERT INTO public.karaoke_queue (room_id, user_id, song_title, artist_name, position, status)
  VALUES (p_room_id, v_user_id, p_song_title, p_artist_name, v_next_pos, 'waiting')
  RETURNING id INTO v_entry_id;

  RETURN v_entry_id;
END;
$$;

-- 6. PRIVATE STORAGE POLICIES
-- Ensure message_media bucket is private
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message_media', 'message_media', false) 
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('voicemail_media', 'voicemail_media', false) 
ON CONFLICT (id) DO UPDATE SET public = false;
