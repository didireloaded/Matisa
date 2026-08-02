import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateVoicemailRecordInput, VoicemailMessage, VoicemailStatus } from "../types";

export class VoicemailRepository {
  constructor(private readonly supabase: Pick<SupabaseClient, "from" | "storage">) {}

  async uploadAudio(senderId: string, recipientId: string, audioBlob: Blob): Promise<string> {
    const storagePath = `${recipientId}/${senderId}/${crypto.randomUUID()}.webm`;
    const { error } = await this.supabase.storage
      .from("voice_mail")
      .upload(storagePath, audioBlob, {
        contentType: "audio/webm",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;
    return storagePath;
  }

  async createRecord(input: CreateVoicemailRecordInput): Promise<VoicemailMessage> {
    const { data, error } = await this.supabase
      .from("voice_mail_messages")
      .insert({
        sender_id: input.senderId,
        recipient_id: input.recipientId,
        storage_path: input.storagePath,
        duration_seconds: Math.round(input.durationSeconds),
        status: "unread",
      })
      .select()
      .single();

    if (error) throw error;
    return data as VoicemailMessage;
  }

  async listInbox(userId: string): Promise<VoicemailMessage[]> {
    const { data, error } = await this.supabase
      .from("voice_mail_messages")
      .select("*")
      .eq("recipient_id", userId)
      .neq("status", "deleted")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data ?? []) as VoicemailMessage[];
  }

  async createSignedPlaybackUrl(storagePath: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from("voice_mail")
      .createSignedUrl(storagePath, 60 * 10);

    if (error) throw error;
    return data.signedUrl;
  }

  async updateStatus(messageId: string, status: VoicemailStatus): Promise<void> {
    const payload =
      status === "read" ? { status, listened_at: new Date().toISOString() } : { status };
    const { error } = await this.supabase
      .from("voice_mail_messages")
      .update(payload)
      .eq("id", messageId);

    if (error) throw error;
  }
}
