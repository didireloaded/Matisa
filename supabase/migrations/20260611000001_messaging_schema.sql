-- Create Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Conversation Participants Table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (conversation_id, user_id)
);

-- Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text,
    voice_url text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for Messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for Conversations
CREATE POLICY "Users can view conversations they are part of"
    ON public.conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update conversations they are part of"
    ON public.conversations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = id AND user_id = auth.uid()
        )
    );

-- Policies for Conversation Participants
CREATE POLICY "Users can view participants in their conversations"
    ON public.conversation_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can add participants"
    ON public.conversation_participants FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policies for Messages
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update message read status"
    ON public.messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

-- Function to start a new conversation easily
CREATE OR REPLACE FUNCTION public.create_conversation(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_conv_id uuid;
    existing_conv_id uuid;
BEGIN
    -- Check if conversation already exists between these two users
    SELECT cp1.conversation_id INTO existing_conv_id
    FROM public.conversation_participants cp1
    JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() AND cp2.user_id = other_user_id;

    IF existing_conv_id IS NOT NULL THEN
        RETURN existing_conv_id;
    END IF;

    -- Create new conversation
    INSERT INTO public.conversations DEFAULT VALUES RETURNING id INTO new_conv_id;

    -- Add participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (new_conv_id, auth.uid()), (new_conv_id, other_user_id);

    RETURN new_conv_id;
END;
$$;
