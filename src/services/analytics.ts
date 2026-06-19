import { supabase } from "../lib/supabase";

export const Analytics = {
  async track(eventName: string, properties: Record<string, any> = {}) {
    try {
      await supabase.rpc("track_event", {
        p_event_type: eventName,
        p_event_data: properties,
      });
    } catch (e) {
      console.error("Analytics error:", e);
    }
  },
};
