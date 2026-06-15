-- ================================================================
-- matisa — Namibian Social Platform
-- Complete Master Schema (Profiles, Notes, Voice Rooms, Communities, Events)
-- ================================================================

-- 1. DROP EXISTING TABLES TO WIPE DATABASE (Caution: Data will be lost)
-- Run these drops first to get a completely clean slate
drop publication if exists supabase_realtime;
drop table if exists public.blocks cascade;
drop table if exists public.notifications cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversation_members cascade;
drop table if exists public.conversations cascade;
drop table if exists public.community_members cascade;
drop table if exists public.communities cascade;
drop table if exists public.event_rsvps cascade;
drop table if exists public.events cascade;
drop table if exists public.story_views cascade;
drop table if exists public.stories cascade;
drop table if exists public.comment_likes cascade;
drop table if exists public.post_comments cascade;
drop table if exists public.post_saves cascade;
drop table if exists public.post_likes cascade;
drop table if exists public.follows cascade;
drop table if exists public.posts cascade;
drop table if exists public.profile_interests cascade;
drop table if exists public.notes cascade;
drop table if exists public.voice_rooms cascade;
drop table if exists public.profiles cascade;

create extension if not exists "uuid-ossp";
create extension if not exists "postgis";
create extension if not exists "pg_trgm";

-- ================================================================
-- TABLES
-- ================================================================

