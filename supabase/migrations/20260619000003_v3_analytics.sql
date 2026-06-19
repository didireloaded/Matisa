-- ================================================================
-- MATISA ANALYTICS SCHEMA
-- ================================================================

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index analytics_events_type_idx on public.analytics_events(event_type);
create index analytics_events_user_idx on public.analytics_events(user_id);

create or replace function public.track_event(p_event_type text, p_event_data jsonb) returns void as $$
begin
  insert into public.analytics_events (user_id, event_type, event_data)
  values (auth.uid(), p_event_type, p_event_data);
end;
$$ language plpgsql security definer;
