-- Playlists Table
CREATE TABLE IF NOT EXISTS public.playlists (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    cover_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Playlist Tracks Table
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    artist text NOT NULL,
    audio_url text NOT NULL,
    duration integer, -- in seconds
    added_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Playlist Followers Table
CREATE TABLE IF NOT EXISTS public.playlist_followers (
    playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    followed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (playlist_id, user_id)
);

-- Playlist Comments Table
CREATE TABLE IF NOT EXISTS public.playlist_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    location_name text,
    event_date timestamp with time zone NOT NULL,
    cover_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Event Attendees Table
CREATE TABLE IF NOT EXISTS public.event_attendees (
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (event_id, user_id)
);

-- Event Comments Table
CREATE TABLE IF NOT EXISTS public.event_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_comments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;

-- Policies for Playlists
CREATE POLICY "Playlists are viewable by everyone." ON public.playlists FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert playlists." ON public.playlists FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own playlists." ON public.playlists FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete their own playlists." ON public.playlists FOR DELETE USING (auth.uid() = creator_id);

-- Policies for Playlist Tracks
CREATE POLICY "Playlist tracks are viewable by everyone." ON public.playlist_tracks FOR SELECT USING (true);
CREATE POLICY "Playlist creator can insert tracks." ON public.playlist_tracks FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT creator_id FROM public.playlists WHERE id = playlist_id)
);
CREATE POLICY "Playlist creator can delete tracks." ON public.playlist_tracks FOR DELETE USING (
    auth.uid() IN (SELECT creator_id FROM public.playlists WHERE id = playlist_id)
);

-- Policies for Playlist Followers
CREATE POLICY "Playlist followers are viewable by everyone." ON public.playlist_followers FOR SELECT USING (true);
CREATE POLICY "Users can follow playlists." ON public.playlist_followers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unfollow playlists." ON public.playlist_followers FOR DELETE USING (auth.uid() = user_id);

-- Policies for Playlist Comments
CREATE POLICY "Playlist comments are viewable by everyone." ON public.playlist_comments FOR SELECT USING (true);
CREATE POLICY "Users can add playlist comments." ON public.playlist_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own playlist comments." ON public.playlist_comments FOR DELETE USING (auth.uid() = user_id);

-- Policies for Events
CREATE POLICY "Events are viewable by everyone." ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events." ON public.events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update events." ON public.events FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete events." ON public.events FOR DELETE USING (auth.uid() = creator_id);

-- Policies for Event Attendees
CREATE POLICY "Event attendees are viewable by everyone." ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can join events." ON public.event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave events." ON public.event_attendees FOR DELETE USING (auth.uid() = user_id);

-- Policies for Event Comments
CREATE POLICY "Event comments are viewable by everyone." ON public.event_comments FOR SELECT USING (true);
CREATE POLICY "Users can add event comments." ON public.event_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own event comments." ON public.event_comments FOR DELETE USING (auth.uid() = user_id);
