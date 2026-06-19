import { supabase } from "../lib/supabase";
import type { ChatMessage, Profile } from "@/types";

export const MessageService = {
  /**
   * Gets the other user in a 1-on-1 conversation
   */
  async getOtherUser(conversationId: string, currentUserId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("conversation_participants")
      .select("user_id, profiles(*)")
      .eq("conversation_id", conversationId);

    if (error || !data) {
      console.error("Error fetching participants:", error);
      return null;
    }

    const other = data.find((p: any) => p.user_id !== currentUserId);
    return other?.profiles
      ? ((Array.isArray(other.profiles) ? other.profiles[0] : other.profiles) as any as Profile)
      : null;
  },

  /**
   * Gets or creates a 1-on-1 conversation
   */
  async getOrCreateConversation(userId1: string, userId2: string): Promise<string | null> {
    // First, check if there's an existing conversation between these two users.
    // In a production app, we'd use a postgres function for this to avoid race conditions.
    const { data: existing, error } = await supabase.rpc("get_direct_conversation", {
      user1_id: userId1,
      user2_id: userId2,
    });

    if (!error && existing && existing.length > 0) {
      return existing[0].conversation_id;
    }

    // Since RPC might fail if it's not defined, let's try manual approach
    const { data: convs1 } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId1);
    const { data: convs2 } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId2);

    if (convs1 && convs2) {
      const c1Ids = convs1.map((c: any) => c.conversation_id);
      const c2Ids = convs2.map((c: any) => c.conversation_id);
      const common = c1Ids.find((id: string) => c2Ids.includes(id));
      if (common) return common;
    }

    // Create new conversation
    const { data: newConv, error: createErr } = await supabase
      .from("conversations")
      .insert({ type: "direct" })
      .select("id")
      .single();
    if (createErr || !newConv) return null;

    await supabase.from("conversation_participants").insert([
      { conversation_id: newConv.id, user_id: userId1 },
      { conversation_id: newConv.id, user_id: userId2 },
    ]);

    return newConv.id;
  },

  /**
   * Fetches all messages for a conversation
   */
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    return data as ChatMessage[];
  },

  /**
   * Sends a text message
   */
  async sendTextMessage(conversationId: string, senderId: string, content: string): Promise<void> {
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      kind: "text",
    });

    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  /**
   * Sends a media message (image/voice)
   */
  async sendMediaMessage(
    conversationId: string,
    senderId: string,
    file: File,
    type: "image" | "voice",
  ): Promise<void> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${conversationId}/${Date.now()}-${Math.random()}.${fileExt}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("message_media")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error uploading media:", uploadError);
      throw uploadError;
    }

    // Since message_media is private, we create a long-lived signed URL for the MVP
    const { data: signedData, error: signError } = await supabase.storage
      .from("message_media")
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    if (signError) {
      console.error("Error signing media url:", signError);
      throw signError;
    }

    // Insert message
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: type === "image" ? "Sent an image" : "🎤 Voice message",
      kind: type,
      media_url: signedData.signedUrl,
    });

    if (error) {
      console.error("Error sending media message:", error);
      throw error;
    }
  },

  /**
   * Subscribes to real-time new messages
   */
  subscribeToMessages(conversationId: string, onNewMessage: (msg: ChatMessage) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onNewMessage(payload.new as ChatMessage);
        },
      )
      .subscribe();
  },

  /**
   * Unsubscribes from a channel
   */
  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(channel);
  },
};
