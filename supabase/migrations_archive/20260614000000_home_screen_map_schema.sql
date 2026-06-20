-- ================================================================
-- Matisa — Home Screen Map Schema Migration
-- Adds location coordinates, activity tracking, and enables realtime
-- on profiles for the map discovery experience.
-- ================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS latitude FLOAT8,
ADD COLUMN IF NOT EXISTS longitude FLOAT8,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS activity_score INT4 DEFAULT 0;

-- Ensure profiles is broadcast via realtime
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
