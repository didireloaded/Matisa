CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered'
    CHECK (status IN ('registered', 'checked_in', 'left', 'removed')),
  role TEXT NOT NULL DEFAULT 'attendee'
    CHECK (role IN ('host', 'cohost', 'moderator', 'speaker', 'attendee')),
  joined_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.event_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, invited_user_id)
);

CREATE TABLE IF NOT EXISTS public.event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id TEXT,
  ticket_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (ticket_status IN (
      'pending',
      'paid',
      'cancelled',
      'refunded',
      'partially_refunded',
      'disputed',
      'used'
    )),
  amount_paid_minor BIGINT NOT NULL DEFAULT 0 CHECK (amount_paid_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'NAD' CHECK (char_length(currency) = 3),
  purchased_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, buyer_id)
);

CREATE TABLE IF NOT EXISTS public.event_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'disputed')),
  amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'NAD' CHECK (char_length(currency) = 3),
  provider TEXT,
  provider_checkout_id TEXT,
  provider_payment_id TEXT,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (idempotency_key)
);

CREATE TABLE IF NOT EXISTS public.event_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.event_orders(id) ON DELETE SET NULL,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL
    CHECK (entry_type IN ('gross', 'processing_fee', 'platform_fee', 'host_earning', 'refund', 'payout')),
  amount_minor BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NAD' CHECK (char_length(currency) = 3),
  available_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_attendees_event_status_idx
  ON public.event_attendees(event_id, status);
CREATE INDEX IF NOT EXISTS event_attendees_user_idx
  ON public.event_attendees(user_id);
CREATE INDEX IF NOT EXISTS event_invites_user_idx
  ON public.event_invites(invited_user_id);
CREATE INDEX IF NOT EXISTS event_tickets_buyer_status_idx
  ON public.event_tickets(buyer_id, ticket_status);
CREATE INDEX IF NOT EXISTS event_orders_event_buyer_idx
  ON public.event_orders(event_id, buyer_id);
CREATE INDEX IF NOT EXISTS event_ledger_host_idx
  ON public.event_ledger_entries(host_id, created_at DESC);

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_attendees_own_or_host_read" ON public.event_attendees;
CREATE POLICY "event_attendees_own_or_host_read"
  ON public.event_attendees
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_attendees.event_id
        AND (events.host_id = (SELECT auth.uid()) OR events.created_by = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "event_attendees_own_insert" ON public.event_attendees;
CREATE POLICY "event_attendees_own_insert"
  ON public.event_attendees
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "event_attendees_own_or_host_update" ON public.event_attendees;
CREATE POLICY "event_attendees_own_or_host_update"
  ON public.event_attendees
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_attendees.event_id
        AND (events.host_id = (SELECT auth.uid()) OR events.created_by = (SELECT auth.uid()))
    )
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_attendees.event_id
        AND (events.host_id = (SELECT auth.uid()) OR events.created_by = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "event_invites_invitee_or_host_read" ON public.event_invites;
CREATE POLICY "event_invites_invitee_or_host_read"
  ON public.event_invites
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = invited_user_id
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_invites.event_id
        AND (events.host_id = (SELECT auth.uid()) OR events.created_by = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "event_invites_host_insert" ON public.event_invites;
CREATE POLICY "event_invites_host_insert"
  ON public.event_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_invites.event_id
        AND (events.host_id = (SELECT auth.uid()) OR events.created_by = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "event_tickets_buyer_or_host_read" ON public.event_tickets;
CREATE POLICY "event_tickets_buyer_or_host_read"
  ON public.event_tickets
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = buyer_id
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_tickets.event_id
        AND (events.host_id = (SELECT auth.uid()) OR events.created_by = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "event_orders_buyer_or_host_read" ON public.event_orders;
CREATE POLICY "event_orders_buyer_or_host_read"
  ON public.event_orders
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = buyer_id
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_orders.event_id
        AND (events.host_id = (SELECT auth.uid()) OR events.created_by = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "event_ledger_host_read" ON public.event_ledger_entries;
CREATE POLICY "event_ledger_host_read"
  ON public.event_ledger_entries
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = host_id);

GRANT SELECT, INSERT, UPDATE ON public.event_attendees TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.event_invites TO authenticated;
GRANT SELECT ON public.event_tickets TO authenticated;
GRANT SELECT ON public.event_orders TO authenticated;
GRANT SELECT ON public.event_ledger_entries TO authenticated;
