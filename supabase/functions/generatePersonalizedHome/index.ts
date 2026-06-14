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

    // Fetch recent posts
    const { data: recentPosts } = await supabase
      .from("posts")
      .select("id, content, like_count, comment_count, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(50);

    const aiProvider = AIProviderFactory.getProvider("gemini");

    const prompt = `
      Rank these posts for a personalized home feed for user ${userId}.
      Prioritize posts with high engagement velocity.
      Posts: ${JSON.stringify(recentPosts)}
      
      Return JSON array of post IDs ordered by relevance:
      ["post_id_1", "post_id_2"]
    `;

    const rankedPostIds = await aiProvider.generateJSON<string[]>(
      prompt,
      "You are an AI ranking algorithm for Matisa.",
    );

    return new Response(JSON.stringify({ rankedFeed: rankedPostIds }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
