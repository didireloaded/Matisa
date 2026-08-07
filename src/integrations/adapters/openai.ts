import { isIntegrationAvailable } from "../status";
import { supabaseAdapter } from "./supabase";

export interface AudioTranscriptionResult {
  text: string | null;
  available: boolean;
  error?: string;
}

export const openaiAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("openai");
  },

  async transcribeAudio(audioUrl: string): Promise<AudioTranscriptionResult> {
    if (!this.isAvailable()) {
      console.log("[OpenAI] Audio transcription skipped (OpenAI key not configured).");
      return { text: null, available: false, error: "Transcription service unavailable" };
    }

    try {
      const supabase = supabaseAdapter.getClient();
      const { data, error } = await supabase.functions.invoke("transcribe_audio", {
        body: { audioUrl },
      });

      if (error || !data?.text) {
        console.warn(
          `[OpenAI] Transcription edge function warning: ${error?.message || "No text returned"}`,
        );
        return { text: null, available: false, error: error?.message || "Transcription failed" };
      }

      return { text: data.text, available: true };
    } catch (err: any) {
      console.warn(`[OpenAI] Transcription exception: ${err?.message}`);
      return { text: null, available: false, error: err?.message || "Transcription error" };
    }
  },
};
