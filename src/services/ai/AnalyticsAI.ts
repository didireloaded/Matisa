import { supabase } from "../../lib/supabase";

export const AnalyticsAI = {
  async trackEvent(userId: string, eventType: string, entityId?: string, metadata?: any) {
    const eventData = { entity_id: entityId, ...metadata };
    const { error } = await supabase.rpc("track_event", {
      p_event_type: eventType,
      p_event_data: eventData,
    });

    if (error) {
      console.error("Error tracking analytics event:", error);
    }
  },

  /**
   * Evaluates and returns profile completion score + suggestions.
   */
  async getProfileScore(userId: string) {
    // Usually this could be a DB fetch if pre-calculated, or Edge Function call.
    const { data, error } = await supabase
      .from("profile_scores")
      .select("user_id, score, suggestions")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data;
  },
};
