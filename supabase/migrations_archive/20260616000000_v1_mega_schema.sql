-- ================================================================
-- MATISA BACKEND SYSTEM V1 MEGA SCHEMA
-- ================================================================

-- DROP ALL EXISTING TABLES FOR A CLEAN SLATE (Optional, uncomment to wipe)
drop publication if exists supabase_realtime;
drop schema public cascade;
create schema public;
grant all on schema public to postgres;
grant all on schema public to public;
set search_path to public, extensions;

create extension if not exists "uuid-ossp" schema extensions;
create extension if not exists "postgis" schema extensions;
create extension if not exists "pg_trgm" schema extensions;

-- ================================================================
-- FEATURE FLAGS MODULE
-- ================================================================
create table public.feature_flags (
  id text primary key,
  is_enabled boolean default false,
  description text,
  updated_at timestamptz default now()
);

insert into public.feature_flags (id, is_enabled, description) values
  ('notes_enabled', true, 'Enable 24h ephemeral notes'),
  ('stories_enabled', true, 'Enable 24h stories'),
  ('karaoke_enabled', true, 'Enable Karaoke rooms'),
  ('events_enabled', true, 'Enable Events creation and RSVP'),
  ('voice_enabled', true, 'Enable Live Voice rooms'),
  ('ai_enabled', true, 'Enable AI-powered feeds and moderation'),
  ('creator_mode_enabled', true, 'Enable creator monetization and analytics')
on conflict do nothing;

-- ================================================================
-- USER MODULE
-- ================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  full_name text,
  bio text,
  avatar_url text,
  cover_url text,
  gradient text,
  region text,
  city text,
  mood text,
  ghost_mode text default 'approximate' check (ghost_mode in ('hidden','approximate','exact')),
  location geography(POINT, 4326),
  location_updated_at timestamptz,
  xp integer default 0,
  level integer default 1,
  trust_score integer default 100,
  follower_count integer default 0,
  following_count integer default 0,
  post_count integer default 0,
  latitude numeric,
  longitude numeric,
  last_seen timestamptz,
  activity_score numeric(5,2) default 0.00,
  voice_intro_url text,
  voice_intro_duration integer,
  voice_intro_waveform jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.user_settings (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  push_notifications_enabled boolean default true,
  email_notifications_enabled boolean default true,
  theme text default 'dark',
  language text default 'en',
  updated_at timestamptz default now()
);

create table public.user_scores (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  trust_score numeric(5,2) default 1.00,
  retention_score numeric(5,2) default 1.00,
  activity_score numeric(5,2) default 0.00,
  updated_at timestamptz default now()
);

create table public.creator_profiles (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  is_verified boolean default false,
  creator_badge text,
  stripe_account_id text,
  monetization_enabled boolean default false,
  subscription_price numeric(10,2),
  created_at timestamptz default now()
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  document_url text not null,
  status text default 'pending' check(status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create table public.voice_rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid references public.profiles(id) on delete cascade not null,
  livekit_room_id text,
  is_private boolean default false,
  status text default 'active' check(status in ('active','ended')),
  started_at timestamptz default now(),
  ended_at timestamptz
);

create table public.user_presence (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  status text default 'online' check(status in ('online','away','offline','do_not_disturb')),
  last_seen_at timestamptz default now(),
  current_room_id uuid references public.voice_rooms(id) on delete set null
);

create table public.blocked_users (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

create table public.muted_users (
  muter_id uuid references public.profiles(id) on delete cascade,
  muted_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (muter_id, muted_id)
);

-- ================================================================
-- SOCIAL GRAPH MODULE
-- ================================================================
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create table public.friends (
  user_id_1 uuid references public.profiles(id) on delete cascade,
  user_id_2 uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id_1, user_id_2)
);

create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check(status in ('pending','accepted','declined')),
  created_at timestamptz default now()
);

create table public.profile_views (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid references public.profiles(id) on delete cascade,
  viewed_id uuid references public.profiles(id) on delete cascade not null,
  viewed_at timestamptz default now()
);

