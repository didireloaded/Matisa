-- Add location to Profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lat float8,
ADD COLUMN IF NOT EXISTS lng float8;

-- Create Communities Table
CREATE TABLE IF NOT EXISTS public.communities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    cover_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Communities
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Communities are viewable by everyone."
    ON public.communities FOR SELECT
    USING ( true );

CREATE POLICY "Authenticated users can insert communities."
    ON public.communities FOR INSERT
    WITH CHECK ( auth.role() = 'authenticated' );

-- Create Function for finding nearby users
CREATE OR REPLACE FUNCTION public.find_nearby_users(
  user_lat float8,
  user_lng float8,
  radius_meters float8
)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  lat float8,
  lng float8,
  distance float8
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM (
    SELECT 
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      p.lat,
      p.lng,
      (6371000 * acos(
        least(1.0, cos(radians(user_lat)) * cos(radians(p.lat)) * 
        cos(radians(p.lng) - radians(user_lng)) + 
        sin(radians(user_lat)) * sin(radians(p.lat)))
      )) AS distance
    FROM public.profiles p
    WHERE p.lat IS NOT NULL AND p.lng IS NOT NULL AND p.id != auth.uid()
  ) sub
  WHERE sub.distance <= radius_meters
  ORDER BY sub.distance ASC;
$$;

-- Insert Mock Communities (Namibian Context)
INSERT INTO public.communities (name, description, cover_url)
VALUES 
    ('Windhoek Nights', 'Nightlife and events in the capital city', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'),
    ('Namibian Creatives', 'A hub for artists, photographers, and musicians', 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80'),
    ('Amapiano Lovers', 'For the love of the log drum', 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?w=400&q=80'),
    ('Foodies WDH', 'Restaurant reviews and cooking tips in Windhoek', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80')
ON CONFLICT DO NOTHING;
