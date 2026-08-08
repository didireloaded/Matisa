import { supabase } from "../lib/supabase";
import type { ChatMessage, Profile } from "@/types";

export interface ConversationItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
  isGroup?: boolean;
  otherUserId?: string;
}

export const MessageService = {
  /**
   * Gets all active conversations for a user
   */
  async getUserConversations(currentUserId: string): Promise<ConversationItem[]> {
    try {
      // 1. Fetch user's conversation participant records
      const { data: participants, error: partErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at, conversations(id, is_group, name, updated_at)")
        .eq("user_id", currentUserId);

      if (partErr || !participants || participants.length === 0) {
        return [];
      }

      const conversationIds = participants.map((p: any) => p.conversation_id);

      // 2. Fetch other participants for these conversations
      const { data: allParticipants } = await supabase
        .from("conversation_participants")
        .select(
          "conversation_id, user_id, profiles(id, username, display_name, full_name, avatar_url)",
        )
        .in("conversation_id", conversationIds)
        .neq("user_id", currentUserId);

      // 3. Fetch latest messages for each conversation
      const { data: messages } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, media_url, media_type, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });

      const items: ConversationItem[] = participants.map((p: any) => {
        const convId = p.conversation_id;
        const convData = p.conversations || {};
        const otherPart = (allParticipants || []).find((ap: any) => ap.conversation_id === convId);
        const otherProf = Array.isArray(otherPart?.profiles)
          ? otherPart.profiles[0]
          : otherPart?.profiles;

        const convMessages = (messages || []).filter((m: any) => m.conversation_id === convId);
        const latestMsg = convMessages[0];

        const lastRead = p.last_read_at ? new Date(p.last_read_at).getTime() : 0;
        const unreadCount = convMessages.filter(
          (m: any) => new Date(m.created_at).getTime() > lastRead && m.sender_id !== currentUserId,
        ).length;

        const name = convData.is_group
          ? convData.name || "Group Chat"
          : otherProf?.display_name || otherProf?.full_name || otherProf?.username || "Matisa User";

        const avatar =
          otherProf?.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherProf?.id || convId}`;

        let lastMsgText = "No messages yet";
        if (latestMsg) {
          if (latestMsg.content) {
            lastMsgText = latestMsg.content;
          } else if (latestMsg.media_type === "voice") {
            lastMsgText = "🎤 Voice message";
          } else if (latestMsg.media_type === "image") {
            lastMsgText = "📷 Image attachment";
          }
        }

        const msgTime = latestMsg?.created_at
          ? new Date(latestMsg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Now";

        return {
          id: convId,
          name,
          avatar,
          lastMessage: lastMsgText,
          time: msgTime,
          unread: unreadCount,
          isGroup: convData.is_group,
          otherUserId: otherProf?.id,
        };
      });

      return items;
    } catch (err) {
      console.error("Error fetching user conversations:", err);
      return [];
    }
  },

  /**
   * Gets the other user in a 1-on-1 conversation
   */
  async getOtherUser(conversationId: string, currentUserId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("conversation_participants")
      .select("user_id, profiles(*)")
      .eq("conversation_id", conversationId);

    if (error || !data) {
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
    try {
      const { data, error } = await supabase.rpc("get_or_create_direct_conversation", {
        p_other_user_id: userId2,
      });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn("RPC get_or_create_direct_conversation fallback notice:", err);
    }

    // Manual fallback
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
      .insert({ is_group: false })
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

    return (data || []).map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      content: m.content || "",
      created_at: m.created_at,
      kind: m.media_type || m.kind || "text",
      media_url: m.media_url,
    })) as ChatMessage[];
  },

  /**
   * Sends a text message
   */
  async sendTextMessage(conversationId: string, senderId: string, content: string): Promise<void> {
    try {
      const { error } = await supabase.rpc("send_direct_message", {
        p_conversation_id: conversationId,
        p_content: content,
      });

      if (!error) return;
    } catch (err) {
      console.warn("RPC send_direct_message fallback notice:", err);
    }

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      media_type: "text",
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
    const fileExt = file.name.split(".").pop() || "webm";
    const fileName = `${conversationId}/${Date.now()}-${Math.random()}.${fileExt}`;

    // Upload to message_media bucket
    const { error: uploadError } = await supabase.storage
      .from("message_media")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error uploading media:", uploadError);
    }

    // Try signed URL first, or public URL fallback
    let mediaUrl = "";
    const { data: signedData } = await supabase.storage
      .from("message_media")
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    if (signedData?.signedUrl) {
      mediaUrl = signedData.signedUrl;
    } else {
      const { data: pubData } = supabase.storage.from("message_media").getPublicUrl(fileName);
      mediaUrl = pubData.publicUrl;
    }

    const contentText = type === "image" ? "Sent an image" : "🎤 Voice message";

    try {
      const { error } = await supabase.rpc("send_direct_message", {
        p_conversation_id: conversationId,
        p_content: contentText,
        p_media_url: mediaUrl,
        p_media_type: type,
      });

      if (!error) return;
    } catch (err) {
      console.warn("RPC send_direct_message fallback notice:", err);
    }

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: contentText,
      media_url: mediaUrl,
      media_type: type,
    });

    if (error) {
      console.error("Error sending media message:", error);
      throw error;
    }
  },

  /**
   * Mark conversation read
   */
  async markConversationRead(conversationId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .match({ conversation_id: conversationId, user_id: userId });
    } catch (err) {
      console.error("Error marking conversation read:", err);
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
    if (channel) supabase.removeChannel(channel);
  },
};