-- ================================================================
-- POSTS MODULE (Legacy but necessary)
-- ================================================================
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  media_urls text[],
  like_count int default 0,
  comment_count int default 0,
  created_at timestamptz default now()
);

-- ================================================================
-- NOTES MODULE
-- ================================================================
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  type text default 'text' check (type in ('text', 'voice')),
  audio_url text,
  duration_seconds integer,
  waveform_data jsonb,
  heart_count integer default 0,
  fire_count integer default 0,
  laugh_count integer default 0,
  expires_at timestamptz default (now() + interval '24 hours'),
  created_at timestamptz default now()
);

create table public.note_reactions (
  note_id uuid references public.notes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reaction_type text check (reaction_type in ('heart', 'fire', 'laugh')) not null,
  created_at timestamptz default now(),
  primary key (note_id, user_id, reaction_type)
);

create table public.note_reports (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references public.notes(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  reason text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table public.live_streams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  viewer_count integer default 0 not null,
  started_at timestamptz default now() not null,
  ended_at timestamptz,
  created_at timestamptz default now() not null
);

-- ================================================================
-- STORIES MODULE
-- ================================================================
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  media_url text not null,
  media_type text default 'image' check (media_type in ('image','video','audio','text','voice')),
  caption text,
  gradient text,
  expires_at timestamptz default (now() + interval '24 hours'),
  created_at timestamptz default now()
);

create table if not exists public.relationship_scores (
  user_a_id uuid references public.profiles(id) on delete cascade,
  user_b_id uuid references public.profiles(id) on delete cascade,
  score float default 0.0,
  last_interaction_at timestamptz default now(),
  primary key (user_a_id, user_b_id)
);

create table public.story_views (
  story_id uuid references public.stories(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete cascade,
  viewed_at timestamptz default now(),
  primary key (story_id, viewer_id)
);

create table public.story_reactions (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reaction text not null,
  created_at timestamptz default now()
);

-- ================================================================
-- MESSAGING MODULE
-- ================================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean default false,
  group_name text,
  group_avatar text,
  created_by uuid references public.profiles(id),
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

create table public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  is_admin boolean default false,
  joined_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  content text,
  media_url text,
  media_type text check (media_type in ('image','video','voice','file')),
  is_edited boolean default false,
  is_deleted boolean default false,
  created_at timestamptz default now()
);

create table public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.messages(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reaction text not null,
  created_at timestamptz default now()
);

create table public.message_reads (
  message_id uuid references public.messages(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  read_at timestamptz default now(),
  primary key (message_id, user_id)
);

create table public.story_replies (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories(id) on delete cascade not null,
  message_id uuid references public.messages(id) on delete cascade not null
);

-- ================================================================
-- VOICE MODULE
-- ================================================================
create table public.voice_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  audio_url text not null,
  duration numeric not null,
  created_at timestamptz default now()
);

create table public.voice_reactions (
  id uuid primary key default gen_random_uuid(),
  voice_note_id uuid references public.voice_notes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reaction text not null,
  created_at timestamptz default now()
);

create table public.voice_story_replies (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories(id) on delete cascade not null,
  voice_note_id uuid references public.voice_notes(id) on delete cascade not null
);

create table public.profile_voice_intros (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  audio_url text not null,
  duration numeric not null,
  created_at timestamptz default now()
);

-- ================================================================
-- ROOM MODULE (Continued)
-- ================================================================
create table public.voice_room_members (
  room_id uuid references public.voice_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  left_at timestamptz,
  primary key (room_id, user_id)
);

create table public.voice_room_roles (
  room_id uuid references public.voice_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null check(role in ('host','speaker','listener')),
  granted_at timestamptz default now(),
  primary key (room_id, user_id)
);

create table public.room_reactions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.voice_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reaction text not null,
  created_at timestamptz default now()
);

