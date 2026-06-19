import { supabase } from "../lib/supabase";

export const NoteService = {
  /**
   * Creates a new ephemeral note
   */
  async createNote(
    userId: string,
    content: string,
    type: "text" | "voice" = "text",
    audioUrl?: string,
    durationSeconds?: number,
    waveformData?: number[],
  ): Promise<{ id: string } | null> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          user_id: userId,
          content,
          type,
          audio_url: audioUrl,
          duration_seconds: durationSeconds,
          waveform_data: waveformData,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating note:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to create note:", err);
      return null;
    }
  },
};
