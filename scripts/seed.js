import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { faker } from '@faker-js/faker';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
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

// Namibian Context Data
const NAMIBIAN_CITIES = [
  { city: 'Windhoek', region: 'Khomas', lat: -22.5609, lng: 17.0658 },
  { city: 'Swakopmund', region: 'Erongo', lat: -22.6792, lng: 14.5272 },
  { city: 'Walvis Bay', region: 'Erongo', lat: -22.9575, lng: 14.5053 },
  { city: 'Otjiwarongo', region: 'Otjozondjupa', lat: -20.4637, lng: 16.6477 },
  { city: 'Oshakati', region: 'Oshana', lat: -17.7833, lng: 15.6833 },
  { city: 'Rundu', region: 'Kavango East', lat: -17.9333, lng: 19.7667 },
  { city: 'Keetmanshoop', region: '//Karas', lat: -26.5833, lng: 18.1333 }
];

const BIOS = [
  "Coffee, cameras and road trips.",
  "Living for the weekend in Swakop.",
  "Tech student at NUST.",
  "UNAM vibes only 📚",
  "Kapana connoisseur.",
  "Amapiano heat all day 🔥",
  "Football fanatic ⚽",
  "Sunset chaser.",
  "Just a Namibian trying to make it."
];

const POST_CONTENTS = [
  "What's the best Kapana spot in Windhoek?",
  "Driving to Swakop today 🚗. Who is around?",
  "Sunset at Independence Avenue was crazy today.",
  "Summer Fiesta highlights were mad. So tired now.",
  "Anyone going to the Night Market this Friday?",
  "Can we talk about how good Namibian beef is?",
  "Log drum is carrying the music industry rn.",
  "NUST exams are stressing me out."
];

const COMMENTS = [
  "Agreed!", "Facts 😂", "Which place?", "I was there yesterday.",
  "So true.", "Bro tell me about it.", "Drop the location pls."
];

const INTERESTS = ['Photography', 'Music', 'Film', 'Tech', 'Fashion', 'Cars', 'Sports', 'Food'];

