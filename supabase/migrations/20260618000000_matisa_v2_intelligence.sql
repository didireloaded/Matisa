-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-------------------------------------------------------------------------------
-- USER INTELLIGENCE & GRAPH TABLES
-------------------------------------------------------------------------------

CREATE TABLE public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  score NUMERIC DEFAULT 0,
  confidence NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, interest)
);

CREATE TABLE public.user_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship_score NUMERIC DEFAULT 0,
  message_score NUMERIC DEFAULT 0,
  event_score NUMERIC DEFAULT 0,
  room_score NUMERIC DEFAULT 0,
  voice_score NUMERIC DEFAULT 0,
  mutual_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);

CREATE TABLE public.user_behavior (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_frequency NUMERIC DEFAULT 0,
  voice_usage NUMERIC DEFAULT 0,
  rooms_joined_count INT DEFAULT 0,
  karaoke_participation_count INT DEFAULT 0,
  events_attended_count INT DEFAULT 0,
  last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_traits (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  traits JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- AI EMBEDDING TABLES (pgvector)
-------------------------------------------------------------------------------

CREATE TABLE public.user_embeddings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  embedding vector(1536),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Using HNSW index for fast semantic search
CREATE INDEX ON public.user_embeddings USING hnsw (embedding vector_cosine_ops);

CREATE TABLE public.note_embeddings (
  note_id UUID PRIMARY KEY REFERENCES public.posts(id) ON DELETE CASCADE,
  embedding vector(1536),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX ON public.note_embeddings USING hnsw (embedding vector_cosine_ops);

CREATE TABLE public.room_embeddings (
  room_id UUID PRIMARY KEY, -- Would reference a rooms table
  embedding vector(1536),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX ON public.room_embeddings USING hnsw (embedding vector_cosine_ops);

CREATE TABLE public.event_embeddings (
  event_id UUID PRIMARY KEY, -- Would reference an events table
  embedding vector(1536),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX ON public.event_embeddings USING hnsw (embedding vector_cosine_ops);

CREATE TABLE public.creator_embeddings (
  creator_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  embedding vector(1536),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX ON public.creator_embeddings USING hnsw (embedding vector_cosine_ops);

-------------------------------------------------------------------------------
-- ENGINE DATA STRUCTURES
-------------------------------------------------------------------------------

-- Opportunities
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  role_type TEXT NOT NULL, -- Jobs, Gigs, Collaborations, Casting Calls
  budget TEXT,
  location TEXT,
  description TEXT,
  voice_intro_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.opportunity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(opportunity_id, applicant_id)
);

CREATE TABLE public.talent_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  availability_status TEXT DEFAULT 'Available',
  hourly_rate NUMERIC,
  portfolio_url TEXT
);

-- Intelligence Scores
CREATE TABLE public.creator_analytics (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_score NUMERIC DEFAULT 0,
  growth_velocity NUMERIC DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  views_count INT DEFAULT 0,
  voice_influence NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.risk_scores (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  risk_level TEXT DEFAULT 'Low', -- Low, Medium, High, Critical
  spam_signals INT DEFAULT 0,
  bot_signals INT DEFAULT 0,
  moderation_flags INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.retention_scores (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  churn_risk TEXT DEFAULT 'Low', -- Low, Medium, High
  predicted_engagement NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room & Event Stats
CREATE TABLE public.room_statistics (
  room_id UUID PRIMARY KEY,
  total_participants INT DEFAULT 0,
  peak_listeners INT DEFAULT 0,
  fire_score INT DEFAULT 0,
  duration_seconds INT DEFAULT 0
);

CREATE TABLE public.event_predictions (
  event_id UUID PRIMARY KEY,
  predicted_attendance INT DEFAULT 0,
  community_relevance_score NUMERIC DEFAULT 0
);

-------------------------------------------------------------------------------
-- RLS POLICIES
-------------------------------------------------------------------------------
-- Note: As this is an internal intelligence engine, many of these tables will
-- be accessed via edge functions with service role keys.
-- We enable RLS and allow public read for opportunities, but lock down the rest.

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public opportunities are viewable by everyone."
  ON public.opportunities FOR SELECT
  USING ( true );

CREATE POLICY "Users can create opportunities."
  ON public.opportunities FOR INSERT
  WITH CHECK ( auth.uid() = creator_id );

CREATE POLICY "Users can view their own applications."
  ON public.opportunity_applications FOR SELECT
  USING ( auth.uid() = applicant_id );

CREATE POLICY "Opportunity creators can view applications."
  ON public.opportunity_applications FOR SELECT
  USING ( auth.uid() IN (SELECT creator_id FROM public.opportunities WHERE id = opportunity_id) );

CREATE POLICY "Users can create applications."
  ON public.opportunity_applications FOR INSERT
  WITH CHECK ( auth.uid() = applicant_id );

CREATE POLICY "Public talent profiles are viewable by everyone."
  ON public.talent_profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can update their own talent profile."
  ON public.talent_profiles FOR ALL
  USING ( auth.uid() = user_id );
