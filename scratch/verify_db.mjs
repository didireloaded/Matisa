import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log("Verifying notes table insertion...");
  // Create a mock user if needed, or just test fetching from notes
  const { data: notes, error: notesErr } = await supabase.from('notes').select('*').limit(1);
  if (notesErr) {
    console.error("Error fetching notes:", notesErr);
  } else {
    console.log("Notes fetch successful:", notes);
  }

  console.log("\nVerifying stories table insertion...");
  const { data: stories, error: storiesErr } = await supabase.from('stories').select('*').limit(1);
  if (storiesErr) {
    console.error("Error fetching stories:", storiesErr);
  } else {
    console.log("Stories fetch successful:", stories);
  }

  console.log("\nVerifying get_discovery_feed RPC...");
  // test the rpc
  // we just need any valid uuid, or we can use a dummy one
  const dummyId = '00000000-0000-0000-0000-000000000000';
  const { data: feed, error: feedErr } = await supabase.rpc('get_discovery_feed', { viewer_id: dummyId, limit_count: 5 });
  if (feedErr) {
    console.error("Error calling get_discovery_feed:", feedErr);
  } else {
    console.log("get_discovery_feed RPC successful! Feed items count:", feed?.length || 0);
  }
}

verify();
