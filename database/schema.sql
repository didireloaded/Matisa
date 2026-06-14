-- Matisa Database Schema

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. USERS & PROFILES
CREATE TABLE public.profiles (
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
CREATE TABLE public.follows (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- 4. COMMUNITIES
CREATE TABLE public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    location GEOMETRY(Point, 4326),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.community_members (
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (community_id, user_id)
);

-- 5. EVENTS
CREATE TABLE public.events (
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

CREATE TABLE public.event_attendees (
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'interested' CHECK (status IN ('interested', 'going')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
);

-- 6. POSTS & COMMENTS
CREATE TABLE public.posts (
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

CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.likes (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- 7. STORIES
CREATE TABLE public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'voice')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.story_views (
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (story_id, viewer_id)
);

-- 8. MESSAGING
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_group BOOLEAN DEFAULT FALSE,
    name TEXT, -- only for group chats
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'voice')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. NOTIFICATIONS
CREATE TABLE public.notifications (
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
