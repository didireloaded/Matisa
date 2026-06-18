-- Create Note Reactions table
create table if not exists public.note_reactions (
  note_id uuid references public.notes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reaction_type text check (reaction_type in ('heart', 'fire', 'laugh')) not null,
  created_at timestamptz default now(),
  primary key (note_id, user_id, reaction_type)
);

-- Enable RLS
alter table public.note_reactions enable row level security;

-- Policies
create policy "note_reactions_public_read" on public.note_reactions 
  for select using (true);

create policy "note_reactions_auth_insert" on public.note_reactions 
  for insert with check (auth.uid() = user_id);

create policy "note_reactions_own_delete" on public.note_reactions 
  for delete using (auth.uid() = user_id);

-- Add aggregated count columns to notes table to avoid heavy counting queries
alter table public.notes
  add column if not exists heart_count integer default 0,
  add column if not exists fire_count integer default 0,
  add column if not exists laugh_count integer default 0;

-- Trigger to increment counts
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

create trigger on_note_reaction_insert 
  after insert on public.note_reactions
  for each row execute procedure public.increment_note_reaction();

-- Trigger to decrement counts
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

create trigger on_note_reaction_delete 
  after delete on public.note_reactions
  for each row execute procedure public.decrement_note_reaction();
