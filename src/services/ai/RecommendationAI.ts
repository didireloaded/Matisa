import { supabase } from "../../lib/supabase";

export const RecommendationAI = {
  /**
   * Fetches personalized event recommendations.
   */
  async getRecommendedEvents(userId: string) {
    const { data, error } = await supabase.functions.invoke("recommendEvents", {
      body: { userId },
    });

    if (error) {
      console.error("Error fetching recommended events:", error);
      return [];
    }

    return data.recommendations || [];
  },
};
