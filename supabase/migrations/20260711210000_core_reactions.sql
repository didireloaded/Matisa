CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (
    target_type IN ('note', 'story', 'message', 'voice', 'room', 'karaoke_performance', 'event')
  ),
  target_id TEXT NOT NULL CHECK (length(target_id) <= 128),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'fire', 'laugh', 'applause')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS reactions_target_idx
  ON public.reactions (target_type, target_id, created_at DESC);

CREATE INDEX IF NOT EXISTS reactions_user_idx
  ON public.reactions (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_reactions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_reactions_updated_at ON public.reactions;
CREATE TRIGGER set_reactions_updated_at
  BEFORE UPDATE ON public.reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_reactions_updated_at();

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_authenticated_read" ON public.reactions;
CREATE POLICY "reactions_authenticated_read"
  ON public.reactions
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "reactions_own_insert" ON public.reactions;
CREATE POLICY "reactions_own_insert"
  ON public.reactions
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "reactions_own_update" ON public.reactions;
CREATE POLICY "reactions_own_update"
  ON public.reactions
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "reactions_own_delete" ON public.reactions;
CREATE POLICY "reactions_own_delete"
  ON public.reactions
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reactions TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
  END IF;
END $$;
