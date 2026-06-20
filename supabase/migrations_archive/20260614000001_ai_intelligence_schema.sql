-- ================================================================
-- matisa — AI Intelligence Layer Schema
-- ================================================================

-- ================================================================
-- TABLES
-- ================================================================

create table public.user_discovery_scores (
  user_id               uuid references public.profiles(id) on delete cascade not null,
  recommended_user_id   uuid references public.profiles(id) on delete cascade not null,
  score                 numeric(5,2) not null default 0.0,
  reasons               text[], -- e.g., ['mutual_interests', 'location']
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  primary key (user_id, recommended_user_id),
  check (user_id != recommended_user_id)
);

create table public.event_recommendations (
  user_id    uuid references public.profiles(id) on delete cascade not null,
  event_id   uuid references public.events(id) on delete cascade not null,
  score      numeric(5,2) not null default 0.0,
  reasons    text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, event_id)
);

create table public.account_risk_scores (
  user_id    uuid references public.profiles(id) on delete cascade primary key,
  risk_level text not null default 'low' check (risk_level in ('low','medium','high','critical')),
  score      numeric(5,2) not null default 0.0,
  flags      text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.safety_flags (
  id           uuid primary key default gen_random_uuid(),
  entity_type  text not null check (entity_type in ('profile','post','comment','story','message')),
  entity_id    uuid not null,
  flagged_by   uuid references public.profiles(id) on delete set null, -- null if AI flagged
  reason       text not null,
  status       text not null default 'pending' check (status in ('pending','reviewed','actioned','dismissed')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table public.creator_rankings (
  user_id        uuid references public.profiles(id) on delete cascade primary key,
  ranking_type   text not null check (ranking_type in ('rising','trending','to_watch')),
  score          numeric(5,2) not null default 0.0,
  velocity_score numeric(5,2) not null default 0.0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table public.profile_scores (
  user_id            uuid references public.profiles(id) on delete cascade primary key,
  completeness_score integer not null default 0,
  missing_sections   text[],
  recommendations    text[],
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create table public.search_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete set null,
  query      text not null,
  intent     text, -- AI inferred intent
  created_at timestamptz default now()
);

create table public.trending_searches (
  query       text primary key,
  count       integer default 1,
  trend_score numeric(5,2) default 0.0,
  updated_at  timestamptz default now()
);

create table public.notification_behavior (
  user_id           uuid references public.profiles(id) on delete cascade primary key,
  best_time_of_day  time,
  engagement_rate   numeric(5,2) default 0.0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table public.retention_predictions (
  user_id      uuid references public.profiles(id) on delete cascade primary key,
  churn_risk   numeric(5,2) not null default 0.0,
  factors      text[],
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  event_type  text not null, -- e.g., 'profile_view', 'search', 'discovery_click'
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz default now()
);

-- ================================================================
-- TRIGGERS & FUNCTIONS
-- ================================================================

create trigger handle_user_discovery_scores_updated_at before update on public.user_discovery_scores
  for each row execute procedure public.handle_updated_at();

create trigger handle_event_recommendations_updated_at before update on public.event_recommendations
  for each row execute procedure public.handle_updated_at();

create trigger handle_account_risk_scores_updated_at before update on public.account_risk_scores
  for each row execute procedure public.handle_updated_at();

create trigger handle_safety_flags_updated_at before update on public.safety_flags
  for each row execute procedure public.handle_updated_at();

create trigger handle_creator_rankings_updated_at before update on public.creator_rankings
  for each row execute procedure public.handle_updated_at();

create trigger handle_profile_scores_updated_at before update on public.profile_scores
  for each row execute procedure public.handle_updated_at();

create trigger handle_trending_searches_updated_at before update on public.trending_searches
  for each row execute procedure public.handle_updated_at();

create trigger handle_notification_behavior_updated_at before update on public.notification_behavior
  for each row execute procedure public.handle_updated_at();

create trigger handle_retention_predictions_updated_at before update on public.retention_predictions
  for each row execute procedure public.handle_updated_at();

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

alter table public.user_discovery_scores enable row level security;
alter table public.event_recommendations enable row level security;
alter table public.account_risk_scores enable row level security;
alter table public.safety_flags enable row level security;
alter table public.creator_rankings enable row level security;
alter table public.profile_scores enable row level security;
alter table public.search_history enable row level security;
alter table public.trending_searches enable row level security;
alter table public.notification_behavior enable row level security;
alter table public.retention_predictions enable row level security;
alter table public.analytics_events enable row level security;

-- Policies
create policy "scores_own_read" on public.user_discovery_scores for select using (auth.uid() = user_id);
create policy "event_recs_own_read" on public.event_recommendations for select using (auth.uid() = user_id);
create policy "creator_rankings_public_read" on public.creator_rankings for select using (true);
create policy "profile_scores_own_read" on public.profile_scores for select using (auth.uid() = user_id);
create policy "search_history_own_read" on public.search_history for select using (auth.uid() = user_id);
create policy "trending_searches_public_read" on public.trending_searches for select using (true);

-- Analytics events (users can write their own events)
create policy "analytics_auth_insert" on public.analytics_events for insert with check (auth.uid() = user_id);
