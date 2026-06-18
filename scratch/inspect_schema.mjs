import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf-8');
const VITE_SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const VITE_SUPABASE_ANON_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function inspect() {
  console.log('--- Inspecting notes columns via SQL ---');
  // Since we cannot run raw sql directly without an RPC, let's try querying notes by selecting all columns explicitly or trying to insert a dummy row.
  // Wait! Let's try to query the columns using a custom RPC or select from storage/api if possible,
  // or we can select columns we know and see if it fails.
  const possibleNotesCols = ['id', 'user_id', 'content', 'created_at', 'expires_at', 'type', 'audio_url', 'duration_seconds', 'waveform_data', 'heart_count', 'fire_count', 'laugh_count'];
  for (const col of possibleNotesCols) {
    const { error } = await supabase.from('notes').select(col).limit(1);
    if (error) {
      console.log(`Column "${col}" in notes: NOT AVAILABLE (${error.message})`);
    } else {
      console.log(`Column "${col}" in notes: EXISTS`);
    }
  }

  console.log('\n--- Inspecting stories columns via SQL ---');
  const possibleStoriesCols = ['id', 'user_id', 'media_url', 'media_type', 'caption', 'gradient', 'expires_at', 'created_at'];
  for (const col of possibleStoriesCols) {
    const { error } = await supabase.from('stories').select(col).limit(1);
    if (error) {
      console.log(`Column "${col}" in stories: NOT AVAILABLE (${error.message})`);
    } else {
      console.log(`Column "${col}" in stories: EXISTS`);
    }
  }
}
inspect();
