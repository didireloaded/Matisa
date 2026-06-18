import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../shared/cors.ts";
import { getSupabaseAdmin } from "../shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { recipient_id, title, body, data } = await req.json();
    if (!recipient_id || !title || !body) throw new Error("Missing required fields");

    const supabaseAdmin = getSupabaseAdmin();

    // Get tokens for user
    const { data: tokens, error } = await supabaseAdmin
      .from("push_tokens")
      .select("token")
      .eq("user_id", recipient_id);

    if (error) throw error;

    // Mock FCM logic: In a real app we would use google-auth-library and call FCM APIs
    console.log(
      `[FCM] Sending push "${title}" to ${tokens.length} devices for user ${recipient_id}`,
    );

    return new Response(JSON.stringify({ success: true, devices_notified: tokens.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
