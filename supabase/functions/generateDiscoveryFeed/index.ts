import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AIProviderFactory } from "../_shared/ai_provider.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 1. Fetch user data (interests, recent views)
    const { data: userInterests } = await supabase
      .from("profile_interests")
      .select("interest")
      .eq("profile_id", userId);

    // 2. Fetch candidates (excluding blocked, already followed, etc.)
    const { data: candidates } = await supabase
      .from("profiles")
      .select("id, username, display_name, bio, region, city, mood, follower_count")
      .limit(100);

    if (!candidates || candidates.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), { status: 200 });
    }

    const aiProvider = AIProviderFactory.getProvider("gemini");

    const prompt = `
    User Context:
    Interests: ${JSON.stringify(userInterests?.map((i) => i.interest))}

    Candidates:
    ${JSON.stringify(candidates.map((c) => ({ id: c.id, bio: c.bio, region: c.region, followers: c.follower_count })))}

    Task: Recommend the top 10 users that the current user should follow or connect with. Focus on hyper-local relevance (same region), mutual interests, and engaging bios.
    Return JSON array:
    [{ "id": "uuid", "score": 85, "reason": "Filmmaker in the same region" }]
    `;

    const result = await aiProvider.generateJSON<{ id: string; score: number; reason: string }[]>(
      prompt,
      "You are an expert matchmaking AI for a Namibian social platform.",
    );

    // Save recommendations to database
    if (result && result.length > 0) {
      const inserts = result.map((rec) => ({
        user_id: userId,
        recommended_user_id: rec.id,
        score: rec.score,
        reasons: [rec.reason],
      }));

      await supabase
        .from("user_discovery_scores")
        .upsert(inserts, { onConflict: "user_id, recommended_user_id" });
    }

    return new Response(JSON.stringify({ recommendations: result }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
