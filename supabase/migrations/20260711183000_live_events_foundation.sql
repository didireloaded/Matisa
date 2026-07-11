-- ==============================================================================
-- MATISA LIVE EVENTS FOUNDATION MIGRATION (PHASE 1)
-- Forward-only corrective migration: safely creates or evolves tables without data loss.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Create or alter `events` table safely
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all required columns exist via forward-only additions
DO $$ 
BEGIN
    -- Core identity and ownership
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='host_id') THEN
        ALTER TABLE public.events ADD COLUMN host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='created_by') THEN
        ALTER TABLE public.events ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Descriptive fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='description') THEN
        ALTER TABLE public.events ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='cover_storage_path') THEN
        ALTER TABLE public.events ADD COLUMN cover_storage_path TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='cover_url') THEN
        ALTER TABLE public.events ADD COLUMN cover_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='category') THEN
        ALTER TABLE public.events ADD COLUMN category TEXT;
    END IF;

    -- Event classification & configuration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='event_type') THEN
        ALTER TABLE public.events ADD COLUMN event_type TEXT DEFAULT 'live_audio' CHECK (event_type IN ('live_video', 'live_audio', 'physical', 'hybrid'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='access_model') THEN
        ALTER TABLE public.events ADD COLUMN access_model TEXT DEFAULT 'free_public' CHECK (access_model IN ('free_public', 'free_private', 'invite_only', 'paid_ticket', 'free_with_tips'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='visibility') THEN
        ALTER TABLE public.events ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='status') THEN
        ALTER TABLE public.events ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'live', 'ended', 'cancelled'));
    END IF;

    -- Schedule & capacity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='start_at') THEN
        ALTER TABLE public.events ADD COLUMN start_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='end_at') THEN
        ALTER TABLE public.events ADD COLUMN end_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='timezone') THEN
        ALTER TABLE public.events ADD COLUMN timezone TEXT DEFAULT 'UTC';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='max_attendees') THEN
        ALTER TABLE public.events ADD COLUMN max_attendees INTEGER CHECK (max_attendees IS NULL OR max_attendees > 0);
    END IF;

    -- Financial
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='price_minor') THEN
        ALTER TABLE public.events ADD COLUMN price_minor BIGINT DEFAULT 0 CHECK (price_minor IS NULL OR price_minor >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='currency') THEN
        ALTER TABLE public.events ADD COLUMN currency TEXT DEFAULT 'NAD';
    END IF;

    -- Interactive toggles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='chat_enabled') THEN
        ALTER TABLE public.events ADD COLUMN chat_enabled BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='reactions_enabled') THEN
        ALTER TABLE public.events ADD COLUMN reactions_enabled BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='questions_enabled') THEN
        ALTER TABLE public.events ADD COLUMN questions_enabled BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='stage_requests_enabled') THEN
        ALTER TABLE public.events ADD COLUMN stage_requests_enabled BOOLEAN DEFAULT true;
    END IF;

    -- Recording & Replay
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='recording_enabled') THEN
        ALTER TABLE public.events ADD COLUMN recording_enabled BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='replay_policy') THEN
        ALTER TABLE public.events ADD COLUMN replay_policy TEXT DEFAULT 'none' CHECK (replay_policy IN ('none', 'host_only', 'ticket_holders', 'free_public'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='refund_policy') THEN
        ALTER TABLE public.events ADD COLUMN refund_policy JSONB;
    END IF;

    -- Technical / LiveKit / Location
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='livekit_room_name') THEN
        ALTER TABLE public.events ADD COLUMN livekit_room_name TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='location_name') THEN
        ALTER TABLE public.events ADD COLUMN location_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='location_address') THEN
        ALTER TABLE public.events ADD COLUMN location_address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='latitude') THEN
        ALTER TABLE public.events ADD COLUMN latitude DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='longitude') THEN
        ALTER TABLE public.events ADD COLUMN longitude DOUBLE PRECISION;
    END IF;

    -- Lifecycle timestamps
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='published_at') THEN
        ALTER TABLE public.events ADD COLUMN published_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='started_at') THEN
        ALTER TABLE public.events ADD COLUMN started_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='ended_at') THEN
        ALTER TABLE public.events ADD COLUMN ended_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='cancelled_at') THEN
        ALTER TABLE public.events ADD COLUMN cancelled_at TIMESTAMPTZ;
    END IF;
END $$;

-- Populate host_id from created_by if host_id is null
UPDATE public.events SET host_id = created_by WHERE host_id IS NULL AND created_by IS NOT NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_status_start_at ON public.events(status, start_at);
CREATE INDEX IF NOT EXISTS idx_events_host_id ON public.events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);

-- ------------------------------------------------------------------------------
-- 2. Create `event_hosts` (Roles: host, cohost, moderator, speaker)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_hosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('host', 'cohost', 'moderator', 'speaker')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_event_hosts_event_user UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_hosts_event_id ON public.event_hosts(event_id);
CREATE INDEX IF NOT EXISTS idx_event_hosts_user_id ON public.event_hosts(user_id);

