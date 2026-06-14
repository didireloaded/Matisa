import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";

export const VoiceService = {
  /**
   * Uploads an audio blob to Supabase Storage and creates a voice post.
   */
  async createVoicePost(userId: string, audioBlob: Blob, durationSeconds: number, title?: string) {
    const fileName = `${userId}/${uuidv4()}.webm`;

    // 1. Upload audio to 'audio' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio")
      .upload(fileName, audioBlob, {
        contentType: "audio/webm",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 2. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("audio").getPublicUrl(fileName);

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        content: title || null,
        type: "voice",
        voice_url: publicUrl,
        voice_duration: Math.round(durationSeconds),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
