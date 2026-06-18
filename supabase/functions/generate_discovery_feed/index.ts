import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../shared/cors.ts";
import { getSupabaseAdmin } from "../shared/supabase.ts";
import { callOpenAI } from "../shared/openai.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    if (!user_id) throw new Error("user_id is required");

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Fetch user preferences
    const { data: prefs } = await supabaseAdmin
      .from("user_music_preferences")
      .select("*")
      .eq("user_id", user_id)
      .single();

    // 2. We use an AI heuristic to rank users if AI is enabled
    const prompt = `Based on the user's top genres: ${prefs?.favorite_genres?.join(",") || "unknown"}, generate a JSON array of 5 generic user interests.`;
    const aiResponse = await callOpenAI(prompt, 50);

    // 3. Fetch recommended users (mocked logic for discovery feed)
    const { data: recommendedUsers, error } = await supabaseAdmin
      .from("profiles")
      .select("id, username, display_name, avatar_url, mood, city")
      .neq("id", user_id)
      .limit(10);

    if (error) throw error;

    return new Response(JSON.stringify({ feed: recommendedUsers, ai_context: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
