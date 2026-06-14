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

    // Get Upcoming Events
    const { data: events } = await supabase
      .from("events")
      .select("id, title, description, category, starts_at, region")
      .gt("starts_at", new Date().toISOString())
      .limit(20);

    // Get User interests
    const { data: interests } = await supabase
      .from("profile_interests")
      .select("interest")
      .eq("profile_id", userId);

    const aiProvider = AIProviderFactory.getProvider("gemini");

    const prompt = `
      User Interests: ${JSON.stringify(interests)}
      Upcoming Events: ${JSON.stringify(events)}
      
      Recommend the top 5 events for this user based on their interests.
      Return JSON array:
      [{ "id": "event_id", "score": 90, "reason": "Matches interest in Photography" }]
    `;

    const recs = await aiProvider.generateJSON<{ id: string; score: number; reason: string }[]>(
      prompt,
      "You are an AI event recommendation engine.",
    );

    if (recs && recs.length > 0) {
      const inserts = recs.map((rec) => ({
        user_id: userId,
        event_id: rec.id,
        score: rec.score,
        reasons: [rec.reason],
      }));
      await supabase
        .from("event_recommendations")
        .upsert(inserts, { onConflict: "user_id, event_id" });
    }

    return new Response(JSON.stringify({ recommendations: recs }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
