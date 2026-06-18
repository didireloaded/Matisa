import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../shared/cors.ts";
import { getSupabaseAdmin } from "../shared/supabase.ts";
import { callOpenAI } from "../shared/openai.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { target_user_id } = await req.json();
    if (!target_user_id) throw new Error("target_user_id required");

    const supabaseAdmin = getSupabaseAdmin();

    // Get user profile details
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", target_user_id)
      .single();

    const prompt = `Analyze this user profile data for spam/bot behavior: username: ${profile.username}, display: ${profile.display_name}, bio: ${profile.bio}. Return a risk score from 0.0 to 1.0, and an array of flags.`;

    // In reality we'd parse the JSON from OpenAI
    const aiResponse = await callOpenAI(prompt, 100);

    // Log the risk score (Mock parse)
    const riskScore = 0.5; // Mock parsed value

    if (riskScore > 0.8) {
      await supabaseAdmin.from("account_risk_scores").upsert({
        user_id: target_user_id,
        score: riskScore,
        flags: ["AI_FLAGGED_SPAM"],
      });
    }

    return new Response(JSON.stringify({ target_user_id, riskScore, ai_analysis: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
