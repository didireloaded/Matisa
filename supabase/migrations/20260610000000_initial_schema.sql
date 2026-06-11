-- Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    voicemail_url text,
    mood text,
    bio text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING ( auth.uid() = id );

-- Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text,
    voice_url text,
    is_story boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone."
    ON public.posts FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own posts."
    ON public.posts FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can delete own posts."
    ON public.posts FOR DELETE
    USING ( auth.uid() = user_id );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Setup Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('voice_notes', 'voice_notes', true) ON CONFLICT DO NOTHING;

-- Storage Policies
CREATE POLICY "Avatar images are publicly accessible."
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar."
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Voice notes are publicly accessible."
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'voice_notes' );

CREATE POLICY "Anyone can upload a voice note."
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'voice_notes' AND auth.role() = 'authenticated' );
