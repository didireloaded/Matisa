// src/features/recorded-voice/adapters/voiceIntro.ts
import { RecordedVoice, uploadRecordedVoice } from "../";
import { supabase } from "@/lib/supabase";

export async function saveVoiceIntroAdapter(recording: RecordedVoice, userId: string) {
  // 1. Upload to public bucket 'voice_intros'
  const uploadRes = await uploadRecordedVoice(recording, "intro", userId);
  const publicUrl = uploadRes.publicUrl || "";

  // 2. Update profiles table
  const { data, error } = await supabase
    .from("profiles")
    .update({
      voice_intro_url: publicUrl,
      voice_intro_duration_seconds: recording.durationSeconds,
      voice_intro_waveform_data: recording.waveform,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error saving voice intro to profile:", error);
    throw error;
  }

  return { publicUrl, profile: data };
}

export async function deleteVoiceIntroAdapter(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      voice_intro_url: null,
      voice_intro_duration_seconds: null,
      voice_intro_waveform_data: null,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error deleting voice intro:", error);
    throw error;
  }
}
