// src/features/recorded-voice/adapters/voiceStory.ts
import { RecordedVoice, uploadRecordedVoice } from "../";
import { supabase } from "@/lib/supabase";

export async function publishVoiceStoryAdapter(
  recording: RecordedVoice,
  userId: string,
  caption?: string,
) {
  // 1. Upload to public bucket 'stories'
  const uploadRes = await uploadRecordedVoice(recording, "story", userId);
  const publicUrl = uploadRes.publicUrl || "";

  // 2. Insert into stories table (expires in 24 hours)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("stories")
    .insert({
      user_id: userId,
      media_url: publicUrl,
      media_type: "voice",
      caption: caption ? caption.trim() : null,
      duration_seconds: recording.durationSeconds,
      waveform_data: recording.waveform,
      expires_at: expiresAt,
    })
    .select(
      `
      id,
      user_id,
      media_url,
      media_type,
      caption,
      duration_seconds,
      waveform_data,
      expires_at,
      created_at
    `,
    )
    .single();

  if (error) {
    console.error("Error creating voice story:", error);
    throw error;
  }

  return data;
}
