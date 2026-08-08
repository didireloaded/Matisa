-- Migration: 20260808190000_messaging_production_hardening.sql
-- Description: Harden messaging RLS, create atomic RPCs for 1-on-1 conversations & message delivery, and add last_read_at tracking.

-- 1. Ensure conversation_participants has last_read_at column
ALTER TABLE public.conversation_participants
ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ DEFAULT now();

-- 2. Indexes for fast message & conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON public.messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_conv_part_user_conv 
ON public.conversation_participants (user_id, conversation_id);

-- 3. RLS HARDENING FOR CONVERSATIONS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations." ON public.conversations;
CREATE POLICY "Users can view their conversations." ON public.conversations 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = public.conversations.id 
    AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create conversations." ON public.conversations;
CREATE POLICY "Users can create conversations." ON public.conversations 
FOR INSERT TO authenticated 
WITH CHECK (true);

-- 4. RLS HARDENING FOR CONVERSATION PARTICIPANTS
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversation participants." ON public.conversation_participants;
CREATE POLICY "Users can view their conversation participants." ON public.conversation_participants 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = public.conversation_participants.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can join conversations." ON public.conversation_participants;
CREATE POLICY "Users can join conversations." ON public.conversation_participants 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own participant record." ON public.conversation_participants;
CREATE POLICY "Users can update own participant record." ON public.conversation_participants 
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. RLS HARDENING FOR MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their messages." ON public.messages;
CREATE POLICY "Users can view their messages." ON public.messages 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = public.messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can send messages." ON public.messages;
CREATE POLICY "Users can send messages." ON public.messages 
FOR INSERT TO authenticated 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = public.messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

-- 6. ATOMIC RPC: GET OR CREATE DIRECT CONVERSATION
CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(p_other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id UUID;
  v_conversation_id UUID;
BEGIN
  v_current_user_id := auth.uid();
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF v_current_user_id = p_other_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with self';
  END IF;

  -- Search for an existing direct (non-group) conversation between these two users
  SELECT cp1.conversation_id INTO v_conversation_id
  FROM public.conversation_participants cp1
  JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  JOIN public.conversations c ON c.id = cp1.conversation_id
  WHERE cp1.user_id = v_current_user_id
    AND cp2.user_id = p_other_user_id
    AND COALESCE(c.is_group, false) = false
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Create new direct conversation
  INSERT INTO public.conversations (is_group, created_at, updated_at)
  VALUES (false, now(), now())
  RETURNING id INTO v_conversation_id;

  -- Add both participants
  INSERT INTO public.conversation_participants (conversation_id, user_id, joined_at, last_read_at)
  VALUES 
    (v_conversation_id, v_current_user_id, now(), now()),
    (v_conversation_id, p_other_user_id, now(), now());

  RETURN v_conversation_id;
END;
$$;

-- 7. ATOMIC RPC: SEND DIRECT MESSAGE
CREATE OR REPLACE FUNCTION public.send_direct_message(
  p_conversation_id UUID,
  p_content TEXT DEFAULT NULL,
  p_media_url TEXT DEFAULT NULL,
  p_media_type TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_id UUID;
  v_message_id UUID;
BEGIN
  v_sender_id := auth.uid();
  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify sender belongs to conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = p_conversation_id AND user_id = v_sender_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized conversation member';
  END IF;

  -- Insert message
  INSERT INTO public.messages (conversation_id, sender_id, content, media_url, media_type, created_at)
  VALUES (p_conversation_id, v_sender_id, p_content, p_media_url, p_media_type, now())
  RETURNING id INTO v_message_id;

  -- Update conversation timestamp
  UPDATE public.conversations 
  SET updated_at = now() 
  WHERE id = p_conversation_id;

  -- Update sender's last_read_at
  UPDATE public.conversation_participants
  SET last_read_at = now()
  WHERE conversation_id = p_conversation_id AND user_id = v_sender_id;

  RETURN v_message_id;
END;
$$;
