-- Matisa Database Schema

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. USERS & PROFILES
CREATE TABLE IF NOT EXISTS  (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    location GEOMETRY(Point, 4326),
    location_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ghost_mode BOOLEAN DEFAULT FALSE,
    ghost_mode_type TEXT DEFAULT 'approximate' CHECK (ghost_mode_type IN ('invisible', 'approximate', 'exact')),
    privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends_only', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FOLLOWS
CREATE TABLE IF NOT EXISTS  (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- 4. COMMUNITIES
CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    location GEOMETRY(Point, 4326),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS  (
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (community_id, user_id)
);

-- 5. EVENTS
CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    location GEOMETRY(Point, 4326),
    location_name TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS  (
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'interested' CHECK (status IN ('interested', 'going')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
);

-- 6. POSTS & COMMENTS
CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- User's Home.tsx uses user_id
    content TEXT,
    media_urls TEXT[],
    voice_url TEXT,
    is_story BOOLEAN DEFAULT FALSE,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('voice_notes', 'voice_notes', true);

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'voice_notes');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'voice_notes' AND auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS  (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- 7. STORIES
CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'voice')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS  (
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (story_id, viewer_id)
);

-- 8. MESSAGING
CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_group BOOLEAN DEFAULT FALSE,
    name TEXT, -- only for group chats
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS  (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'voice')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'like', 'comment', 'follow', 'event_invite'
    entity_id UUID, -- reference to post/comment/event etc.
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Base RLS for other tables
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public follows viewable by everyone." ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their follows." ON public.follows FOR ALL USING (auth.uid() = follower_id);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public communities viewable by everyone." ON public.communities FOR SELECT USING (true);
CREATE POLICY "Users can create communities." ON public.communities FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update communities." ON public.communities FOR UPDATE USING (auth.uid() = created_by);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public community members viewable by everyone." ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users can join communities." ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities." ON public.community_members FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public events viewable by everyone." ON public.events FOR SELECT USING (true);
CREATE POLICY "Users can manage their events." ON public.events FOR ALL USING (auth.uid() = created_by);

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public attendees viewable by everyone." ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can manage their attendance." ON public.event_attendees FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public posts viewable by everyone." ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can manage their posts." ON public.posts FOR ALL USING (auth.uid() = user_id OR auth.uid() = author_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public comments viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can manage their comments." ON public.comments FOR ALL USING (auth.uid() = author_id);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public likes viewable by everyone." ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their likes." ON public.likes FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public stories viewable by everyone." ON public.stories FOR SELECT USING (true);
CREATE POLICY "Users can manage their stories." ON public.stories FOR ALL USING (auth.uid() = author_id);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their story views." ON public.story_views FOR SELECT USING (auth.uid() = viewer_id OR auth.uid() IN (SELECT author_id FROM public.stories WHERE id = story_id));
CREATE POLICY "Users can record their view." ON public.story_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their conversations." ON public.conversations FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = id AND user_id = auth.uid()));
CREATE POLICY "Users can create conversations." ON public.conversations FOR INSERT WITH CHECK (true);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their conversation participants." ON public.conversation_participants FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users can join conversations." ON public.conversation_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their messages." ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users can send messages." ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their notifications." ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Function to set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_communities_updated_at
BEFORE UPDATE ON public.communities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- PostGIS Nearby Users RPC
CREATE OR REPLACE FUNCTION find_nearby_users(
  user_lat float,
  user_lng float,
  radius_meters float
) RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  lat float,
  lng float,
  distance float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    ST_Y(p.location::geometry) as lat,
    ST_X(p.location::geometry) as lng,
    ST_Distance(p.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distance
  FROM public.profiles p
  WHERE 
    p.location IS NOT NULL
    AND p.ghost_mode = false
    AND ST_DWithin(p.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_meters)
  ORDER BY distance ASC
  LIMIT 50;
END;
$$;

-- PostGIS Nearby Communities RPC
CREATE OR REPLACE FUNCTION find_nearby_communities(
  user_lat float,
  user_lng float,
  radius_meters float
) RETURNS TABLE (
  id uuid,
  name text,
  cover_url text,
  lat float,
  lng float,
  distance float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.cover_url,
    ST_Y(c.location::geometry) as lat,
    ST_X(c.location::geometry) as lng,
    ST_Distance(c.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distance
  FROM public.communities c
  WHERE 
    c.location IS NOT NULL
    AND ST_DWithin(c.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_meters)
  ORDER BY distance ASC
  LIMIT 50;
END;
$$;


-- 1. Update Comments for Voice
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS voice_url TEXT;

-- 2. Update Conversations for Seen Status
ALTER TABLE public.conversation_participants ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Music (Playlists)
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    cover_url TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.playlist_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.playlist_votes (
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (playlist_id, user_id)
);

-- 4. Karaoke
CREATE TABLE IF NOT EXISTS public.karaoke_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private', 'friends')),
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.karaoke_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    track_name TEXT NOT NULL,
    artist_name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'singing', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Realtime enabling for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.karaoke_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.karaoke_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;


-- Phase 4 & Phase 3 Overhaul Migration Script

-- 1. Update Profiles Table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS country TEXT;

-- 2. Create Notes Table (for Phase 5, doing it now)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    likes_count INTEGER DEFAULT 0,
    fire_count INTEGER DEFAULT 0,
    laugh_count INTEGER DEFAULT 0
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public notes viewable by everyone." ON public.notes FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Users can insert their own notes." ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes." ON public.notes FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;

-- 3. Create RPC for Top People Discovery
CREATE OR REPLACE FUNCTION get_top_people(limit_count INT DEFAULT 100)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  followers_count INTEGER,
  verified BOOLEAN,
  country TEXT,
  rank BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    COALESCE(p.display_name, p.full_name) as display_name,
    p.avatar_url,
    p.followers_count,
    p.verified,
    p.country,
    ROW_NUMBER() OVER(ORDER BY p.followers_count DESC, p.created_at ASC) as rank
  FROM public.profiles p
  ORDER BY p.followers_count DESC, p.created_at ASC
  LIMIT limit_count;
END;
$$;


-- Phase 5: Voice Ecosystem
-- This migration sets up the required tables for Voice Notes, Rooms, and Karaoke.

-- 1. VOICE NOTES & STORIES
CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds <= 60),
    waveform_data JSONB, -- Array of amplitudes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE -- For 24h stories
);

CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voice_note_id UUID REFERENCES public.voice_notes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID REFERENCES public.voice_notes(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds <= 30),
    waveform_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds <= 20),
    waveform_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LIVE VOICE ROOMS
CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    room_type TEXT DEFAULT 'public' CHECK (room_type IN ('public', 'friends_only', 'private', 'community', 'creator', 'event')),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    participant_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS  (
    room_id UUID REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'listener' CHECK (role IN ('host', 'moderator', 'speaker', 'listener')),
    is_speaking BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. KARAOKE ROOMS (Extension of Voice Rooms)
CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voice_room_id UUID REFERENCES public.voice_rooms(id) ON DELETE CASCADE UNIQUE,
    karaoke_type TEXT DEFAULT 'open_mic' CHECK (karaoke_type IN ('open_mic', 'competition', 'friends_only', 'private', 'artist_hosted', 'community_hosted')),
    capacity INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS  (
    karaoke_room_id UUID REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'audience' CHECK (role IN ('performer', 'audience')),
    score INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (karaoke_room_id, user_id)
);

CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    karaoke_room_id UUID REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    song_name TEXT NOT NULL,
    song_url TEXT, -- backing track URL
    position INTEGER NOT NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'approved', 'performing', 'completed', 'skipped')),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    karaoke_room_id UUID REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    song_name TEXT NOT NULL,
    performance_audio_url TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    performance_id UUID REFERENCES public.karaoke_performances(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    fire_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ANALYTICS & KARMA
CREATE TABLE IF NOT EXISTS  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    total_voice_score INTEGER DEFAULT 0,
    total_performance_score INTEGER DEFAULT 0,
    total_participation_score INTEGER DEFAULT 0,
    room_reputation INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES
-- Add basic RLS to allow authenticated users to read/write their own data, and read public data
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public voice notes are viewable by everyone" ON public.voice_notes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own voice notes" ON public.voice_notes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete their own voice notes" ON public.voice_notes FOR DELETE USING (auth.uid() = author_id);

ALTER TABLE public.voice_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public rooms are viewable by everyone" ON public.voice_rooms FOR SELECT USING (room_type = 'public' OR room_type = 'community' OR room_type = 'event' OR host_id = auth.uid());
CREATE POLICY "Users can create rooms" ON public.voice_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update room" ON public.voice_rooms FOR UPDATE USING (auth.uid() = host_id);

-- Enable RLS for all other tables generically (read all, write own)
ALTER TABLE public.voice_room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Room members viewable" ON public.voice_room_members FOR SELECT USING (true);
CREATE POLICY "Users can join rooms" ON public.voice_room_members FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.karaoke_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Karaoke rooms viewable" ON public.karaoke_rooms FOR SELECT USING (true);
CREATE POLICY "Host can create karaoke room" ON public.karaoke_rooms FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.voice_rooms WHERE id = voice_room_id AND host_id = auth.uid()));

ALTER TABLE public.karaoke_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Queue is viewable" ON public.karaoke_queue FOR SELECT USING (true);
CREATE POLICY "Users can queue themselves" ON public.karaoke_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Host can manage queue" ON public.karaoke_queue FOR UPDATE USING (EXISTS (SELECT 1 FROM public.karaoke_rooms kr JOIN public.voice_rooms vr ON kr.voice_room_id = vr.id WHERE kr.id = karaoke_room_id AND vr.host_id = auth.uid()));

-- Apply triggers for updated_at
CREATE TRIGGER set_profile_voice_intros_updated_at
BEFORE UPDATE ON public.profile_voice_intros
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_voice_analytics_updated_at
BEFORE UPDATE ON public.voice_analytics
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Add voice_notes to storage bucket
-- INSERT INTO storage.buckets (id, name, public) VALUES ('voice_notes', 'voice_notes', true);
-- (This was already in schema.sql, we'll ensure we use this bucket for voice notes, and add karaoke tracks/performances)

INSERT INTO storage.buckets (id, name, public) VALUES ('karaoke_tracks', 'karaoke_tracks', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public Access Karaoke Tracks" ON storage.objects FOR SELECT USING (bucket_id = 'karaoke_tracks');
CREATE POLICY "Authenticated users can upload tracks" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'karaoke_tracks' AND auth.role() = 'authenticated');

INSERT INTO storage.buckets (id, name, public) VALUES ('karaoke_performances', 'karaoke_performances', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public Access Karaoke Performances" ON storage.objects FOR SELECT USING (bucket_id = 'karaoke_performances');
CREATE POLICY "Authenticated users can upload performances" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'karaoke_performances' AND auth.role() = 'authenticated');
