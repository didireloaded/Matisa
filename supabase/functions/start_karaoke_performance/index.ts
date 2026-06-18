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

    const { queue_item_id, room_id } = await req.json();

    if (!queue_item_id || !room_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Get the queue item
    const { data: queueItem, error: queueError } = await supabaseClient
      .from("karaoke_queue")
      .select("*")
      .eq("id", queue_item_id)
      .single();

    if (queueError || !queueItem) {
      throw new Error("Queue item not found");
    }

    // Verify user is the one starting it (or room host - but for simplicity user themselves)
    if (queueItem.user_id !== user.id) {
      // Check if user is host
      const { data: room, error: roomError } = await supabaseClient
        .from("voice_rooms")
        .select("host_id")
        .eq("id", room_id)
        .single();
      if (roomError || room?.host_id !== user.id) {
        throw new Error("Unauthorized to start this performance");
      }
    }

    // 2. Update the queue item status to 'performing'
    await supabaseClient
      .from("karaoke_queue")
      .update({ status: "performing" })
      .eq("id", queue_item_id);

    // 3. Update the voice room current singer and song
    const { data: updatedRoom, error: updateRoomError } = await supabaseClient
      .from("voice_rooms")
      .update({
        current_singer_id: queueItem.user_id,
        current_song_title: queueItem.song_title,
        current_song_artist: queueItem.song_artist,
      })
      .eq("id", room_id)
      .select()
      .single();

    if (updateRoomError) {
      throw updateRoomError;
    }

    // 4. Create a performance record
    const { data: performance, error: perfError } = await supabaseClient
      .from("karaoke_performances")
      .insert({
        room_id,
        user_id: queueItem.user_id,
        song_title: queueItem.song_title,
        song_artist: queueItem.song_artist,
      })
      .select()
      .single();

    if (perfError) {
      throw perfError;
    }

    return new Response(JSON.stringify({ room: updatedRoom, performance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in start_karaoke_performance:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
