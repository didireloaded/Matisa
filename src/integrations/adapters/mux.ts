import { isIntegrationAvailable } from "../status";
import { supabaseAdapter } from "./supabase";

export interface MuxStreamResult {
  streamKey?: string;
  playbackId?: string;
  available: boolean;
  error?: string;
}

export const muxAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("mux");
  },

  async createLiveStream(title: string): Promise<MuxStreamResult> {
    if (!this.isAvailable()) {
      console.warn("[Mux Video] Mux streaming service not configured.");
      return {
        available: false,
        error: "Virtual video broadcasting requires Mux API credentials.",
      };
    }

    try {
      const supabase = supabaseAdapter.getClient();
      const { data, error } = await supabase.functions.invoke("create-mux-stream", {
        body: { title },
      });

      if (error || !data?.playbackId) {
        return {
          available: false,
          error: error?.message || "Failed to create Mux video stream",
        };
      }

      return {
        streamKey: data.streamKey,
        playbackId: data.playbackId,
        available: true,
      };
    } catch (err: any) {
      return {
        available: false,
        error: err?.message || "Mux service error",
      };
    }
  },
};
