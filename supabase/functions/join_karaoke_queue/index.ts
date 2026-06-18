import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../shared/cors.ts";
import { getSupabaseClient } from "../shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = getSupabaseClient(req);

    // Get the user from the auth header
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { room_id, song_title, song_artist } = await req.json();

    if (!room_id || !song_title || !song_artist) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Get the current maximum position in the queue for this room
    const { data: maxPositionData, error: maxPositionError } = await supabaseClient
      .from("karaoke_queue")
      .select("position")
      .eq("room_id", room_id)
      .eq("status", "waiting")
      .order("position", { ascending: false })
      .limit(1);

    if (maxPositionError) {
      throw maxPositionError;
    }

    const nextPosition =
      maxPositionData && maxPositionData.length > 0 ? maxPositionData[0].position + 1 : 1;

    // 2. Insert into queue
    const { data: queueItem, error: insertError } = await supabaseClient
      .from("karaoke_queue")
      .insert({
        room_id,
        user_id: user.id,
        song_title,
        song_artist,
        position: nextPosition,
        status: "waiting",
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ queue_item: queueItem }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in join_karaoke_queue:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
