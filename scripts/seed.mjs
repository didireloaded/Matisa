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

// We need a helper to insert fake data
// Random items array picker
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const regions = ['Khomas', 'Erongo', 'Oshana', 'Kavango East'];
const avatars = [
  'https://i.pravatar.cc/150?u=1',
  'https://i.pravatar.cc/150?u=2',
  'https://i.pravatar.cc/150?u=3',
  'https://i.pravatar.cc/150?u=4',
  'https://i.pravatar.cc/150?u=5',
];

const postContents = [
  "Just arrived in Windhoek! The vibe here is unmatched right now 🔥",
  "Working on my new beat today. Can't wait to share it with y'all.",
  "Anyone going to the event at The Brewers Market tonight?",
  "Sunset over Swakopmund... breathtaking.",
  "Looking for a photographer for a quick shoot this weekend.",
  "Check out this new track I just dropped!",
  "Where's the best kapana in town right now?",
  "Matisa! How is everyone doing today?",
];

async function seed() {
  console.log('Seeding fake data...');

  // 1. Create fake users
  const userIds = [];
  for (let i = 0; i < 20; i++) {
    const id = `fake-user-${i}-${Date.now()}`;
    userIds.push(id);
    await supabase.from('profiles').insert({
      id,
      username: `namibian_${i}`,
      display_name: `Fake User ${i}`,
      bio: "Just a fake user bio here in Namibia.",
      avatar_url: pick(avatars),
      region: pick(regions),
      city: 'Windhoek',
      ghost_mode: 'exact',
    });
  }
  console.log('Created 20 users.');

  // 2. Create posts
  for (let i = 0; i < 15; i++) {
    await supabase.from('posts').insert({
      user_id: pick(userIds),
      content: pick(postContents),
      type: 'text',
      region: pick(regions),
      like_count: rInt(0, 50),
      comment_count: rInt(0, 10),
    });
  }
  console.log('Created 15 posts.');

  // 3. Create events
  for (let i = 0; i < 10; i++) {
    const start = new Date(Date.now() + rInt(1, 14) * 86400000);
    const end = new Date(start.getTime() + 4 * 3600000);
    await supabase.from('events').insert({
      created_by: pick(userIds),
      title: `Awesome Event ${i}`,
      description: 'Come join us for the best event in Namibia this week.',
      location_name: 'The Brewers Market',
      region: pick(regions),
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      is_free: i % 2 === 0,
      ticket_price: i % 2 === 0 ? 0 : 150,
      rsvp_count: rInt(5, 50),
    });
  }
  console.log('Created 10 events.');

  // Note: We don't have tables for songs/messages fully defined yet with the same ease, 
  // but if needed we can add them. The UI heavily relies on profiles, posts, and events right now.

  console.log('Seeding complete!');
}

seed().catch(console.error);
