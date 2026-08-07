import { supabaseAdapter } from "./supabase";
import { isIntegrationAvailable } from "../status";

export interface LiveKitTokenResponse {
  token: string | null;
  available: boolean;
  error?: string;
}

export const livekitAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("livekit");
  },

  async fetchRoomToken(roomName: string, participantName: string): Promise<LiveKitTokenResponse> {
    if (!this.isAvailable()) {
      console.warn("[LiveKit] LiveKit is not configured. Media streaming unavailable.");
      return { token: null, available: false, error: "LiveKit server is not configured." };
    }

    try {
      const supabase = supabaseAdapter.getClient();
      const { data, error } = await supabase.functions.invoke("livekit-token", {
        body: { roomName, participantName },
      });

      if (error || !data?.token) {
        const message = error?.message || "Failed to issue room token";
        console.warn(`[LiveKit] Token error: ${message}`);
        return { token: null, available: false, error: message };
      }

      return { token: data.token, available: true };
    } catch (err: any) {
      console.warn(`[LiveKit] Network/Edge exception: ${err?.message}`);
      return {
        token: null,
        available: false,
        error: err?.message || "LiveKit service unavailable",
      };
    }
  },
};
