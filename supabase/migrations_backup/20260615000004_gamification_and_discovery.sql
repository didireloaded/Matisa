-- --------------------------------------------------------------------------------------
-- MEGA UPDATE: GAMIFICATION & DISCOVERY ENGINE
-- Priority 7 & Priority 8
-- --------------------------------------------------------------------------------------

-- 1. Alter Profiles for Gamification
alter table public.profiles
  add column if not exists xp integer default 0,
  add column if not exists level integer default 1,
  add column if not exists trust_score integer default 100;

-- 2. XP and Leveling Engine
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
  -- Level curve: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 300 XP, Level N = (N-1)*(N)/2 * 100
  -- Simple curve: Level = floor(sqrt(new_xp / 50)) + 1
  new_level := floor(sqrt(new_xp / 50.0)) + 1;

  update public.profiles 
  set xp = new_xp, level = new_level
  where id = user_uuid;
end;
$$ language plpgsql security definer;

-- Triggers for Gamification

-- On Post Create (+5 XP)
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

-- On Note Create (+2 XP)
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

-- 3. The Discovery Engine (Priority 8)
-- An algorithmic feed prioritizing strong relationships, high trust, and engagement.
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
