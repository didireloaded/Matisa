-- --------------------------------------------------------------------------------------
-- PRIORITY 4: THE SOCIAL GRAPH ENGINE
-- Invisible scoring mechanics that power Discovery and Profile Top Connections.
-- --------------------------------------------------------------------------------------

-- 1. Create the Relationship Scores Table
create table if not exists public.relationship_scores (
  id uuid default gen_random_uuid() primary key,
  user_a_id uuid references auth.users(id) on delete cascade not null,
  user_b_id uuid references auth.users(id) on delete cascade not null,
  score integer default 0 not null,
  last_interaction_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique pairs regardless of order by enforcing user_a_id < user_b_id
  constraint enforce_user_order check (user_a_id < user_b_id),
  unique(user_a_id, user_b_id)
);

-- RLS
alter table public.relationship_scores enable row level security;
create policy "Relationship scores are viewable by everyone" on public.relationship_scores for select using (true);
-- Mutations only happen via trigger or security definer functions.

-- 2. Atomic Increment Function
create or replace function public.increment_relationship_score(u1 uuid, u2 uuid, delta integer)
returns void as $$
declare
  uid_a uuid;
  uid_b uuid;
begin
  if u1 = u2 then
    return; -- No self-relationships
  end if;

  if u1 < u2 then
    uid_a := u1;
    uid_b := u2;
  else
    uid_a := u2;
    uid_b := u1;
  end if;

  insert into public.relationship_scores (user_a_id, user_b_id, score)
  values (uid_a, uid_b, delta)
  on conflict (user_a_id, user_b_id)
  do update set 
    score = public.relationship_scores.score + delta,
    last_interaction_at = timezone('utc'::text, now());
end;
$$ language plpgsql security definer;

-- 3. Triggers for automated Relationship Graph generation

-- A. On Note Reaction (+1)
create or replace function public.trigger_graph_on_note_reaction()
returns trigger as $$
declare
  note_author_id uuid;
begin
  select user_id into note_author_id from public.notes where id = NEW.note_id;
  if note_author_id is not null then
    perform public.increment_relationship_score(NEW.user_id, note_author_id, 1);
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_note_reaction_graph on public.note_reactions;
create trigger on_note_reaction_graph
  after insert on public.note_reactions
  for each row execute function public.trigger_graph_on_note_reaction();

-- B. On Follow (+5)
create or replace function public.trigger_graph_on_follow()
returns trigger as $$
begin
  perform public.increment_relationship_score(NEW.follower_id, NEW.following_id, 5);
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_follow_graph on public.follows;
create trigger on_follow_graph
  after insert on public.follows
  for each row execute function public.trigger_graph_on_follow();

-- C. On Karaoke Room Co-Attendance
-- When someone joins the queue, increase relationship with the host (+2)
create or replace function public.trigger_graph_on_queue_join()
returns trigger as $$
declare
  room_host_id uuid;
begin
  select host_id into room_host_id from public.voice_rooms where id = NEW.room_id;
  if room_host_id is not null then
    perform public.increment_relationship_score(NEW.user_id, room_host_id, 2);
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_queue_join_graph on public.room_queue;
create trigger on_queue_join_graph
  after insert on public.room_queue
  for each row execute function public.trigger_graph_on_queue_join();

-- 4. Get Top Connections RPC
create or replace function public.get_top_connections(uid uuid, limit_count int default 5)
returns table (
  connected_user_id uuid,
  score int,
  last_interaction_at timestamp with time zone
) as $$
begin
  return query
    select 
      case 
        when user_a_id = uid then user_b_id 
        else user_a_id 
      end as connected_user_id,
      public.relationship_scores.score,
      public.relationship_scores.last_interaction_at
    from public.relationship_scores
    where user_a_id = uid or user_b_id = uid
    order by public.relationship_scores.score desc
    limit limit_count;
end;
$$ language plpgsql security definer;
