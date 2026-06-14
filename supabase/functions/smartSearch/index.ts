import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AIProviderFactory } from "../_shared/ai_provider.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  try {
    const { query, userId } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const aiProvider = AIProviderFactory.getProvider("gemini");

    // Expand search intent
    const intentPrompt = `
      The user searched for: "${query}".
      Provide 5 related hyper-local search terms or synonyms that might be relevant in Namibia (e.g., if they search 'photographer', include 'videographer', 'content creator').
      Return JSON: { "expanded_terms": ["term1", "term2", "term3"], "intent_category": "people | music | events | posts" }
    `;

    const aiResult = await aiProvider.generateJSON<{
      expanded_terms: string[];
      intent_category: string;
    }>(intentPrompt, "You are an AI search optimizer for Matisa, a Namibian social platform.");

    // Track search history
    if (userId) {
      await supabase.from("search_history").insert({
        user_id: userId,
        query: query,
        intent: aiResult.intent_category,
      });
    }

    // Perform the actual search combining the expanded terms
    const allTerms = [query, ...aiResult.expanded_terms].join(" | ");

    // Example simple search on profiles based on expanded terms
    const { data: results } = await supabase
      .from("profiles")
      .select("*")
      .textSearch("bio", allTerms, { type: "websearch" })
      .limit(20);

    return new Response(JSON.stringify({ original_query: query, ai_intent: aiResult, results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
