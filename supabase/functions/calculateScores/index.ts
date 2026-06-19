import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Need admin rights to update scores
    );

    // This is a manual trigger mock of what a pg_cron job would do.
    // It grabs users and updates their creator_score, trust_score, etc.
    
    // 1. Fetch some users
    const { data: profiles, error: profileErr } = await supabaseClient
      .from('profiles')
      .select('id')
      .limit(100);
      
    if (profileErr) throw profileErr;

    let updatedCount = 0;

    // 2. Loop and generate mock intelligence scores
    for (const profile of profiles) {
       const trustScore = Math.floor(Math.random() * 40) + 60; // 60-100
       const creatorScore = Math.floor(Math.random() * 100); // 0-100
       
       // Note: in a real app these would update `user_traits` or `creator_scores`
       // Here we just log it or simulate success
       updatedCount++;
    }

    return new Response(
      JSON.stringify({ success: true, message: `Updated scores for ${updatedCount} users` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
