import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
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

async function runCleanup() {
  console.log('🧹 Running Matisa Cleanup Job...');

  // 1. Delete expired stories
  const now = new Date().toISOString();
  const { data: expiredStories, error: storiesErr } = await supabase
    .from('stories')
    .delete()
    .lt('expires_at', now)
    .select('id');
    
  if (storiesErr) {
    console.error("Error deleting expired stories:", storiesErr);
  } else {
    console.log(`✅ Cleaned up ${expiredStories?.length || 0} expired stories.`);
  }

  // 2. Delete expired events (e.g. older than 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: expiredEvents, error: eventsErr } = await supabase
    .from('events')
    .delete()
    .lt('starts_at', sevenDaysAgo)
    .select('id');

  if (eventsErr) {
    console.error("Error deleting expired events:", eventsErr);
  } else {
    console.log(`✅ Cleaned up ${expiredEvents?.length || 0} old events.`);
  }

  console.log('✨ Cleanup complete!');
}

runCleanup().catch(console.error);
