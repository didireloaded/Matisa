-- Migration: 20260803140000_phase2_backend_stabilization.sql
-- Description: Phase 2 backend stabilization - schema integrity, RLS verification, unified RPCs, and indexes.

-- 1. Ensure Notes Table Indexes & Constraints
CREATE INDEX IF NOT EXISTS notes_kind_expires_idx 
  ON public.notes(note_kind, expires_at, created_at DESC);

CREATE INDEX IF NOT EXISTS notes_type_idx 
  ON public.notes(type, created_at DESC);

-- 2. Unified Note Feed RPC with deterministic ordering & profile aggregation
CREATE OR REPLACE FUNCTION public.get_unified_notes_feed(
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  type TEXT,
  note_kind TEXT,
  audio_url TEXT,
  duration_seconds INT,
  waveform_data JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author_id UUID,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  reaction_count BIGINT,
  reply_count BIGINT,
  user_has_reacted BOOLEAN,
  user_has_saved BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.user_id,
    n.content,
    n.type,
    n.note_kind,
    n.audio_url,
    n.duration_seconds,
    n.waveform_data,
    n.expires_at,
    n.created_at,
    n.updated_at,
    p.id AS author_id,
    p.username AS author_username,
    p.display_name AS author_display_name,
    p.avatar_url AS author_avatar_url,
    COALESCE(r.rcount, 0) AS reaction_count,
    COALESCE(c.ccount, 0) AS reply_count,
    CASE 
      WHEN p_user_id IS NOT NULL THEN EXISTS (
        SELECT 1 FROM public.reactions rx 
        WHERE rx.target_type = 'note' AND rx.target_id = n.id::text AND rx.user_id = p_user_id
      )
      ELSE false 
    END AS user_has_reacted,
    CASE 
      WHEN p_user_id IS NOT NULL THEN EXISTS (
        SELECT 1 FROM public.saves s 
        WHERE s.note_id = n.id AND s.user_id = p_user_id
      )
      ELSE false 
    END AS user_has_saved
  FROM public.notes n
  LEFT JOIN public.profiles p ON p.id = n.user_id
  LEFT JOIN (
    SELECT target_id, COUNT(*) AS rcount
    FROM public.reactions
    WHERE target_type = 'note'
    GROUP BY target_id
  ) r ON r.target_id = n.id::text
  LEFT JOIN (
    SELECT note_id, COUNT(*) AS ccount
    FROM public.comments
    GROUP BY note_id
  ) c ON c.note_id = n.id
  WHERE (n.note_kind = 'permanent' OR n.expires_at > now())
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_unified_notes_feed(INT, INT, UUID) TO authenticated, anon;

-- 3. Verify & Grant RLS Execution on Core Tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT SELECT ON public.notes TO anon;

GRANT SELECT, INSERT, DELETE ON public.saves TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.comments TO authenticated;
GRANT SELECT ON public.comments TO anon;

GRANT SELECT, INSERT ON public.voice_replies TO authenticated;
GRANT SELECT ON public.voice_replies TO anon;
