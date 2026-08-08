-- Migration: 20260808210000_phase2_moderation_and_integrity.sql
-- Description: Phase 2 Moderation (reports, mutes) and Data Integrity RPCs.

-- 1. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'note', 'message', 'room', 'story', 'event')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports (reporter_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_own_insert" ON public.reports;
CREATE POLICY "reports_own_insert" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_own_read" ON public.reports;
CREATE POLICY "reports_own_read" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

-- 2. MUTES TABLE
CREATE TABLE IF NOT EXISTS public.mutes (
  muter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (muter_id, muted_id),
  CHECK (muter_id <> muted_id)
);

CREATE INDEX IF NOT EXISTS idx_mutes_muter ON public.mutes (muter_id);

ALTER TABLE public.mutes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mutes_own_read" ON public.mutes;
CREATE POLICY "mutes_own_read" ON public.mutes FOR SELECT TO authenticated USING (auth.uid() = muter_id);

DROP POLICY IF EXISTS "mutes_own_insert" ON public.mutes;
CREATE POLICY "mutes_own_insert" ON public.mutes FOR INSERT TO authenticated WITH CHECK (auth.uid() = muter_id);

DROP POLICY IF EXISTS "mutes_own_delete" ON public.mutes;
CREATE POLICY "mutes_own_delete" ON public.mutes FOR DELETE TO authenticated USING (auth.uid() = muter_id);

-- RPC for Muting/Unmuting user
CREATE OR REPLACE FUNCTION public.mute_user(p_muted_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF auth.uid() = p_muted_id THEN
    RAISE EXCEPTION 'Cannot mute self';
  END IF;

  INSERT INTO public.mutes (muter_id, muted_id)
  VALUES (auth.uid(), p_muted_id)
  ON CONFLICT (muter_id, muted_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.unmute_user(p_muted_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.mutes
  WHERE muter_id = auth.uid() AND muted_id = p_muted_id;
END;
$$;

-- RPC for submitting reports safely
CREATE OR REPLACE FUNCTION public.submit_report(
  p_target_type TEXT,
  p_target_id TEXT,
  p_reason TEXT,
  p_details TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_report_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.reports (reporter_id, target_type, target_id, reason, details)
  VALUES (auth.uid(), p_target_type, p_target_id, p_reason, p_details)
  RETURNING id INTO v_report_id;

  RETURN v_report_id;
END;
$$;
