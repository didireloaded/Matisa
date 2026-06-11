-- Create Enums
CREATE TYPE public.post_type AS ENUM ('text', 'photo', 'video', 'voice', 'poll', 'location');
CREATE TYPE public.interaction_type AS ENUM ('like', 'save', 'repost');

-- Alter existing posts table
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS type public.post_type DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS media_url text,
  ADD COLUMN IF NOT EXISTS voice_duration integer;

-- Drop old voice_url column as we'll use media_url for all media including voice
ALTER TABLE public.posts DROP COLUMN IF EXISTS voice_url;

-- Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text,
    voice_url text,
    voice_duration integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone."
    ON public.comments FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own comments."
    ON public.comments FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can delete own comments."
    ON public.comments FOR DELETE
    USING ( auth.uid() = user_id );

-- Create Post Interactions Table
CREATE TABLE IF NOT EXISTS public.post_interactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type public.interaction_type NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id, type)
);

-- Enable RLS for Interactions
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interactions are v
<truncated 551 bytes>