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
    const { type = 'opportunities', limit = 10 } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the user making the request
    const { data: { user } } = await supabaseClient.auth.getUser();

    let results = [];

    if (type === 'opportunities') {
      // In production, this would query the `opportunities` table and rank them
      // against the `user_interests` and `user_behavior` tables.
      // For now, we simulate pulling opportunities from the DB.
      const { data, error } = await supabaseClient
        .from('opportunities')
        .select(`
          id, title, description, budget, location, type, tags,
          creator:creator_id ( id, display_name, avatar_url )
        `)
        .limit(limit);
        
      if (error) throw error;
      
      // Simulate scoring (inject a match score)
      results = (data || []).map(opp => ({
        ...opp,
        matchScore: Math.floor(Math.random() * 30) + 70 // 70-100 score
      })).sort((a, b) => b.matchScore - a.matchScore);
    } 
    else if (type === 'events') {
       // Simulate event fetch
       const { data, error } = await supabaseClient
         .from('events')
         .select('*')
         .limit(limit);
       
       if (error && error.code !== '42P01') throw error; // ignore table not found for mock
       results = data || [];
    }

    return new Response(
      JSON.stringify(results),
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
