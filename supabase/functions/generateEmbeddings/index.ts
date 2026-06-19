import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock embedding generator
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
    // This expects a webhook payload from Supabase Database Webhooks
    const payload = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // E.g., a new note was inserted
    if (payload.table === 'notes' && payload.type === 'INSERT') {
      const note = payload.record;
      if (note.content) {
        const embedding = generateMockEmbedding(note.content);
        
        await supabaseClient.from('note_embeddings').insert({
          note_id: note.id,
          embedding: embedding
        });
      }
    }
    // E.g., a new user was inserted
    else if (payload.table === 'profiles' && payload.type === 'INSERT') {
      const user = payload.record;
      if (user.bio) {
        const embedding = generateMockEmbedding(user.bio);
        
        await supabaseClient.from('user_embeddings').insert({
          user_id: user.id,
          embedding: embedding
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
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