create table public.profiles (
  id                uuid references auth.users on delete cascade primary key,
  username          text unique not null,
  display_name      text not null,
  full_name         text,
  bio               text,
  avatar_url        text,
  cover_url         text,
  gradient          text,
  region            text,
  city              text,
  mood              text,
  song_title        text,
  song_artist       text,
  creator_badge     text,
  is_creator        boolean default false,
  is_verified       boolean default false,
  is_plus           boolean default false,
  voice_intro_url   text,
  voice_intro_duration numeric,
  ghost_mode        text default 'approximate' check (ghost_mode in ('hidden','approximate','exact')),
  location          geography(POINT, 4326),
  location_updated_at timestamptz,
  follower_count    integer default 0,
  following_count   integer default 0,
  post_count        integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table public.profile_interests (
  profile_id uuid references public.profiles(id) on delete cascade,
  interest   text not null,
  primary key (profile_id, interest)
);

create table public.posts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade not null,
  content          text,
  type             text not null default 'text' check (type in ('text','photo','video','voice','reel','poll','location')),
  media_urls       text[],
  voice_url        text,
  voice_duration   numeric,
  region           text,
  location         geography(POINT, 4326),
  location_name    text,
  like_count       integer default 0,
  comment_count    integer default 0,
  repost_count     integer default 0,
  save_count       integer default 0,
  is_repost        boolean default false,
  original_post_id uuid references public.posts(id) on delete set null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table public.follows (
  follower_id  uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

create table public.post_likes (
  user_id    uuid references public.profiles(id) on delete cascade,
  post_id    uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

create table public.post_saves (
  user_id    uuid references public.profiles(id) on delete cascade,
  post_id    uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

create table public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references public.posts(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  content    text not null,
  like_count integer default 0,
  created_at timestamptz default now()
);

create table public.comment_likes (
  user_id    uuid references public.profiles(id) on delete cascade,
  comment_id uuid references public.post_comments(id) on delete cascade,
  primary key (user_id, comment_id)
);

create table public.stories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  media_url  text not null,
  media_type text default 'image' check (media_type in ('image','video','audio')),
  caption    text,
  gradient   text,
  expires_at timestamptz default (now() + interval '24 hours'),
  view_count integer default 0,
  created_at timestamptz default now()
);

create table public.story_views (
  story_id  uuid references public.stories(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete cascade,
  viewed_at timestamptz default now(),
  primary key (story_id, viewer_id)
);

create table public.communities (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text unique not null,
  description  text,
  cover_url    text,
  region       text unique,
  category     text,
  member_count integer default 0,
  post_count   integer default 0,
  created_at   timestamptz default now()
);

create table public.community_members (
  community_id uuid references public.communities(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete cascade,
  joined_at    timestamptz default now(),
  primary key (community_id, user_id)
);

create table public.events (
  id            uuid primary key default gen_random_uuid(),
  created_by    uuid references public.profiles(id) on delete cascade not null,
  community_id  uuid references public.communities(id) on delete set null,
  title         text not null,
  description   text,
  cover_url     text,
  event_type    text not null default 'in_person' check (event_type in ('in_person','karaoke','virtual')),
  location_name text,
  location      geography(POINT, 4326),
  region        text,
  start_time    timestamptz not null,
  end_time      timestamptz,
  rsvp_count    integer default 0,
  interested_count integer default 0,
  is_free       boolean default true,
  ticket_price  numeric(10,2),
  ticket_link   text,
  has_tickets   boolean default false,
  has_event_chat boolean default false,
  category      text,
  created_at    timestamptz default now()
);

create table public.event_rsvps (
  event_id   uuid references public.events(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (event_id, user_id)
);

create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  is_group        boolean default false,
  group_name      text,
  group_avatar    text,
  created_by      uuid references public.profiles(id),
  last_message    text,
  last_message_at timestamptz,
  created_at      timestamptz default now()
);

create table public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete cascade,
  is_admin        boolean default false,
  last_read_at    timestamptz default now(),
  joined_at       timestamptz default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id       uuid references public.profiles(id) not null,
  content         text,
  media_url       text,
  media_type      text check (media_type in ('image','video','voice','gif')),
  gif_url         text,
  reply_to_id     uuid references public.messages(id) on delete set null,
  is_edited       boolean default false,
  is_deleted      boolean default false,
  created_at      timestamptz default now()
);

create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  actor_id     uuid references public.profiles(id) on delete cascade,
  type         text not null check (type in (
    'like','comment','follow','repost','mention','message','event_rsvp','community_post'
  )),
  entity_id    uuid,
  entity_type  text,
  body         text,
  is_read      boolean default false,
  created_at   timestamptz default now()
);

create table public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

-- NEW: Notes
create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  content    text not null,
  created_at timestamptz default now()
);

-- NEW: Voice Rooms
create table public.voice_rooms (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  created_by        uuid references public.profiles(id) on delete cascade not null,
  is_private        boolean default false,
  participant_count integer default 0,
  created_at        timestamptz default now()
);

-- ================================================================
-- INDEXES
-- ================================================================

create index profiles_location_idx on public.profiles using gist(location);
create index posts_user_created_idx on public.posts(user_id, created_at desc);
create index posts_region_created_idx on public.posts(region, created_at desc);
create index posts_created_idx on public.posts(created_at desc);
create index follows_follower_idx on public.follows(follower_id);
create index follows_following_idx on public.follows(following_id);
create index messages_conv_created_idx on public.messages(conversation_id, created_at);
create index conv_members_user_idx on public.conversation_members(user_id);
create index notifications_recipient_idx on public.notifications(recipient_id, is_read, created_at desc);
create index stories_user_expires_idx on public.stories(user_id, expires_at);
create index profiles_username_trgm on public.profiles using gin(username gin_trgm_ops);
create index profiles_name_trgm on public.profiles using gin(display_name gin_trgm_ops);
create index posts_content_trgm on public.posts using gin(content gin_trgm_ops);
create index notes_created_idx on public.notes(created_at desc);
create index voice_rooms_created_idx on public.voice_rooms(created_at desc);

-- ================================================================
-- FUNCTIONS
-- ================================================================

create or replace function public.handle_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;

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
  return new;
end; $$ language plpgsql security definer;

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

create or replace function public.rsvp_event(p_event_id uuid, p_user_id uuid)
returns void as $$
begin
  insert into public.event_rsvps(event_id, user_id) values(p_event_id, p_user_id) on conflict do nothing;
  update public.events set rsvp_count = rsvp_count + 1 where id = p_event_id;
end; $$ language plpgsql security definer;

create or replace function public.unrsvp_event(p_event_id uuid, p_user_id uuid)
returns void as $$
begin
  delete from public.event_rsvps where event_id = p_event_id and user_id = p_user_id;
  update public.events set rsvp_count = greatest(0, rsvp_count - 1) where id = p_event_id;
end; $$ language plpgsql security definer;

create or replace function public.join_community(p_community_id uuid, p_user_id uuid)
returns void as $$
begin
  insert into public.community_members(community_id, user_id) values(p_community_id, p_user_id) on conflict do nothing;
  update public.communities set member_count = member_count + 1 where id = p_community_id;
end; $$ language plpgsql security definer;

create or replace function public.leave_community(p_community_id uuid, p_user_id uuid)
returns void as $$
begin
  delete from public.community_members where community_id = p_community_id and user_id = p_user_id;
  update public.communities set member_count = greatest(0, member_count - 1) where id = p_community_id;
end; $$ language plpgsql security definer;

create or replace function public.get_or_create_dm(p_user_a uuid, p_user_b uuid)
returns uuid as $$
declare v_conv_id uuid;
begin
  select c.id into v_conv_id
  from public.conversations c
  join public.conversation_members m1 on m1.conversation_id = c.id and m1.user_id = p_user_a
  join public.conversation_members m2 on m2.conversation_id = c.id and m2.user_id = p_user_b
  where c.is_group = false limit 1;

  if v_conv_id is null then
    insert into public.conversations(is_group, created_by) values(false, p_user_a) returning id into v_conv_id;
    insert into public.conversation_members(conversation_id, user_id) values(v_conv_id, p_user_a),(v_conv_id, p_user_b);
  end if;
  return v_conv_id;
end; $$ language plpgsql security definer;

create or replace function public.get_nearby_users(
  p_lat double precision, p_lng double precision,
  p_radius integer default 5000, p_user_id uuid default null
) returns table(
  id uuid, username text, display_name text, avatar_url text, region text, city text,
  mood text, ghost_mode text, distance_m double precision
) as $$
begin
  return query
  select p.id, p.username, p.display_name, p.avatar_url, p.region, p.city, p.mood, p.ghost_mode,
    ST_Distance(p.location, ST_MakePoint(p_lng, p_lat)::geography) as distance_m
  from public.profiles p
  where p.location is not null
    and p.ghost_mode != 'hidden'
    and ST_DWithin(p.location, ST_MakePoint(p_lng, p_lat)::geography, p_radius)
    and p.id != coalesce(p_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and not exists(select 1 from public.blocks b where
      (b.blocker_id = p_user_id and b.blocked_id = p.id) or
      (b.blocker_id = p.id and b.blocked_id = p_user_id))
  order by distance_m asc limit 50;
end; $$ language plpgsql security definer;

create or replace function public.is_username_available(p_username text)
returns boolean as $$
begin return not exists(select 1 from public.profiles where lower(username) = lower(p_username)); end;
$$ language plpgsql security definer;

create or replace function public.get_trending_posts(p_region text default null, p_limit integer default 20)
returns setof public.posts as $$
begin
  return query select * from public.posts
  where created_at > now() - interval '48 hours'
    and (p_region is null or region = p_region)
  order by (like_count * 3 + comment_count * 2 + repost_count * 4) desc, created_at desc
  limit p_limit;
end; $$ language plpgsql security definer;

-- Auto-notifications
create or replace function public.notify_on_like() returns trigger as $$
declare v_owner uuid;
begin
  select user_id into v_owner from public.posts where id = new.post_id;
  if v_owner != new.user_id then
    insert into public.notifications(recipient_id, actor_id, type, entity_id, entity_type)
    values(v_owner, new.user_id, 'like', new.post_id, 'post');
  end if;
  update public.posts set like_count = like_count + 1 where id = new.post_id;
  return new;
end; $$ language plpgsql security definer;

create or replace function public.notify_on_unlike() returns trigger as $$
begin
  update public.posts set like_count = greatest(0, like_count - 1) where id = old.post_id;
  return old;
end; $$ language plpgsql security definer;

create or replace function public.notify_on_comment() returns trigger as $$
declare v_owner uuid;
begin
  select user_id into v_owner from public.posts where id = new.post_id;
  if v_owner != new.user_id then
    insert into public.notifications(recipient_id, actor_id, type, entity_id, entity_type, body)
    values(v_owner, new.user_id, 'comment', new.post_id, 'post', left(new.content, 80));
  end if;
  update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  return new;
end; $$ language plpgsql security definer;

create or replace function public.notify_on_follow() returns trigger as $$
begin
  insert into public.notifications(recipient_id, actor_id, type, entity_id, entity_type)
  values(new.following_id, new.follower_id, 'follow', new.following_id, 'profile');
  return new;
end; $$ language plpgsql security definer;

create or replace function public.handle_post_count() returns trigger as $$
begin
  if TG_OP = 'INSERT' then update public.profiles set post_count = post_count + 1 where id = new.user_id;
  elsif TG_OP = 'DELETE' then update public.profiles set post_count = greatest(0, post_count - 1) where id = old.user_id;
  end if;
  return coalesce(new, old);
end; $$ language plpgsql;

create or replace function public.handle_story_view() returns trigger as $$
begin update public.stories set view_count = view_count + 1 where id = new.story_id; return new; end;
$$ language plpgsql;

create or replace function public.update_conversation_last_message() returns trigger as $$
begin
  update public.conversations
  set last_message = coalesce(new.content, new.media_type, 'Attachment'),
      last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end; $$ language plpgsql;

-- ================================================================
-- TRIGGERS
-- ================================================================

create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_posts_updated_at before update on public.posts
  for each row execute procedure public.handle_updated_at();

create trigger on_post_like after insert on public.post_likes
  for each row execute procedure public.notify_on_like();

create trigger on_post_unlike after delete on public.post_likes
  for each row execute procedure public.notify_on_unlike();

create trigger on_comment_insert after insert on public.post_comments
  for each row execute procedure public.notify_on_comment();

create trigger on_follow_insert after insert on public.follows
  for each row execute procedure public.notify_on_follow();

create trigger on_post_insert after insert on public.posts
  for each row execute procedure public.handle_post_count();

create trigger on_post_delete after delete on public.posts
  for each row execute procedure public.handle_post_count();

create trigger on_story_view after insert on public.story_views
  for each row execute procedure public.handle_story_view();

create trigger on_message_insert after insert on public.messages
  for each row execute procedure public.update_conversation_last_message();

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

alter table public.profiles enable row level security;
alter table public.profile_interests enable row level security;
alter table public.posts enable row level security;
alter table public.follows enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_saves enable row level security;
alter table public.post_comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.stories enable row level security;
alter table public.story_views enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.blocks enable row level security;
alter table public.notes enable row level security;
alter table public.voice_rooms enable row level security;

-- Profiles
create policy "profiles_public_read"   on public.profiles for select using (true);
create policy "profiles_own_insert"    on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_own_update"    on public.profiles for update using (auth.uid() = id);
-- Interests
create policy "interests_public_read"  on public.profile_interests for select using (true);
create policy "interests_own_write"    on public.profile_interests for insert with check (auth.uid() = profile_id);
create policy "interests_own_delete"   on public.profile_interests for delete using (auth.uid() = profile_id);
-- Posts
create policy "posts_public_read"      on public.posts for select using (true);
create policy "posts_auth_insert"      on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_own_update"       on public.posts for update using (auth.uid() = user_id);
create policy "posts_own_delete"       on public.posts for delete using (auth.uid() = user_id);
-- Follows
create policy "follows_public_read"    on public.follows for select using (true);
create policy "follows_auth_insert"    on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_own_delete"     on public.follows for delete using (auth.uid() = follower_id);
-- Likes
create policy "likes_public_read"      on public.post_likes for select using (true);
create policy "likes_auth_insert"      on public.post_likes for insert with check (auth.uid() = user_id);
create policy "likes_own_delete"       on public.post_likes for delete using (auth.uid() = user_id);
-- Saves
create policy "saves_own_read"         on public.post_saves for select using (auth.uid() = user_id);
create policy "saves_auth_insert"      on public.post_saves for insert with check (auth.uid() = user_id);
create policy "saves_own_delete"       on public.post_saves for delete using (auth.uid() = user_id);
-- Comments
create policy "comments_public_read"   on public.post_comments for select using (true);
create policy "comments_auth_insert"   on public.post_comments for insert with check (auth.uid() = user_id);
create policy "comments_own_delete"    on public.post_comments for delete using (auth.uid() = user_id);
-- Comment likes
create policy "clikes_public_read"     on public.comment_likes for select using (true);
create policy "clikes_auth_insert"     on public.comment_likes for insert with check (auth.uid() = user_id);
create policy "clikes_own_delete"      on public.comment_likes for delete using (auth.uid() = user_id);
-- Stories
create policy "stories_active_read"    on public.stories for select using (expires_at > now());
create policy "stories_auth_insert"    on public.stories for insert with check (auth.uid() = user_id);
create policy "stories_own_delete"     on public.stories for delete using (auth.uid() = user_id);
-- Story views
create policy "sviews_own_read"        on public.story_views for select using (auth.uid() = viewer_id);
create policy "sviews_auth_insert"     on public.story_views for insert with check (auth.uid() = viewer_id);
-- Events
create policy "events_public_read"     on public.events for select using (true);
create policy "events_auth_insert"     on public.events for insert with check (auth.uid() = created_by);
create policy "events_own_update"      on public.events for update using (auth.uid() = created_by);
create policy "events_own_delete"      on public.events for delete using (auth.uid() = created_by);
-- Event RSVPs
create policy "rsvps_public_read"      on public.event_rsvps for select using (true);
create policy "rsvps_auth_insert"      on public.event_rsvps for insert with check (auth.uid() = user_id);
create policy "rsvps_own_delete"       on public.event_rsvps for delete using (auth.uid() = user_id);
-- Communities
create policy "communities_public_read" on public.communities for select using (true);
-- Community members
create policy "cmembers_public_read"   on public.community_members for select using (true);
create policy "cmembers_auth_insert"   on public.community_members for insert with check (auth.uid() = user_id);
create policy "cmembers_own_delete"    on public.community_members for delete using (auth.uid() = user_id);
-- Conversations (members only)
create policy "convs_member_read" on public.conversations for select using (
  exists(select 1 from public.conversation_members where conversation_id = conversations.id and user_id = auth.uid())
);
create policy "convs_auth_insert"      on public.conversations for insert with check (auth.uid() = created_by);
-- Conversation members
create policy "conv_members_read" on public.conversation_members for select using (
  exists(select 1 from public.conversation_members cm where cm.conversation_id = conversation_members.conversation_id and cm.user_id = auth.uid())
);
create policy "conv_members_insert"    on public.conversation_members for insert with check (
  auth.uid() = user_id or auth.uid() = (select created_by from public.conversations where id = conversation_id)
);
-- Messages (members only)
create policy "messages_member_read" on public.messages for select using (
  exists(select 1 from public.conversation_members where conversation_id = messages.conversation_id and user_id = auth.uid())
);
create policy "messages_member_insert" on public.messages for insert with check (
  auth.uid() = sender_id and
  exists(select 1 from public.conversation_members where conversation_id = messages.conversation_id and user_id = auth.uid())
);
create policy "messages_own_update"    on public.messages for update using (auth.uid() = sender_id);
-- Notifications
create policy "notifs_own_read"        on public.notifications for select using (auth.uid() = recipient_id);
create policy "notifs_system_insert"   on public.notifications for insert with check (true);
create policy "notifs_own_update"      on public.notifications for update using (auth.uid() = recipient_id);
-- Blocks
create policy "blocks_own_read"        on public.blocks for select using (auth.uid() = blocker_id);
create policy "blocks_auth_insert"     on public.blocks for insert with check (auth.uid() = blocker_id);
create policy "blocks_own_delete"      on public.blocks for delete using (auth.uid() = blocker_id);
-- Notes
create policy "notes_public_read"      on public.notes for select using (true);
create policy "notes_auth_insert"      on public.notes for insert with check (auth.uid() = user_id);
create policy "notes_own_delete"       on public.notes for delete using (auth.uid() = user_id);
-- Voice Rooms
create policy "voice_rooms_public_read" on public.voice_rooms for select using (not is_private);
create policy "voice_rooms_auth_insert" on public.voice_rooms for insert with check (auth.uid() = created_by);
create policy "voice_rooms_own_update"  on public.voice_rooms for update using (auth.uid() = created_by);
create policy "voice_rooms_own_delete"  on public.voice_rooms for delete using (auth.uid() = created_by);

-- ================================================================
-- SEED — 14 NAMIBIAN REGIONS + INTEREST COMMUNITIES
-- ================================================================

insert into public.communities (name, slug, description, region) values
  ('Khomas',        'khomas',       'The capital region — Windhoek.',                           'Khomas'),
  ('Erongo',        'erongo',       'Coastal region — Swakopmund and Walvis Bay.',              'Erongo'),
  ('Hardap',        'hardap',       'Southern Namibia — Mariental and Fish River Canyon.',      'Hardap'),
  ('//Karas',       'karas',        'Far south — Keetmanshoop and Lüderitz.',                   '//Karas'),
  ('Kavango East',  'kavango-east', 'North-east — Rundu and the Kavango River.',                'Kavango East'),
  ('Kavango West',  'kavango-west', 'North-west Kavango — Nkurenkuru.',                         'Kavango West'),
  ('Kunene',        'kunene',       'Remote north-west — Opuwo and the Kaokoveld.',             'Kunene'),
  ('Ohangwena',     'ohangwena',    'Far north — Eenhana and the Angolan border.',              'Ohangwena'),
  ('Omaheke',       'omaheke',      'East — Gobabis and the Kalahari.',                         'Omaheke'),
  ('Omusati',       'omusati',      'North-central — Outapi.',                                  'Omusati'),
  ('Oshana',        'oshana',       'North-central — Oshakati, the economic hub of the north.', 'Oshana'),
  ('Oshikoto',      'oshikoto',     'North-east central — Tsumeb.',                             'Oshikoto'),
  ('Otjozondjupa',  'otjozondjupa', 'Central-north — Otjiwarongo and Okahandja.',               'Otjozondjupa'),
  ('Zambezi',       'zambezi',      'Far north-east — Katima Mulilo.',                          'Zambezi')
on conflict (slug) do nothing;

insert into public.communities (name, slug, description, category) values
  ('Namibia Photography', 'photography', 'Photographers across all 14 regions.',     'Photography'),
  ('Namibia Music',       'music',        'The full spectrum of Namibian sound.',     'Music'),
  ('Namibia Film',        'film',         'Filmmakers, cinematographers, editors.',   'Film'),
  ('Namibia Tech',        'tech',         'Builders, developers, innovators.',        'Tech'),
  ('Namibia Fashion',     'fashion',      'Designers, stylists, trendsetters.',       'Fashion'),
  ('Namibia Cars',        'cars',         'Builds, road trips, car culture.',         'Cars'),
  ('Namibia Sports',      'sports',       'Football, athletics, everything sport.',   'Sports'),
  ('Namibia Food',        'food',         'Restaurants, braais, kapana culture.',     'Food')
on conflict (slug) do nothing;

-- ================================================================
-- STORAGE BUCKETS
-- ================================================================
insert into storage.buckets (id, name, public) values 
  ('avatars', 'avatars', true),
  ('covers', 'covers', true),
  ('posts-media', 'posts-media', true),
  ('voice-notes', 'voice-notes', true),
  ('story-media', 'story-media', true),
  ('event-covers', 'event-covers', true),
  ('media', 'media', true),
  ('message-media', 'message-media', false)
on conflict (id) do nothing;

-- Ensure public access to public buckets
create policy "Public Access" on storage.objects for select using (bucket_id in ('avatars', 'covers', 'posts-media', 'voice-notes', 'story-media', 'event-covers', 'media'));
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
alter publication supabase_realtime add table messages, notifications, stories, posts, notes, voice_rooms, events;
