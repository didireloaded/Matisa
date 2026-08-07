// src/features/recorded-voice/adapters/voiceReply.ts
import { RecordedVoice, uploadRecordedVoice } from "../";
import { supabase } from "@/lib/supabase";

export async function sendVoiceReplyAdapter(
  recording: RecordedVoice,
  senderId: string,
  recipientId: string,
  target?: { noteId?: string; storyId?: string },
) {
  // 1. Upload to private bucket 'voice_replies'
  const uploadRes = await uploadRecordedVoice(recording, "reply", senderId, {
    recipientId,
  });

  // 2. Insert into voice_replies table
  const { data, error } = await supabase
    .from("voice_replies")
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      note_id: target?.noteId || null,
      story_id: target?.storyId || null,
      storage_path: uploadRes.path,
      duration_seconds: recording.durationSeconds,
      waveform_data: recording.waveform,
      status: "unread",
    })
    .select(
      `
      id,
      sender_id,
      recipient_id,
      note_id,
      story_id,
      storage_path,
      duration_seconds,
      waveform_data,
      status,
      created_at
    `,
    )
    .single();

  if (error) {
    console.error("Error creating voice reply:", error);
    throw error;
  }

  // Trigger push notification to recipient
  try {
    await supabase.functions.invoke("send-notification", {
      body: {
        userId: recipientId,
        title: "New Private Voice Reply 🎙️",
        body: "Someone sent you a private voice reply",
        data: { url: "/activity" },
      },
    });
  } catch (err) {
    console.warn("Notification error notice:", err);
  }

  return data;
}
