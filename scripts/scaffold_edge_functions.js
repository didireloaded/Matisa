import fs from 'fs';
import path from 'path';

const functions = [
    'createVoiceRoom',
    'joinVoiceRoom',
    'leaveVoiceRoom',
    'requestSpeaker',
    'approveSpeaker',
    'createKaraokeRoom',
    'joinQueue',
    'leaveQueue',
    'submitPerformance',
    'calculatePerformanceScore',
    'updateVoiceAnalytics'
];

const template = `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    const body = await req.json()
    // TODO: Implement logic

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
`;

const basePath = path.join(process.cwd(), 'supabase', 'functions');

functions.forEach(func => {
    const funcPath = path.join(basePath, func);
    if (!fs.existsSync(funcPath)) {
        fs.mkdirSync(funcPath, { recursive: true });
    }
    fs.writeFileSync(path.join(funcPath, 'index.ts'), template);
    console.log(`Created function: ${func}`);
});
