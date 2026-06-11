import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  voice_url: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  updated_at: string;
  other_user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  last_message?: Message;
  unread_count: number;
}

export function useConversations() {
  const { session } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    const fetchConversations = async () => {
      try {
        // Fetch conversations user is part of
        const { data: participantsData, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', session.user.id);

        if (participantsError) throw participantsError;
        
        if (!participantsData || participantsData.length === 0) {
          setConversations([]);
          setIsLoading(false);
          return;
        }

        const convIds = participantsData.map(p => p.conversation_id);

        // Fetch conversation details including the other participant
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            updated_at,
            conversation_participants!inner (
              user_id,
              profiles (id, username, full_name, avatar_url)
            )
          `)
          .in('id', convIds)
          .order('updated_at', { ascending: false });

        if (convError) throw convError;

        // Map data to our interface
        const formatte
<truncated 5192 bytes>