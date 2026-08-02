INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('voice_mail', 'voice_mail', false, 10485760, ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav'])
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav'];

CREATE TABLE IF NOT EXISTS public.voice_mail_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds BETWEEN 1 AND 30),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  listened_at TIMESTAMPTZ,
  CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS voice_mail_recipient_idx
  ON public.voice_mail_messages(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS voice_mail_sender_idx
  ON public.voice_mail_messages(sender_id, created_at DESC);

ALTER TABLE public.voice_mail_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "voice_mail_sender_recipient_read" ON public.voice_mail_messages;
CREATE POLICY "voice_mail_sender_recipient_read"
  ON public.voice_mail_messages
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = recipient_id);

DROP POLICY IF EXISTS "voice_mail_sender_insert" ON public.voice_mail_messages;
CREATE POLICY "voice_mail_sender_insert"
  ON public.voice_mail_messages
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = sender_id AND sender_id <> recipient_id);

DROP POLICY IF EXISTS "voice_mail_recipient_update" ON public.voice_mail_messages;
CREATE POLICY "voice_mail_recipient_update"
  ON public.voice_mail_messages
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = recipient_id)
  WITH CHECK ((SELECT auth.uid()) = recipient_id);

GRANT SELECT, INSERT, UPDATE ON public.voice_mail_messages TO authenticated;

DROP POLICY IF EXISTS "voice_mail_sender_upload" ON storage.objects;
CREATE POLICY "voice_mail_sender_upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'voice_mail'
    AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "voice_mail_sender_or_recipient_read" ON storage.objects;
CREATE POLICY "voice_mail_sender_or_recipient_read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'voice_mail'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR (storage.foldername(name))[2] = (SELECT auth.uid())::text
    )
  );
