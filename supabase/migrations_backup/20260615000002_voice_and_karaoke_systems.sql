-- ================================================================
-- Matisa — Voice & Karaoke Ecosystem Extensions
-- Adds Queueing, Performance Tracking, Room Types, and Reputation
-- ================================================================

-- 1. ENHANCE VOICE ROOMS WITH CATEGORIES
alter table public.voice_rooms
  add column if not exists category text default 'karaoke' check (category in ('karaoke', 'music', 'film', 'photography', 'gaming', 'business', 'creators', 'study', 'dating', 'open_mic')),
  add column if not exists current_singer_id uuid references public.profiles(id) on delete set null,
  add column if not exists current_song_id uuid references public.music_tracks(id) on delete set null,
  add column if not exists is_performing boolean default false;

-- 2. KARAOKE ROOM QUEUE
create table if not exists public.room_queue (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.voice_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  song_id uuid references public.music_tracks(id) on delete cascade,
  status text default 'waiting' check (status in ('waiting', 'performing', 'finished', 'skipped')),
  joined_at timestamptz default now(),
  started_at timestamptz,
  ended_at timestamptz,
  -- Ensure a user can only be in the queue once per room with 'waiting' status
  constraint one_active_queue_per_user unique (room_id, user_id, status) deferrable initially deferred
);

-- 3. KARAOKE PERFORMANCES & REALTIME REACTION COUNTS
create table if not exists public.karaoke_performances (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.voice_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  song_id uuid references public.music_tracks(id) on delete cascade,
  total_fire integer default 0,
  total_applause integer default 0,
  total_hearts integer default 0,
  performance_score numeric default 0.0, -- Calculated at end based on crowd interaction
  created_at timestamptz default now()
);

-- 4. USER REPUTATION & GAMIFICATION
create table if not exists public.user_reputation (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  level integer default 1,
  xp integer default 0,
  karaoke_wins integer default 0,
  karaoke_avg_score numeric default 0.0,
  trust_score integer default 50, -- 0-100 score
  risk_score integer default 0,   -- 0-100 score (hidden)
  updated_at timestamptz default now()
);

-- Automatically create a user_reputation row when a profile is created
create or replace function public.handle_new_reputation() returns trigger as $$
begin
  insert into public.user_reputation (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Attach to profiles (assuming it might not exist yet for old users, we will do an upsert later, but good for new users)
drop trigger if exists on_profile_created_reputation on public.profiles;
create trigger on_profile_created_reputation
  after insert on public.profiles
  for each row execute procedure public.handle_new_reputation();

-- Backfill reputation for existing profiles
insert into public.user_reputation (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- 5. RPC FUNCTIONS FOR ENGINE MECHANICS

-- Join the queue
create or replace function public.join_karaoke_queue(p_room_id uuid, p_user_id uuid, p_song_id uuid) returns public.room_queue as $$
declare
  v_queue public.room_queue;
begin
  insert into public.room_queue (room_id, user_id, song_id, status)
  values (p_room_id, p_user_id, p_song_id, 'waiting')
  returning * into v_queue;
  
  return v_queue;
end;
$$ language plpgsql security definer;

-- Promote next singer (Atomically grabs the oldest 'waiting' and sets them to 'performing')
create or replace function public.promote_next_singer(p_room_id uuid) returns public.room_queue as $$
declare
  v_next_queue public.room_queue;
begin
  -- Find the next waiting person
  select * into v_next_queue
  from public.room_queue
  where room_id = p_room_id and status = 'waiting'
  order by joined_at asc
  limit 1
  for update skip locked;

  if found then
    -- Mark as performing
    update public.room_queue
    set status = 'performing', started_at = now()
    where id = v_next_queue.id
    returning * into v_next_queue;

    -- Update the room state
    update public.voice_rooms
    set current_singer_id = v_next_queue.user_id,
        current_song_id = v_next_queue.song_id,
        is_performing = true
    where id = p_room_id;
  else
    -- No one left in queue, clear room state
    update public.voice_rooms
    set current_singer_id = null,
        current_song_id = null,
        is_performing = false
    where id = p_room_id;
  end if;

  return v_next_queue;
end;
$$ language plpgsql security definer;

-- End performance
create or replace function public.end_performance(p_queue_id uuid) returns void as $$
declare
  v_queue public.room_queue;
begin
  update public.room_queue
  set status = 'finished', ended_at = now()
  where id = p_queue_id
  returning * into v_queue;

  -- Create a historical performance record to track score
  if found then
    insert into public.karaoke_performances (room_id, user_id, song_id)
    values (v_queue.room_id, v_queue.user_id, v_queue.song_id);
    
    -- Clear room state (the host can then call promote_next_singer)
    update public.voice_rooms
    set current_singer_id = null,
        current_song_id = null,
        is_performing = false
    where id = v_queue.room_id;
  end if;
end;
$$ language plpgsql security definer;

-- 6. RLS POLICIES
alter table public.room_queue enable row level security;
alter table public.karaoke_performances enable row level security;
alter table public.user_reputation enable row level security;

create policy "Queue visible to all" on public.room_queue for select using (true);
create policy "Users can join queue" on public.room_queue for insert with check (auth.uid() = user_id);
create policy "Users can leave queue" on public.room_queue for delete using (auth.uid() = user_id);
create policy "Users can update own queue" on public.room_queue for update using (auth.uid() = user_id);

create policy "Performances visible to all" on public.karaoke_performances for select using (true);
create policy "Reputation visible to all" on public.user_reputation for select using (true);
