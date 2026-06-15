import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
let envFile;
try {
  envFile = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.error("Could not find .env.local file. Please ensure it exists.");
  process.exit(1);
}

const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#]+?)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function recalculateCounts() {
  console.log('🔄 Starting Data Drift Recalculation...\n');
  console.log('This script ensures all denormalized counts (follower_count, post_count, etc.) match the actual rows in the database.\n');

  try {
    // 1. Fetch all profiles
    const { data: profiles, error: profileErr } = await supabase.from('profiles').select('id');
    if (profileErr || !profiles) throw new Error("Could not fetch profiles.");

    console.log(`Scanning ${profiles.length} profiles...`);

    let fixedCount = 0;

    for (const profile of profiles) {
      // Get actual post count
      const { count: actualPostCount } = await supabase.from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      // Get actual follower count
      const { count: actualFollowerCount } = await supabase.from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id);

      // Get actual following count
      const { count: actualFollowingCount } = await supabase.from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id);

      // Update the profile
      const { error: updateErr } = await supabase.from('profiles').update({
        post_count: actualPostCount || 0,
        follower_count: actualFollowerCount || 0,
        following_count: actualFollowingCount || 0
      }).eq('id', profile.id);

      if (updateErr) {
        console.error(`❌ Failed to update profile ${profile.id}:`, updateErr.message);
      } else {
        fixedCount++;
        if (fixedCount % 50 === 0) {
          console.log(`...recalculated ${fixedCount} profiles`);
        }
      }
    }

    console.log(`\n✅ Recalculation complete! Fixed drift for ${fixedCount} profiles.`);

  } catch (err) {
    console.error("Error during recalculation:", err.message);
  }
}

recalculateCounts();
