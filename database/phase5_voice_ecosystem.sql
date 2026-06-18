-- Phase 5: Voice Ecosystem
-- This migration sets up the required tables for Voice Notes, Rooms, and Karaoke.

-- 1. VOICE NOTES & STORIES
CREATE TABLE public.voice_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds <= 60),
    waveform_data JSONB, -- Array of amplitudes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE -- For 24h stories
);

CREATE TABLE public.voice_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voice_note_id UUID REFERENCES public.voice_notes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.voice_story_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID REFERENCES public.voice_notes(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds <= 30),
    waveform_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.profile_voice_intros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds <= 20),
    waveform_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LIVE VOICE ROOMS
CREATE TABLE public.voice_rooms (
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

CREATE TABLE public.voice_room_members (
    room_id UUID REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'listener' CHECK (role IN ('host', 'moderator', 'speaker', 'listener')),
    is_speaking BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE public.voice_room_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. KARAOKE ROOMS (Extension of Voice Rooms)
CREATE TABLE public.karaoke_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voice_room_id UUID REFERENCES public.voice_rooms(id) ON DELETE CASCADE UNIQUE,
    karaoke_type TEXT DEFAULT 'open_mic' CHECK (karaoke_type IN ('open_mic', 'competition', 'friends_only', 'private', 'artist_hosted', 'community_hosted')),
    capacity INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.karaoke_participants (
    karaoke_room_id UUID REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'audience' CHECK (role IN ('performer', 'audience')),
    score INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (karaoke_room_id, user_id)
);

CREATE TABLE public.karaoke_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    karaoke_room_id UUID REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    song_name TEXT NOT NULL,
    song_url TEXT, -- backing track URL
    position INTEGER NOT NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'approved', 'performing', 'completed', 'skipped')),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.karaoke_performances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    karaoke_room_id UUID REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    song_name TEXT NOT NULL,
    performance_audio_url TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.karaoke_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    performance_id UUID REFERENCES public.karaoke_performances(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    fire_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ANALYTICS & KARMA
CREATE TABLE public.voice_analytics (
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
