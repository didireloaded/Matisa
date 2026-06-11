import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface Conversation {
  id: string;
  is_group: boolean;
  name: string | null;
  updated_at: string;
  otherParticipants: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  }[];
  lastMessage?: {
    content: string;
    media_type: string | null;
    created_at: string;
  };
}

export function useConversations() {
  const { session } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);

    try {
      // Get all conversations the user is part of
      const { data: participations, error: partError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', session.user.id);

      if (partError) throw partError;

      const conversationIds = participations.map(p => p.conversation_id);

      if (conversationIds.length === 0) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      // Fetch conversation details + latest message + participants
      const { data: convos, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          is_group,
          name,
          updated_at,
          conversation_participants (
            user_id,
            profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          ),
          messages (
            content,
            media_type,
            created_at
          )
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      const formatted = convos.map((conv: any) => {
        // Filter out current user from participants array to find "others"
        const others = conv.conversation_participants
          .filter((p: any) => p.user_id !== session.user.id)
          .map((p: any) => p.profiles)
          .filter(Boolean); // Clean up nulls

        // Grab the most recent message (Supabase select orders by primary key by default unless specified, but we can sort manually)
        let lastMessage = undefined;
        if (conv.messages && conv.messages.length > 0) {
          const sortedMsgs = [...conv.messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          lastMessage = sortedMsgs[0];
        }

        return {
          id: conv.id,
          is_group: conv.is_group,
          name: conv.name,
          updated_at: conv.updated_at,
          otherParticipants: others,
          lastMessage,
        };
      });

      setConversations(formatted);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to changes in conversation_participants or messages could be added here later
  }, [session]);

  return { conversations, isLoading, refetch: fetchConversations };
}