create table public.room_chat (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.voice_rooms(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamptz default now()
);

-- ================================================================
-- KARAOKE MODULE
-- ================================================================
create table public.karaoke_rooms (
  id uuid references public.voice_rooms(id) on delete cascade primary key,
  current_singer_id uuid references public.profiles(id),
  current_song_title text,
  current_song_artist text,
  theme text
);

create table public.karaoke_participants (
  room_id uuid references public.karaoke_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  score numeric(5,2) default 0.00,
  primary key (room_id, user_id)
);

create table public.karaoke_queue (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.karaoke_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  song_title text not null,
  song_artist text not null,
  position int not null,
  status text default 'waiting' check(status in ('waiting','performing','completed','skipped')),
  created_at timestamptz default now()
);

create table public.karaoke_performances (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.karaoke_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  song_title text not null,
  song_artist text not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  final_score numeric(5,2)
);

create table public.karaoke_ratings (
  id uuid primary key default gen_random_uuid(),
  performance_id uuid references public.karaoke_performances(id) on delete cascade not null,
  rater_id uuid references public.profiles(id) on delete cascade not null,
  rating numeric(3,2) not null check(rating >= 0 and rating <= 5),
  created_at timestamptz default now()
);

create table public.karaoke_song_history (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.karaoke_rooms(id) on delete cascade not null,
  song_title text not null,
  song_artist text not null,
  played_at timestamptz default now()
);

-- ================================================================
-- EVENTS MODULE
-- ================================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  cover_url text,
  event_type text not null default 'in_person' check (event_type in ('in_person','karaoke','virtual')),
  location_name text,
  location geography(POINT, 4326),
  region text,
  start_time timestamptz not null,
  end_time timestamptz,
  is_free boolean default true,
  ticket_price numeric(10,2),
  ticket_link text,
  status text default 'upcoming' check(status in ('upcoming','ongoing','completed','cancelled')),
  category text,
  created_at timestamptz default now()
);

create table public.event_attendees (
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text default 'going' check(status in ('going','maybe','not_going')),
  created_at timestamptz default now(),
  primary key (event_id, user_id)
);

create table public.event_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  inviter_id uuid references public.profiles(id) on delete cascade not null,
  invitee_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check(status in ('pending','accepted','declined')),
  created_at timestamptz default now()
);

create table public.event_chat (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamptz default now()
);

create table public.event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  media_url text not null,
  media_type text not null,
  created_at timestamptz default now()
);

-- ================================================================
-- MUSIC MODULE
-- ================================================================
create table public.music_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  album_art_url text,
  preview_url text,
  external_id text,
  added_at timestamptz default now()
);

create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  cover_url text,
  is_public boolean default true,
  created_at timestamptz default now()
);

create table public.playlist_tracks (
  playlist_id uuid references public.playlists(id) on delete cascade,
  track_id uuid references public.music_tracks(id) on delete cascade,
  added_by uuid references public.profiles(id),
  position int not null,
  added_at timestamptz default now(),
  primary key (playlist_id, track_id)
);

create table public.user_music_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  favorite_genres text[],
  top_artists text[],
  updated_at timestamptz default now()
);

-- ================================================================
-- NOTIFICATIONS MODULE
-- ================================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  entity_id uuid,
  entity_type text,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  token text not null unique,
  platform text check(platform in ('ios','android','web')),
  device_id text,
  created_at timestamptz default now()
);

create table public.notification_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  likes boolean default true,
  comments boolean default true,
  follows boolean default true,
  messages boolean default true,
  event_invites boolean default true,
  karaoke_invites boolean default true
);

-- ================================================================
-- ANALYTICS MODULE
-- ================================================================
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null,
  event_properties jsonb,
  platform text,
  app_version text,
  created_at timestamptz default now()
);

create table public.screen_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  screen_name text not null,
  duration_seconds int,
  created_at timestamptz default now()
);

create table public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  started_at timestamptz default now(),
  ended_at timestamptz,
  device_info jsonb
);

create table public.retention_scores (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  score numeric(5,2) not null,
  risk_level text check(risk_level in ('low','medium','high')),
  calculated_at timestamptz default now()
);

-- ================================================================
-- MODERATION MODULE
-- ================================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  reported_id uuid references public.profiles(id) on delete cascade,
  entity_id uuid,
  entity_type text,
  reason text not null,
  status text default 'pending' check(status in ('pending','reviewed','resolved','dismissed')),
  created_at timestamptz default now()
);

