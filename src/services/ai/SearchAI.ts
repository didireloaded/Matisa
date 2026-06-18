import { supabase } from "../../lib/supabase";

export const SearchAI = {
  /**
   * Performs an AI-powered smart search with intent expansion.
   */
  async search(query: string, userId?: string) {
    // In a real environment:
    // const { data } = await supabase.functions.invoke("smartSearch", { body: { query, userId } });

    // Local Semantic Intent Mocking
    let semanticExpansions = [query];
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("video") || lowerQuery.includes("film")) {
      semanticExpansions = [
        "Videographer",
        "Cinematographer",
        "Editor",
        "Drone Operator",
        "Content Creator",
        "Film Crew",
      ];
    } else if (lowerQuery.includes("music") || lowerQuery.includes("sing")) {
      semanticExpansions = ["Singer", "Vocalist", "Producer", "Guitarist", "Songwriter"];
    } else if (lowerQuery.includes("design") || lowerQuery.includes("art")) {
      semanticExpansions = [
        "UX Designer",
        "UI Designer",
        "Graphic Designer",
        "Illustrator",
        "Artist",
      ];
    }

    // Mock search against profiles using the expanded intent
    const { data: profiles } = await supabase.from("profiles").select("*").limit(10);

    return {
      query,
      ai_intent: {
        intent_category: ["profile", "post"],
        expanded_terms: semanticExpansions,
      },
      results: profiles || [],
    };
  },
};
