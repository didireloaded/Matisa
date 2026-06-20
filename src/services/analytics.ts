import { supabase } from "../lib/supabase";

export const Analytics = {
  async track(eventName: string, properties: Record<string, any> = {}) {
    try {
      // Removed: await supabase.rpc("track_event", ...);
      // Analytics table was dropped during scope cleanup
    } catch (e) {
      console.error("Analytics error:", e);
    }
  },
};