create table public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  assigned_to uuid references auth.users(id),
  priority int default 1,
  status text default 'open',
  created_at timestamptz default now()
);

create table public.account_risk_scores (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  score numeric(5,2) default 0.00,
  flags text[],
  last_evaluated_at timestamptz default now()
);

create table public.safety_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  flag_type text not null,
  severity text check(severity in ('low','medium','high','critical')),
  description text,
  created_at timestamptz default now()
);

-- ================================================================
-- ROW LEVEL SECURITY (Generic Default Policies)
-- ================================================================
do $$ 
declare 
    r record;
begin
    for r in select tablename from pg_tables where schemaname = 'public' 
    loop
        execute 'alter table public.' || quote_ident(r.tablename) || ' enable row level security;';
        execute 'create policy "Allow read for everyone" on public.' || quote_ident(r.tablename) || ' for select using (true);';
        execute 'create policy "Allow insert for auth users" on public.' || quote_ident(r.tablename) || ' for insert with check (auth.role() = ''authenticated'');';
        execute 'create policy "Allow update for auth users" on public.' || quote_ident(r.tablename) || ' for update using (auth.role() = ''authenticated'');';
        execute 'create policy "Allow delete for auth users" on public.' || quote_ident(r.tablename) || ' for delete using (auth.role() = ''authenticated'');';
    end loop;
end $$;

-- ================================================================
-- STORAGE BUCKETS
-- ================================================================
insert into storage.buckets (id, name, public) values 
  ('avatars', 'avatars', true),
  ('profile_covers', 'profile_covers', true),
  ('stories', 'stories', true),
  ('posts', 'posts', true),
  ('videos', 'videos', true),
  ('voice_notes', 'voice_notes', true),
  ('voice_intros', 'voice_intros', true),
  ('event_media', 'event_media', true),
  ('karaoke_recordings', 'karaoke_recordings', true),
  ('message_media', 'message_media', false)
on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using (
  bucket_id in ('avatars', 'profile_covers', 'stories', 'posts', 'videos', 'voice_notes', 'voice_intros', 'event_media', 'karaoke_recordings')
);
create policy "Auth Insert" on storage.objects for insert with check (auth.role() = 'authenticated');
create policy "Auth Update" on storage.objects for update using (auth.role() = 'authenticated');
create policy "Auth Delete" on storage.objects for delete using (auth.role() = 'authenticated');

-- ================================================================
-- REALTIME
-- ================================================================
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table 
  messages, notifications, stories, story_reactions, notes, voice_rooms, karaoke_rooms, events, user_presence, room_chat, event_chat, karaoke_queue, karaoke_performances;

-- ================================================================
-- CORE DB FUNCTIONS (Triggers)
-- ================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, full_name)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))
  );
  -- Initialize settings & scores
  insert into public.user_settings (user_id) values (new.id);
  insert into public.user_scores (user_id) values (new.id);
  insert into public.user_presence (user_id) values (new.id);
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Gamification XP Incrementor
create or replace function public.increment_xp(user_uuid uuid, amount integer)
returns void as $$
declare
  current_xp integer;
  new_xp integer;
  new_level integer;
begin
  select xp into current_xp from public.profiles where id = user_uuid;
  if current_xp is null then return; end if;

  new_xp := current_xp + amount;
  -- Level curve
  new_level := floor(sqrt(new_xp / 50.0)) + 1;

  update public.profiles 
  set xp = new_xp, level = new_level
  where id = user_uuid;
end;
$$ language plpgsql security definer;

-- Triggers for XP on Post/Note creation
create or replace function public.trigger_xp_on_post()
returns trigger as $$
begin
  perform public.increment_xp(NEW.user_id, 5);
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_post_xp on public.posts;
create trigger on_post_xp
  after insert on public.posts
  for each row execute function public.trigger_xp_on_post();

create or replace function public.trigger_xp_on_note()
returns trigger as $$
begin
  perform public.increment_xp(NEW.user_id, 2);
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_note_xp on public.notes;
create trigger on_note_xp
  after insert on public.notes
  for each row execute function public.trigger_xp_on_note();

