create table if not exists public.live_streams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  viewer_count integer default 0 not null,
  started_at timestamptz default now() not null,
  ended_at timestamptz,
  created_at timestamptz default now() not null
);

-- Enable RLS and create default policies for live_streams
alter table public.live_streams enable row level security;
drop policy if exists "Allow read for everyone" on public.live_streams;
create policy "Allow read for everyone" on public.live_streams for select using (true);
drop policy if exists "Allow insert for auth users" on public.live_streams;
create policy "Allow insert for auth users" on public.live_streams for insert with check (auth.role() = 'authenticated');
drop policy if exists "Allow update for auth users" on public.live_streams;
create policy "Allow update for auth users" on public.live_streams for update using (auth.role() = 'authenticated');
drop policy if exists "Allow delete for auth users" on public.live_streams;
create policy "Allow delete for auth users" on public.live_streams for delete using (auth.role() = 'authenticated');

-- Grant permissions to Supabase roles on live_streams
grant select, insert, update, delete on public.live_streams to anon, authenticated, service_role;