async function processInBatches(items, batchSize, processFn) {
  let results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processFn));
    results = results.concat(batchResults);
    console.log(`Processed ${Math.min(i + batchSize, items.length)} / ${items.length}`);
  }
  return results;
}

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomEl = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  console.log('🌱 Starting Massive Namibian Seed Process (Pure Social Schema)...');

  const NUM_USERS = 150; 
  const POSTS_PER_USER = 3;
  const COMMENTS_PER_POST = 2;
  const STORIES_COUNT = 50;

  console.log(`\n--- 1. Creating ${NUM_USERS} Users ---`);
  
  const userCreationData = Array.from({ length: NUM_USERS }).map(() => ({
    email: faker.internet.email(),
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      display_name: faker.person.fullName()
    }
  }));

  const createdUsers = [];
  await processInBatches(userCreationData, 10, async (data) => {
    const { data: userData, error } = await supabase.auth.admin.createUser(data);
    if (error) console.error('Error creating user:', error.message);
    if (!error && userData?.user) createdUsers.push(userData.user);
  });
  console.log(`✅ Created ${createdUsers.length} users in auth.users.`);

  console.log('\n--- 2. Updating Profiles ---');
  await new Promise(r => setTimeout(r, 2000)); // wait for trigger

  const profileUpdates = createdUsers.map(u => {
    const loc = randomEl(NAMIBIAN_CITIES);
    return {
      id: u.id,
      username: faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, '') + randomInt(1,999),
      bio: randomEl(BIOS),
      avatar_url: faker.image.avatar(),
      region: loc.region,
      city: loc.city,
      location: `POINT(${loc.lng + (Math.random() - 0.5) * 0.05} ${loc.lat + (Math.random() - 0.5) * 0.05})`,
      mood: randomEl(['chill', 'happy', 'tired', 'party', 'focus'])
    };
  });

  await processInBatches(profileUpdates, 50, async (update) => {
    await supabase.from('profiles').update(update).eq('id', update.id);
  });
  
  // Also insert random interests
  const profileInterests = [];
  for (const u of createdUsers) {
    for (let i=0; i<2; i++) {
      profileInterests.push({ profile_id: u.id, interest: randomEl(INTERESTS) });
    }
  }
  // Deduplicate
  const uniqueInterests = profileInterests.filter((v,i,a)=>a.findIndex(t=>(t.profile_id === v.profile_id && t.interest === v.interest))===i);
  await supabase.from('profile_interests').insert(uniqueInterests);
  
  console.log('✅ Profiles and interests updated.');

  console.log('\n--- 3. Creating Posts ---');
  const postsToInsert = [];
  for (const user of createdUsers) {
    const numPosts = randomInt(1, POSTS_PER_USER);
    for (let i=0; i<numPosts; i++) {
      const type = randomEl(['text', 'photo']);
      let content = type === 'text' ? randomEl(POST_CONTENTS) : "Namibian aesthetics 🇳🇦";
      let media_urls = type === 'photo' ? [faker.image.url()] : null;
      const loc = randomEl(NAMIBIAN_CITIES);

      postsToInsert.push({
        user_id: user.id,
        type,
        content,
        media_urls,
        region: loc.region,
        // location_name: loc.city,
        location: `POINT(${loc.lng} ${loc.lat})`,
        created_at: faker.date.recent({ days: 14 }).toISOString()
      });
    }
  }

  const createdPosts = [];
  for (let i = 0; i < postsToInsert.length; i += 100) {
    const batch = postsToInsert.slice(i, i + 100);
    const { data, error } = await supabase.from('posts').insert(batch).select('id');
    if (error) console.error('Error inserting posts:', error.message);
    if (data) createdPosts.push(...data);
  }
  console.log(`✅ Created ${createdPosts.length} posts.`);

  console.log('\n--- 4. Creating Comments, Likes & Follows ---');
  const commentsToInsert = [];
  const likesToInsert = [];
  for (const post of createdPosts) {
    for (let i=0; i<randomInt(0, COMMENTS_PER_POST); i++) {
      commentsToInsert.push({
        post_id: post.id,
        user_id: randomEl(createdUsers).id,
        content: randomEl(COMMENTS),
        created_at: faker.date.recent({ days: 7 }).toISOString()
      });
    }
    for (let i=0; i<randomInt(0, 5); i++) {
      likesToInsert.push({ post_id: post.id, user_id: randomEl(createdUsers).id });
    }
  }

  // Insert Comments
  for (let i = 0; i < commentsToInsert.length; i += 100) {
    await supabase.from('post_comments').insert(commentsToInsert.slice(i, i + 100));
  }
  
  // Insert Likes (Deduplicate first)
  const uniqueLikes = likesToInsert.filter((v,i,a)=>a.findIndex(t=>(t.post_id === v.post_id && t.user_id === v.user_id))===i);
  for (let i = 0; i < uniqueLikes.length; i += 100) {
    await supabase.from('post_likes').insert(uniqueLikes.slice(i, i + 100));
  }

  // Insert Follows
  const followsToInsert = [];
  for(let i=0; i<200; i++) {
    const f1 = randomEl(createdUsers).id;
    const f2 = randomEl(createdUsers).id;
    if(f1 !== f2) followsToInsert.push({ follower_id: f1, following_id: f2 });
  }
  const uniqueFollows = followsToInsert.filter((v,i,a)=>a.findIndex(t=>(t.follower_id === v.follower_id && t.following_id === v.following_id))===i);
  await supabase.from('follows').insert(uniqueFollows);

  console.log(`✅ Created ${commentsToInsert.length} comments, ${uniqueLikes.length} likes, and ${uniqueFollows.length} follows.`);

  console.log('\n--- 5. Creating Stories ---');
  const storiesToInsert = [];
  for (let i=0; i<STORIES_COUNT; i++) {
    storiesToInsert.push({
      user_id: randomEl(createdUsers).id,
      media_url: faker.image.url(),
      media_type: 'image',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  }
  for (let i = 0; i < storiesToInsert.length; i += 100) {
    await supabase.from('stories').insert(storiesToInsert.slice(i, i + 100));
  }
  console.log(`✅ Created ${storiesToInsert.length} active stories.`);

  console.log('\n--- 6. Joining Communities ---');
  // Communities are pre-inserted by the SQL migration. We just fetch them and assign members.
  const { data: communities } = await supabase.from('communities').select('id');
  if (communities && communities.length > 0) {
    const memberships = [];
    for (const c of communities) {
      for (let i=0; i<10; i++) {
        memberships.push({ community_id: c.id, user_id: randomEl(createdUsers).id });
      }
    }
    const uniqueMemberships = memberships.filter((v,i,a)=>a.findIndex(t=>(t.community_id === v.community_id && t.user_id === v.user_id))===i);
    for (let i = 0; i < uniqueMemberships.length; i += 100) {
      await supabase.from('community_members').insert(uniqueMemberships.slice(i, i + 100));
    }
    console.log(`✅ Joined ${uniqueMemberships.length} community memberships.`);
  }

  console.log('\n--- 7. Creating Events ---');
  const events = [];
  const EVENT_NAMES = ['Windhoek Night Market', 'Cars & Coffee', 'Music Fridays'];
  for (const eventName of EVENT_NAMES) {
    const loc = randomEl(NAMIBIAN_CITIES);
    const { data, error } = await supabase.from('events').insert({
      created_by: randomEl(createdUsers).id,
      title: eventName,
      description: `Join us for ${eventName}! Good vibes, great people.`,
      // location_name: loc.city,
      region: loc.region,
      location: `POINT(${loc.lng} ${loc.lat})`,
      starts_at: new Date(Date.now() + randomInt(1, 14) * 24 * 60 * 60 * 1000).toISOString(),
      cover_url: faker.image.url()
    }).select().single();
    if (error) console.error('Error inserting event:', error.message);
    if (data) events.push(data);
  }

  if (events.length > 0) {
    const attendees = [];
    for (const event of events) {
      for (let i = 0; i < randomInt(5, 15); i++) {
        attendees.push({ event_id: event.id, user_id: randomEl(createdUsers).id });
      }
    }
    const uniqueAttendees = attendees.filter((v,i,a)=>a.findIndex(t=>(t.event_id === v.event_id && t.user_id === v.user_id))===i);
    await supabase.from('event_rsvps').insert(uniqueAttendees);
    console.log(`✅ Created ${events.length} Events and ${uniqueAttendees.length} RSVPs.`);
  }

  console.log('\n🎉 ALL DONE! The Pure Social Matisa schema is now seeded.');
}

seed().catch(console.error);