-- Note reactions increment/decrement triggers
create or replace function public.increment_note_reaction() returns trigger as $$
begin
  if new.reaction_type = 'heart' then
    update public.notes set heart_count = heart_count + 1 where id = new.note_id;
  elsif new.reaction_type = 'fire' then
    update public.notes set fire_count = fire_count + 1 where id = new.note_id;
  elsif new.reaction_type = 'laugh' then
    update public.notes set laugh_count = laugh_count + 1 where id = new.note_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_note_reaction_insert on public.note_reactions;
create trigger on_note_reaction_insert 
  after insert on public.note_reactions
  for each row execute procedure public.increment_note_reaction();

create or replace function public.decrement_note_reaction() returns trigger as $$
begin
  if old.reaction_type = 'heart' then
    update public.notes set heart_count = greatest(0, heart_count - 1) where id = old.note_id;
  elsif old.reaction_type = 'fire' then
    update public.notes set fire_count = greatest(0, fire_count - 1) where id = old.note_id;
  elsif old.reaction_type = 'laugh' then
    update public.notes set laugh_count = greatest(0, laugh_count - 1) where id = old.note_id;
  end if;
  return old;
end;
$$ language plpgsql security definer;

drop trigger if exists on_note_reaction_delete on public.note_reactions;
create trigger on_note_reaction_delete 
  after delete on public.note_reactions
  for each row execute procedure public.decrement_note_reaction();

-- Follow/Unfollow helper functions
create or replace function public.follow_user(p_follower uuid, p_following uuid)
returns void as $$
begin
  insert into public.follows(follower_id, following_id) values(p_follower, p_following) on conflict do nothing;
  update public.profiles set following_count = following_count + 1 where id = p_follower;
  update public.profiles set follower_count  = follower_count  + 1 where id = p_following;
end; $$ language plpgsql security definer;

create or replace function public.unfollow_user(p_follower uuid, p_following uuid)
returns void as $$
begin
  delete from public.follows where follower_id = p_follower and following_id = p_following;
  update public.profiles set following_count = greatest(0, following_count - 1) where id = p_follower;
  update public.profiles set follower_count  = greatest(0, follower_count  - 1) where id = p_following;
end; $$ language plpgsql security definer;

-- Discovery Feed RPC Function
create or replace function public.get_discovery_feed(viewer_id uuid, limit_count int default 20)
returns table (
  note_id uuid,
  user_id uuid,
  content text,
  type text,
  audio_url text,
  duration_seconds integer,
  heart_count integer,
  fire_count integer,
  laugh_count integer,
  created_at timestamptz,
  author_username text,
  author_display_name text,
  author_avatar_url text,
  author_level integer,
  author_trust_score integer,
  discovery_score float
) as $$
begin
  return query
    select 
      n.id as note_id,
      n.user_id,
      n.content,
      n.type,
      n.audio_url,
      n.duration_seconds,
      n.heart_count,
      n.fire_count,
      n.laugh_count,
      n.created_at,
      prof.username as author_username,
      prof.display_name as author_display_name,
      prof.avatar_url as author_avatar_url,
      prof.level as author_level,
      prof.trust_score as author_trust_score,
      
      -- Algorithmic Weighting
      (
        (n.heart_count * 2.0) + 
        (n.fire_count * 3.0) + 
        (prof.trust_score * 0.1) + 
        (coalesce(rs.score, 0) * 10.0) - 
        (extract(epoch from (now() - n.created_at))/3600.0 * 0.5) -- time decay
      )::float as discovery_score

    from public.notes n
    join public.profiles prof on n.user_id = prof.id
    left join public.relationship_scores rs 
      on (rs.user_a_id = viewer_id and rs.user_b_id = n.user_id) 
      or (rs.user_a_id = n.user_id and rs.user_b_id = viewer_id)
    where n.created_at > now() - interval '7 days'
    order by discovery_score desc
    limit limit_count;
end;
$$ language plpgsql security definer;

-- Grant permissions to Supabase roles on the public schema
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
