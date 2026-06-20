-- ==========================================
-- 20260615000000_new_features_schema.sql
-- Missing Tables: notes, songs, playlists, voice_rooms, live_streams
-- Missing Buckets: voice_notes, stories_media, music
-- ==========================================

-- 1. Create Storage Buckets
insert into storage.buckets (id, name, public) values ('voice_notes', 'voice_notes', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('stories_media', 'stories_media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('music', 'music', true) on conflict (id) do nothing;

-- 2. Create Tables

-- Notes Table
create table if not exists public.notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    background_color text default '#000000',
    created_at timestamp with time zone default now() not null
);

-- Songs Table
create table if not exists public.songs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    artist text not null,
    cover_url text,
    audio_url text not null,
    play_count int default 0 not null,
    created_at timestamp with time zone default now() not null
);

-- Playlists Table
create table if not exists public.playlists (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    track_count int default 0 not null,
    is_public boolean default true not null,
    votes int default 0 not null,
    created_at timestamp with time zone default now() not null
);

-- Voice Rooms Table
create table if not exists public.voice_rooms (
    id uuid primary key default gen_random_uuid(),
    host_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    is_private boolean default false not null,
    participant_count int default 1 not null,
    created_at timestamp with time zone default now() not null
);

-- Live Streams Table
create table if not exists public.live_streams (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    viewer_count int default 0 not null,
    started_at timestamp with time zone default now() not null,
    ended_at timestamp with time zone,
    created_at timestamp with time zone default now() not null
);

-- 3. Enable RLS
alter table public.notes enable row level security;
alter table public.songs enable row level security;
alter table public.playlists enable row level security;
alter table public.voice_rooms enable row level security;
alter table public.live_streams enable row level security;

-- 4. Create RLS Policies

-- Notes
create policy "notes_read" on public.notes for select using (true);
create policy "notes_insert" on public.notes for insert with check (auth.uid() = user_id);
create policy "notes_update" on public.notes for update using (auth.uid() = user_id);
create policy "notes_delete" on public.notes for delete using (auth.uid() = user_id);

-- Songs
create policy "songs_read" on public.songs for select using (true);
create policy "songs_insert" on public.songs for insert with check (auth.uid() = user_id);
create policy "songs_update" on public.songs for update using (auth.uid() = user_id);
create policy "songs_delete" on public.songs for delete using (auth.uid() = user_id);

-- Playlists
create policy "playlists_read" on public.playlists for select using (true);
create policy "playlists_insert" on public.playlists for insert with check (auth.uid() = user_id);
create policy "playlists_update" on public.playlists for update using (auth.uid() = user_id);
create policy "playlists_delete" on public.playlists for delete using (auth.uid() = user_id);

-- Voice Rooms
create policy "voice_rooms_read" on public.voice_rooms for select using (true);
create policy "voice_rooms_insert" on public.voice_rooms for insert with check (auth.uid() = host_id);
create policy "voice_rooms_update" on public.voice_rooms for update using (auth.uid() = host_id);
create policy "voice_rooms_delete" on public.voice_rooms for delete using (auth.uid() = host_id);

-- Live Streams
create policy "live_streams_read" on public.live_streams for select using (true);
create policy "live_streams_insert" on public.live_streams for insert with check (auth.uid() = user_id);
create policy "live_streams_update" on public.live_streams for update using (auth.uid() = user_id);
create policy "live_streams_delete" on public.live_streams for delete using (auth.uid() = user_id);

-- Storage bucket policies (Public read, auth insert)
create policy "voice_notes_read" on storage.objects for select using (bucket_id = 'voice_notes');
create policy "voice_notes_insert" on storage.objects for insert with check (bucket_id = 'voice_notes' and auth.uid() = owner);

create policy "stories_media_read" on storage.objects for select using (bucket_id = 'stories_media');
create policy "stories_media_insert" on storage.objects for insert with check (bucket_id = 'stories_media' and auth.uid() = owner);

create policy "music_read" on storage.objects for select using (bucket_id = 'music');
create policy "music_insert" on storage.objects for insert with check (bucket_id = 'music' and auth.uid() = owner);

-- Add to publication for realtime
alter publication supabase_realtime add table notes, songs, playlists, voice_rooms, live_streams;
