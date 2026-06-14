import { supabase } from "../../lib/supabase";

export const RankingAI = {
  /**
   * Fetches the personalized home feed rankings powered by AI.
   */
  async getPersonalizedFeed(userId: string) {
    const { data, error } = await supabase.functions.invoke("generatePersonalizedHome", {
      body: { userId },
    });

    if (error) {
      console.error("Error fetching personalized home:", error);
      return null;
    }

    return data.rankedFeed || [];
  },
};