-- ------------------------------------------------------------------------------
-- 3. Create `event_bans` (Access control)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_bans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    banned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_event_bans_event_user UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_bans_event_id ON public.event_bans(event_id);
CREATE INDEX IF NOT EXISTS idx_event_bans_user_id ON public.event_bans(user_id);

-- ------------------------------------------------------------------------------
-- 4. Create `event_stage_requests` (Stage promotion queue)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_stage_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_event_stage_requests_event_user UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_stage_requests_event_status ON public.event_stage_requests(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_stage_requests_user_id ON public.event_stage_requests(user_id);

-- ------------------------------------------------------------------------------
-- 5. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_stage_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing overlapping basic policies safely if replacing
DROP POLICY IF EXISTS "Public events viewable by everyone." ON public.events;
DROP POLICY IF EXISTS "Users can manage their events." ON public.events;
DROP POLICY IF EXISTS "Events are viewable by public if published or by host/cohost." ON public.events;
DROP POLICY IF EXISTS "Hosts can insert events." ON public.events;
DROP POLICY IF EXISTS "Hosts and cohosts can update events." ON public.events;
DROP POLICY IF EXISTS "Hosts can delete/cancel events." ON public.events;

-- Events RLS
CREATE POLICY "Events are viewable by public if published or by host/cohost." ON public.events
    FOR SELECT USING (
        (status IN ('scheduled', 'live', 'ended') AND visibility = 'public')
        OR (auth.uid() = host_id OR auth.uid() = created_by)
        OR EXISTS (
            SELECT 1 FROM public.event_hosts eh WHERE eh.event_id = events.id AND eh.user_id = auth.uid()
        )
    );

CREATE POLICY "Hosts can insert events." ON public.events
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND (host_id = auth.uid() OR created_by = auth.uid())
    );

CREATE POLICY "Hosts and cohosts can update events." ON public.events
    FOR UPDATE USING (
        auth.uid() = host_id OR auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM public.event_hosts eh WHERE eh.event_id = events.id AND eh.user_id = auth.uid() AND eh.role IN ('host', 'cohost')
        )
    );

CREATE POLICY "Hosts can delete/cancel events." ON public.events
    FOR DELETE USING (
        auth.uid() = host_id OR auth.uid() = created_by
    );

-- Event Hosts RLS
CREATE POLICY "Event hosts are viewable by everyone for published events or hosts." ON public.event_hosts
    FOR SELECT USING (true);

CREATE POLICY "Hosts can manage event roles." ON public.event_hosts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.events e WHERE e.id = event_hosts.event_id AND (e.host_id = auth.uid() OR e.created_by = auth.uid())
        )
    );

-- Event Bans RLS
CREATE POLICY "Event bans are viewable by event hosts and moderators." ON public.event_bans
    FOR SELECT USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.events e WHERE e.id = event_bans.event_id AND (e.host_id = auth.uid() OR e.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.event_hosts eh WHERE eh.event_id = event_bans.event_id AND eh.user_id = auth.uid() AND eh.role IN ('host', 'cohost', 'moderator')
        )
    );

CREATE POLICY "Event hosts and moderators can manage bans." ON public.event_bans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.events e WHERE e.id = event_bans.event_id AND (e.host_id = auth.uid() OR e.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.event_hosts eh WHERE eh.event_id = event_bans.event_id AND eh.user_id = auth.uid() AND eh.role IN ('host', 'cohost', 'moderator')
        )
    );

-- Event Stage Requests RLS
CREATE POLICY "Stage requests are viewable by requesting user or event hosts/moderators." ON public.event_stage_requests
    FOR SELECT USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.events e WHERE e.id = event_stage_requests.event_id AND (e.host_id = auth.uid() OR e.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.event_hosts eh WHERE eh.event_id = event_stage_requests.event_id AND eh.user_id = auth.uid() AND eh.role IN ('host', 'cohost', 'moderator')
        )
    );

CREATE POLICY "Users can create their own stage request." ON public.event_stage_requests
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 FROM public.event_bans eb WHERE eb.event_id = event_stage_requests.event_id AND eb.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can cancel own stage request or hosts can update." ON public.event_stage_requests
    FOR UPDATE USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.events e WHERE e.id = event_stage_requests.event_id AND (e.host_id = auth.uid() OR e.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.event_hosts eh WHERE eh.event_id = event_stage_requests.event_id AND eh.user_id = auth.uid() AND eh.role IN ('host', 'cohost', 'moderator')
        )
    );

CREATE POLICY "Users can delete own stage request or hosts can delete." ON public.event_stage_requests
    FOR DELETE USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.events e WHERE e.id = event_stage_requests.event_id AND (e.host_id = auth.uid() OR e.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.event_hosts eh WHERE eh.event_id = event_stage_requests.event_id AND eh.user_id = auth.uid() AND eh.role IN ('host', 'cohost', 'moderator')
        )
    );
