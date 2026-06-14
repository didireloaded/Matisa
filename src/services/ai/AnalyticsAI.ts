import { supabase } from "../../lib/supabase";

export const AnalyticsAI = {
  /**
   * Tracks an AI analytics event implicitly.
   */
  async trackEvent(userId: string, eventType: string, entityId?: string, metadata?: any) {
    const { error } = await supabase.from("analytics_events").insert({
      user_id: userId,
      event_type: eventType,
      entity_id: entityId,
      metadata,
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
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data;
  },
};
