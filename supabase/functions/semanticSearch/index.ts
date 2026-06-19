import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// A mock embedding generator (returns a 1536-dimensional array of floats)
// In production, this would call OpenAI's text-embedding-ada-002 or similar
function generateMockEmbedding(text: string) {
  const seed = text.length;
  const embedding = new Array(1536).fill(0).map((_, i) => {
    return Math.sin(seed + i) * 0.1; 
  });
  return embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, type = 'all', limit = 10 } = await req.json();

    if (!query) {
      throw new Error('Query is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const embedding = generateMockEmbedding(query);

    let results = {};

    // 1. Search Users
    if (type === 'all' || type === 'users') {
      const { data: users, error: userError } = await supabaseClient.rpc('match_users', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
      });
      if (!userError) results.users = users;
    }

    // 2. Search Notes
    if (type === 'all' || type === 'notes') {
      const { data: notes, error: noteError } = await supabaseClient.rpc('match_notes', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
      });
      if (!noteError) results.notes = notes;
    }

    // 3. Search Opportunities
    if (type === 'all' || type === 'opportunities') {
      const { data: opportunities, error: oppError } = await supabaseClient.rpc('match_opportunities', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
      });
      if (!oppError) results.opportunities = opportunities;
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
