-- Karaoke Rooms
CREATE TABLE IF NOT EXISTS public.karaoke_rooms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    host_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    is_private boolean DEFAULT false,
    is_live boolean DEFAULT true,
    started_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    ended_at timestamp with time zone,
    listeners_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.karaoke_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms are viewable by everyone."
    ON public.karaoke_rooms FOR SELECT
    USING ( true );

CREATE POLICY "Host can insert rooms."
    ON public.karaoke_rooms FOR INSERT
    WITH CHECK ( auth.uid() = host_id );

CREATE POLICY "Host can update rooms."
    ON public.karaoke_rooms FOR UPDATE
    USING ( auth.uid() = host_id );

-- Karaoke Participants (Singers / Queue)
CREATE TYPE public.participant_role AS ENUM ('singer', 'listener', 'queue');

CREATE TABLE IF NOT EXISTS public.karaoke_participants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id uuid REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role public.participant_role DEFAULT 'listener',
    is_singing boolean DEFAULT false,
    is_muted boolean DEFAULT true,
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.karaoke_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants are viewable by everyone."
    ON public.karaoke_participants FOR SELECT
    USING ( true );

CREATE POLICY "Users can join rooms."
    ON public.karaoke_participants FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own participant status."
    ON public.karaoke_participants FOR UPDATE
    USING ( auth.uid() = user_id );

CREATE POLICY "Host can update any participant status."
    ON public.karaoke_participants FOR UPDATE
    USING ( auth.uid() IN (SELECT host_id FROM public.karaoke_rooms WHERE id = room_id) );

CREATE POLICY "Users can leave rooms."
    ON public.karaoke_participants FOR DELETE
    USING ( auth.uid() = user_id );

CREATE POLICY "Host can kick participants."
    ON public.karaoke_participants FOR DELETE
    USING ( auth.uid() IN (SELECT host_id FROM public.karaoke_rooms WHERE id = room_id) );

-- Enable Realtime for these tables
-- We need to enable replication for karaoke_rooms and karaoke_participants
begin;
  -- remove the supabase_realtime publication
  drop publication if exists supabase_realtime;
  -- re-create it
  create publication supabase_realtime;
commit;

-- Add tables to the publication
alter publication supabase_realtime add table public.karaoke_rooms;
alter publication supabase_realtime add table public.karaoke_participants;
