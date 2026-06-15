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

async function runAnalytics() {
  console.log('📊 Generating Matisa Platform Analytics...\n');

  try {
    // 1. Total Users
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    
    // 2. Active Stories (Expires > Now)
    const { count: activeStories } = await supabase.from('stories')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', new Date().toISOString());

    // 3. Total Posts
    const { count: totalPosts } = await supabase.from('posts').select('*', { count: 'exact', head: true });

    // 4. Total Events
    const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact', head: true });

    // 5. Total Messages
    const { count: totalMessages } = await supabase.from('messages').select('*', { count: 'exact', head: true });

    // 6. Community Memberships
    const { count: totalMemberships } = await supabase.from('community_members').select('*', { count: 'exact', head: true });

    console.log('=========================================');
    console.log('📈 CURRENT PLATFORM METRICS');
    console.log('=========================================');
    console.log(`👤 Total Registered Users: ${totalUsers || 0}`);
    console.log(`📸 Active 24h Stories:     ${activeStories || 0}`);
    console.log(`📝 Total Feed Posts:       ${totalPosts || 0}`);
    console.log(`📅 Total Hyperlocal Events:${totalEvents || 0}`);
    console.log(`💬 Total Direct Messages:  ${totalMessages || 0}`);
    console.log(`🌍 Community Memberships:  ${totalMemberships || 0}`);
    console.log('=========================================\n');
    console.log('✅ Analytics generated successfully.');

  } catch (err) {
    console.error("Error generating analytics:", err);
  }
}

runAnalytics();
