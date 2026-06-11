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
    ON public.conversations FOR UPDAT
<truncated 2665 bytes>