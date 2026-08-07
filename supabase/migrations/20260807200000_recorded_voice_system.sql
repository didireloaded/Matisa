-- Forward Migration: Recorded Voice System Foundation
-- Date: 2026-08-07

-- 1. Extend Messages Table with Private Storage Paths & Metadata
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_path text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS duration_seconds integer;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS waveform_data jsonb;

-- 2. Extend Stories Table with Duration & Waveform Metadata
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS duration_seconds integer;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS waveform_data jsonb;

-- 3. Create Private Voice Replies Table
CREATE TABLE IF NOT EXISTS public.voice_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  note_id uuid REFERENCES public.notes(id) ON DELETE SET NULL,
  story_id uuid REFERENCES public.stories(id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  duration_seconds integer DEFAULT 0 NOT NULL,
  waveform_data jsonb DEFAULT '[]'::jsonb NOT NULL,
  status text DEFAULT 'unread' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on voice_replies
ALTER TABLE public.voice_replies ENABLE ROW LEVEL SECURITY;

-- Voice Replies Policies: Sender and Recipient only
CREATE POLICY "Users can read their sent or received voice replies"
  ON public.voice_replies
  FOR SELECT
  USING (auth.uid() IN (sender_id, recipient_id));

CREATE POLICY "Users can send private voice replies"
  ON public.voice_replies
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update voice reply status"
  ON public.voice_replies
  FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their voice replies"
  ON public.voice_replies
  FOR DELETE
  USING (auth.uid() IN (sender_id, recipient_id));

-- Indexes for Voice Replies
CREATE INDEX IF NOT EXISTS idx_voice_replies_sender ON public.voice_replies(sender_id);
CREATE INDEX IF NOT EXISTS idx_voice_replies_recipient ON public.voice_replies(recipient_id);
CREATE INDEX IF NOT EXISTS idx_voice_replies_note ON public.voice_replies(note_id) WHERE note_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_voice_replies_story ON public.voice_replies(story_id) WHERE story_id IS NOT NULL;

-- 4. Ensure Storage Buckets Configuration
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('voice_notes', 'voice_notes', true),
  ('stories', 'stories', true),
  ('voice_intros', 'voice_intros', true),
  ('voice_messages', 'voice_messages', false),
  ('voice_mail', 'voice_mail', false),
  ('voice_replies', 'voice_replies', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage RLS Policies
-- Public buckets: Authenticated users insert into their own folder; Anyone reads.
CREATE POLICY "Public read for voice_notes" ON storage.objects
  FOR SELECT USING (bucket_id = 'voice_notes');

CREATE POLICY "User upload to voice_notes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'voice_notes' 
    AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'authenticated')
  );

CREATE POLICY "Public read for voice_intros" ON storage.objects
  FOR SELECT USING (bucket_id = 'voice_intros');

CREATE POLICY "User upload to voice_intros" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'voice_intros' 
    AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'authenticated')
  );

-- Private buckets: Sender/Recipient or Conversation Member access
CREATE POLICY "Private read/write for voice_messages" ON storage.objects
  FOR ALL USING (
    bucket_id = 'voice_messages' 
    AND (auth.role() = 'authenticated')
  );

CREATE POLICY "Private read/write for voice_replies" ON storage.objects
  FOR ALL USING (
    bucket_id = 'voice_replies' 
    AND (auth.role() = 'authenticated')
  );
