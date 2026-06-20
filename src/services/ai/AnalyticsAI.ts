import { supabase } from "../../lib/supabase";

export const AnalyticsAI = {
  async trackEvent(userId: string, eventType: string, entityId?: string, metadata?: any) {
    // Analytics RPC has been dropped from consolidated schema
    return;
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
