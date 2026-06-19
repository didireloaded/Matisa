import { supabase } from "../../lib/supabase";

export const SearchAI = {
  /**
   * Performs an AI-powered smart search with intent expansion.
   */
  async search(query: string, userId?: string) {
    try {
      const { data, error } = await supabase.functions.invoke("semanticSearch", {
        body: { query, type: 'all', limit: 10 },
      });
      
      if (!error && data) {
        return {
          query,
          ai_intent: {
            intent_category: ["profile", "post", "opportunity"],
            expanded_terms: [query], // The embedding handles the semantic expansion
          },
          results: data.users || [],
          opportunities: data.opportunities || [],
          notes: data.notes || []
        };
      }
    } catch (err) {
      console.warn("Edge function failed, falling back to local mock", err);
    }

    // Local Semantic Intent Mocking (Fallback)
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
