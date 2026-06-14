import { supabase } from "../../lib/supabase";

export const SearchAI = {
  /**
   * Performs an AI-powered smart search with intent expansion.
   */
  async search(query: string, userId?: string) {
    const { data, error } = await supabase.functions.invoke("smartSearch", {
      body: { query, userId },
    });

    if (error) {
      console.error("Error during smart search:", error);
      return { results: [], ai_intent: null };
    }

    return data;
  },
};
