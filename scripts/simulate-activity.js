import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { faker } from '@faker-js/faker';

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

const POST_CONTENTS = [
  "Just found a new spot in town! ☕",
  "Is anyone else experiencing this crazy weather?",
  "Need recommendations for a good weekend getaway.",
  "What a match today! ⚽",
  "Working late again... send coffee.",
  "Amapiano is the only thing getting me through today.",
  "Who is at the Night Market?",
  "Weekend loading... ⏳"
];

const COMMENTS = [
  "Facts!", "Where is this?", "I need to check this out.",
  "Bro same.", "😂😂😂", "Looks amazing!", "Drop the pin!"
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomEl = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function simulate() {
  console.log('🤖 Simulating new social activity...');

  // 1. Fetch 10 random users
  const { data: users, error: usersErr } = await supabase.from('profiles').select('id, region, location').limit(50);
  if (usersErr || !users || users.length === 0) {
    console.error("Could not fetch users to simulate activity");
    return;
  }

  // 2. Fetch 20 recent posts to interact with
  const { data: recentPosts } = await supabase.from('posts').select('id').order('created_at', { ascending: false }).limit(20);

  const activeUsers = users.sort(() => 0.5 - Math.random()).slice(0, 5);

  for (const user of activeUsers) {
    // 30% chance to create a new post
    if (Math.random() > 0.7) {
      const type = randomEl(['text', 'photo']);
      const content = randomEl(POST_CONTENTS);
      const media_urls = type === 'photo' ? [faker.image.url()] : null;
      
      const { error: postErr } = await supabase.from('posts').insert({
        user_id: user.id,
        type,
        content,
        media_urls,
        region: user.region,
        location: user.location
      });
      if (!postErr) console.log(`📝 User ${user.id.substring(0, 8)} created a new post.`);
    }

    if (recentPosts && recentPosts.length > 0) {
      // 50% chance to like a random post
      if (Math.random() > 0.5) {
        const post = randomEl(recentPosts);
        const { error: likeErr } = await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
        if (!likeErr || likeErr.code === '23505') { // ignore unique violation if already liked
          console.log(`❤️ User ${user.id.substring(0, 8)} liked post ${post.id.substring(0, 8)}.`);
        }
      }

      // 30% chance to comment on a random post
      if (Math.random() > 0.7) {
        const post = randomEl(recentPosts);
        const { error: commentErr } = await supabase.from('post_comments').insert({
          post_id: post.id,
          user_id: user.id,
          content: randomEl(COMMENTS)
        });
        if (!commentErr) console.log(`💬 User ${user.id.substring(0, 8)} commented on post ${post.id.substring(0, 8)}.`);
      }
    }
  }

  console.log('✅ Activity simulation complete.');
}

simulate().catch(console.error);
