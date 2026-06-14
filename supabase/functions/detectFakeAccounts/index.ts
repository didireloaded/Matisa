import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AIProviderFactory } from "../_shared/ai_provider.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  try {
    const { targetUserId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Fetch account signals (follower ratio, recent activity)
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", targetUserId)
      .single();

    const { count: messageCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", targetUserId)
      .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // last 24h

    const aiProvider = AIProviderFactory.getProvider("gemini");

    const prompt = `
      Analyze this user profile and activity for spam or bot behavior.
      Profile: ${JSON.stringify(profile)}
      Messages sent in last 24h: ${messageCount}
      
      Determine the risk level (low, medium, high, critical) and list flags if any.
      Return JSON:
      { "risk_level": "low|medium|high|critical", "score": 85, "flags": ["spammy_bio", "mass_messaging"] }
    `;

    const result = await aiProvider.generateJSON<{
      risk_level: string;
      score: number;
      flags: string[];
    }>(prompt, "You are a Trust and Safety AI for a social network.");

    await supabase.from("account_risk_scores").upsert({
      user_id: targetUserId,
      risk_level: result.risk_level,
      score: result.score,
      flags: result.flags,
      updated_at: new Date().toISOString(),
    });

    if (result.risk_level === "high" || result.risk_level === "critical") {
      await supabase.from("safety_flags").insert({
        entity_type: "profile",
        entity_id: targetUserId,
        reason: result.flags.join(", "),
        status: "pending",
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
