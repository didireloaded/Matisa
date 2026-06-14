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
