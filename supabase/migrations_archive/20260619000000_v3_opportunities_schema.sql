-- ================================================================
-- MATISA V3 PRODUCT OVERHAUL - OPPORTUNITIES & CREW LAYER
-- ================================================================

-- 1. CREW PROFILES
-- Dedicated marketplace layer for creators
create table public.crew_profiles (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  categories text[] not null, -- e.g., ['Videographer', 'Editor', 'Model']
  availability_status text default 'available' check(availability_status in ('available', 'busy', 'open_to_collab')),
  portfolio_url text,
  hourly_rate numeric(10,2),
  years_experience integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. OPPORTUNITIES
-- Replaces traditional social posts for finding talent / gigs
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  type text not null check(type in ('job', 'gig', 'collab', 'casting_call', 'crew_request', 'talent_request')),
  role_needed text, -- e.g., 'Videographer', 'Makeup Artist'
  location_name text,
  location geography(POINT, 4326),
  is_remote boolean default false,
  budget_type text check(budget_type in ('paid', 'unpaid', 'tbd', 'revenue_share')),
  budget_amount numeric(10,2),
  status text default 'open' check(status in ('open', 'filled', 'closed')),
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now()
);

-- 3. OPPORTUNITY APPLICATIONS
create table public.opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  cover_message text,
  portfolio_link text,
  status text default 'pending' check(status in ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  unique(opportunity_id, applicant_id)
);

-- Add indexes for discovery
create index idx_opportunities_role on public.opportunities(role_needed);
create index idx_opportunities_type on public.opportunities(type);
create index idx_opportunities_status on public.opportunities(status);
create index idx_crew_profiles_categories on public.crew_profiles using gin(categories);

-- Enable RLS
alter table public.crew_profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_applications enable row level security;

-- Policies (Basic public reads, authenticated writes)
create policy "Public reads crew profiles" on public.crew_profiles for select using (true);
create policy "Users can insert own crew profile" on public.crew_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own crew profile" on public.crew_profiles for update using (auth.uid() = user_id);

create policy "Public reads opportunities" on public.opportunities for select using (true);
create policy "Users can insert opportunities" on public.opportunities for insert with check (auth.uid() = user_id);
create policy "Users can update own opportunities" on public.opportunities for update using (auth.uid() = user_id);
create policy "Users can delete own opportunities" on public.opportunities for delete using (auth.uid() = user_id);

create policy "Opportunity owners see applications" on public.opportunity_applications for select using (
  auth.uid() in (select user_id from public.opportunities where id = opportunity_id) or auth.uid() = applicant_id
);
create policy "Users can apply to opportunities" on public.opportunity_applications for insert with check (auth.uid() = applicant_id);
create policy "Opportunity owners can update applications" on public.opportunity_applications for update using (
  auth.uid() in (select user_id from public.opportunities where id = opportunity_id)
);
create policy "Users can delete own applications" on public.opportunity_applications for delete using (auth.uid() = applicant_id);
