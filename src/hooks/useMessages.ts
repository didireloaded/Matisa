import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from "@/stores/authStore";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | 'voice' | null;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export function useMessages(conversationId?: string) {
  const { session } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    if (!conversationId || !session?.user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          media_url,
          media_type,
          created_at,
          profiles:sender_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    if (!conversationId) return;

    // Real-time subscription to new messages
    const channel = supabase.channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Fetch the newly inserted message with profile data
          const { data: newMsg } = await supabase
            .from('messages')
            .select(`
              id,
              conversation_id,
              sender_id,
              content,
              media_url,
              media_type,
              created_at,
              profiles:sender_id (
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMsg) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string | null, mediaUrl?: string, mediaType?: 'image' | 'video' | 'voice') => {
    if (!conversationId || !session?.user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: session.user.id,
          content,
          media_url: mediaUrl,
          media_type: mediaType,
        });

      if (error) throw error;

      // Update the conversation's updated_at timestamp to bubble it up in the inbox
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Trigger Push Notification to the other participant(s)
      const { data: convData } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', session.user.id);

      if (convData && convData.length > 0) {
        // In a real app we might batch this, but for now we loop
        for (const p of convData) {
          supabase.functions.invoke('send-notification', {
            body: {
              userId: p.user_id,
              title: `New message from ${session.user.user_metadata?.full_name || 'Someone'}`,
              body: content ? content : (mediaType === 'voice' ? 'Sent a voice note 🎤' : 'Sent an attachment'),
              data: { url: `/messages/${conversationId}` }
            }
          }).catch(console.error); // don't await/block
        }
      }

    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  return { messages, isLoading, sendMessage };
}
