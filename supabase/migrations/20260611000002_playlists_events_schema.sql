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
CREATE TABLE IF NOT EXISTS 
<truncated 4215 bytes>