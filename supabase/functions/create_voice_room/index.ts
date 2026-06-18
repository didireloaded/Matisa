import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../shared/cors.ts";
import { getSupabaseAdmin } from "../shared/supabase.ts";
import { generateLiveKitToken } from "../shared/livekit.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, description, is_private, user_id } = await req.json();

    if (!title || !user_id) {
      throw new Error("Title and user_id are required");
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Create the room in the database
    const { data: roomData, error: roomError } = await supabaseAdmin
      .from("voice_rooms")
      .insert({
        title,
        description,
        created_by: user_id,
        is_private: is_private ?? false,
      })
      .select("id")
      .single();

    if (roomError) throw roomError;
    const roomId = roomData.id;

    // Update with LiveKit ID (could just use our UUID as LiveKit room name)
    await supabaseAdmin.from("voice_rooms").update({ livekit_room_id: roomId }).eq("id", roomId);

    // Generate token for creator
    const token = await generateLiveKitToken(roomId, user_id, "Host");

    return new Response(JSON.stringify({ room_id: roomId, token }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
