// src/features/recorded-voice/adapters/voiceMessage.ts
import { RecordedVoice, uploadRecordedVoice } from "../";
import { supabase } from "@/lib/supabase";

export async function sendVoiceMessageAdapter(
  recording: RecordedVoice,
  conversationId: string,
  senderId: string,
) {
  // 1. Upload to private bucket 'voice_messages'
  const uploadRes = await uploadRecordedVoice(recording, "message", senderId, {
    conversationId,
  });

  // 2. Insert into messages table with private storage path
  const { data: msgData, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: null,
      media_type: "voice",
      media_path: uploadRes.path,
      media_url: null,
      duration_seconds: recording.durationSeconds,
      waveform_data: recording.waveform,
    })
    .select(
      `
      id,
      conversation_id,
      sender_id,
      content,
      media_url,
      media_path,
      media_type,
      duration_seconds,
      waveform_data,
      created_at,
      profiles:sender_id (
        username,
        full_name,
        avatar_url
      )
    `,
    )
    .single();

  if (msgError) {
    console.error("Error inserting voice message record:", msgError);
    throw msgError;
  }

  // Update conversation updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return msgData;
}
