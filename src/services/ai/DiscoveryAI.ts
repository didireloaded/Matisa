import { supabase } from "../../lib/supabase";

export const DiscoveryAI = {
  /**
   * Fetches personalized user recommendations powered by the AI Intelligence Layer.
   */
  async getRecommendedUsers(userId: string) {
    // Invoke the edge function
    const { data, error } = await supabase.functions.invoke("generateDiscoveryFeed", {
      body: { userId },
    });

    if (error) {
      console.error("Error fetching discovery feed:", error);
      // Fallback to basic DB query if AI is unavailable
      const fallback = await supabase.from("profiles").select("*").limit(10);
      return fallback.data || [];
    }

    return data.recommendations || [];
  },
};
