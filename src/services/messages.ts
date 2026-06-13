import { supabase } from '../lib/supabase';
import type { ChatMessage, Profile } from '@/types';

export const MessageService = {
  /**
   * Gets the other user in a 1-on-1 conversation
   */
  async getOtherUser(conversationId: string, currentUserId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select('user_id, profiles(*)')
      .eq('conversation_id', conversationId);

    if (error || !data) {
      console.error('Error fetching participants:', error);
      return null;
    }

    const other = data.find((p: any) => p.user_id !== currentUserId);
    return other?.profiles as Profile || null;
  },

  /**
   * Fetches all messages for a conversation
   */
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    return data as ChatMessage[];
  },

  /**
   * Sends a text message
   */
  async sendTextMessage(conversationId: string, senderId: string, content: string): Promise<void> {
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      kind: 'text'
    });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Subscribes to real-time new messages
   */
  subscribeToMessages(conversationId: string, onNewMessage: (msg: ChatMessage) => void) {
    return supabase.channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        onNewMessage(payload.new as ChatMessage);
      })
      .subscribe();
  },

  /**
   * Unsubscribes from a channel
   */
  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(channel);
  }
};
