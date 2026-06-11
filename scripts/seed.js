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
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Namibian Context Data
const NAMIBIAN_CITIES = [
  { city: 'Windhoek', lat: -22.5609, lng: 17.0658 },
  { city: 'Swakopmund', lat: -22.6792, lng: 14.5272 },
  { city: 'Walvis Bay', lat: -22.9575, lng: 14.5053 },
  { city: 'Otjiwarongo', lat: -20.4637, lng: 16.6477 },
  { city: 'Oshakati', lat: -17.7833, lng: 15.6833 },
  { city: 'Rundu', lat: -17.9333, lng: 19.7667 },
  { city: 'Keetmanshoop', lat: -26.5833, lng: 18.1333 }
];

const BIOS = [
  "Coffee, cameras and road trips.",
  "Music lover.",
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
  "NUST exams are stressing me out.",
  "Looking for a good graphic designer in Walvis Bay.",
  "Sundowners in Swakopmund hit different."
];

const COMMENTS = [
  "Agreed!",
  "Facts 😂",
  "Which place?",
  "I was there yesterday.",
  "So true.",
  "Bro tell me about it.",
  "Drop the location pls.",
  "Love this!",
  "Namibia is too small for this drama.",
  "Aweee"
];

const COMMUNITY_NAMES = [
  "Windhoek Community", "Foodies Namibia", "Cars Namibia", 
  "Football Namibia", "Travel Namibia", "Students Namibia", 
  "Music Namibia", "Photography Namibia", "Gaming Namibia"
];

// Helper to batch array processing
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

// Generate random int
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomEl = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  console.log('🌱 Starting Massive Namibian Seed Process...');
  console.log('This will create the illusion of life in Matisa.');

  // Configuration
  const NUM_USERS = 200; // Lowered from 500 for script execution speed, but still a lot
  const POSTS_PER_USER = 5;
  const COMMENTS_PER_POST = 3;
  const STORIES_COUNT = 150;

  console.log(`\n--- 1. Creating ${NUM_USERS} Users ---`);
  
  const userCreationData = Array.from({ length: NUM_USERS }).map((_, i) => ({
    email: faker.internet.email(),
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: faker.person.fullName(),
      avatar_url: faker.image.avatar()
    }
  }));

  const createdUsers = [];
  
  // We use admin.createUser to bypass email confirmations and RLS
  await processInBatches(userCreationData, 10, async (data) => {
    const { data: userData, error } = await supabase.auth.admin.createUser(data);
    if (!error && userData?.user) {
      createdUsers.push(userData.user);
    }
  });

  console.log(`✅ Created ${createdUsers.length} users in auth.users.`);

  console.log('\n--- 2. Updating Profiles ---');
  // Wait a sec for the triggers to finish inserting profiles
  await new Promise(r => setTimeout(r, 2000));

  const profileUpdates = createdUsers.map(u => {
    const loc = randomEl(NAMIBIAN_CITIES);
    return {
      id: u.id,
      username: faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, '') + randomInt(1,99),
      bio: randomEl(BIOS),
      lat: loc.lat + (Math.random() - 0.5) * 0.05,
      lng: loc.lng + (Math.random() - 0.5) * 0.05,
      mood: randomEl(['chill', 'happy', 'tired', 'party', 'focus'])
    };
  });

  await processInBatches(profileUpdates, 50, async (update) => {
    await supabase.from('profiles').update(update).eq('id', update.id);
  });
  console.log('✅ Profiles updated with Namibian context.');

  console.log('\n--- 3. Creating Communities ---');
  const communities = [];
  for (const name of COMMUNITY_NAMES) {
    const { data, error } = await supabase.from('communities').insert([{
      name: name,
      description: `The official ${name} community on Matisa.`,
      cover_url: faker.image.urlLoremFlickr({ category: 'city' })
    }]).select().single();
    if (data) communities.push(data);
  }
  console.log(`✅ Created ${communities.length} communities.`);

  console.log('\n--- 4. Creating Posts ---');
  const postsToInsert = [];
  for (const user of createdUsers) {
    const numPosts = randomInt(1, POSTS_PER_USER);
    for (let i=0; i<numPosts; i++) {
      const type = randomEl(['text', 'photo', 'voice']);
      let content = type === 'text' ? randomEl(POST_CONTENTS) : '';
      let media_url = null;
      let voice_duration = null;
      
      if (type === 'photo') {
        content = "Namibian aesthetics 🇳🇦";
        media_url = faker.image.urlLoremFlickr({ category: 'nature' });
      } else if (type === 'voice') {
        voice_duration = randomInt(5, 45);
        media_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // mock voice
      }

      postsToInsert.push({
        user_id: user.id,
        type,
        content,
        media_url,
        voice_duration,
        created_at: faker.date.recent({ days: 14 }).toISOString()
      });
    }
  }

  const createdPosts = [];
  // Bulk insert in chunks of 100
  for (let i = 0; i < postsToInsert.length; i += 100) {
    const batch = postsToInsert.slice(i, i + 100);
    const { data } = await supabase.from('posts').insert(batch).select('id');
    if (data) createdPosts.push(...data);
  }
  console.log(`✅ Created ${createdPosts.length} posts.`);

  console.log('\n--- 5. Creating Comments ---');
  const commentsToInsert = [];
  for (const post of createdPosts) {
    const numComments = randomInt(0, COMMENTS_PER_POST);
    for (let i=0; i<numComments; i++) {
      commentsToInsert.push({
        post_id: post.id,
        user_id: randomEl(createdUsers).id,
        content: randomEl(COMMENTS),
        created_at: faker.date.recent({ days: 7 }).toISOString()
      });
    }
  }

  for (let i = 0; i < commentsToInsert.length; i += 100) {
    const batch = commentsToInsert.slice(i, i + 100);
    await supabase.from('comments').insert(batch);
  }
  console.log(`✅ Created ${commentsToInsert.length} comments.`);

  console.log('\n--- 6. Creating Stories ---');
  const storiesToInsert = [];
  for (let i=0; i<STORIES_COUNT; i++) {
    storiesToInsert.push({
      author_id: randomEl(createdUsers).id,
      media_url: faker.image.urlLoremFlickr({ category: 'people' }),
      media_type: 'image',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  for (let i = 0; i < storiesToInsert.length; i += 100) {
    const batch = storiesToInsert.slice(i, i + 100);
    await supabase.from('stories').insert(batch);
  }
  console.log(`✅ Created ${storiesToInsert.length} active stories.`);

  console.log('\n--- 7. Creating Karaoke Sessions ---');
  const karaokeRooms = [];
  for (let i=0; i<15; i++) {
    const host = randomEl(createdUsers);
    karaokeRooms.push({
      host_id: host.id,
      title: `Friday Night Karaoke with ${host.user_metadata?.full_name || 'Friends'}`,
      is_live: true,
      listeners_count: randomInt(5, 50),
      started_at: faker.date.recent({ days: 1 }).toISOString()
    });
  }

  const { data: createdRooms } = await supabase.from('karaoke_rooms').insert(karaokeRooms).select('id');
  if (createdRooms) {
    const participants = [];
    for (const room of createdRooms) {
      // Add random listeners
      for(let j=0; j<randomInt(2, 8); j++) {
        participants.push({
          room_id: room.id,
          user_id: randomEl(createdUsers).id,
          role: 'listener'
        });
      }
      // Add a singer
      participants.push({
        room_id: room.id,
        user_id: randomEl(createdUsers).id,
        role: 'singer',
        is_singing: true,
        is_muted: false
      });
    }
    // Remove duplicate user in same room if any using Set
    const uniqueParts = [];
    const seen = new Set();
    for (const p of participants) {
      const key = `${p.room_id}-${p.user_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueParts.push(p);
      }
    }

    for (let i = 0; i < uniqueParts.length; i += 100) {
      const batch = uniqueParts.slice(i, i + 100);
      await supabase.from('karaoke_participants').insert(batch);
    }
    console.log(`✅ Created ${createdRooms.length} Karaoke Rooms and ${uniqueParts.length} participants.`);
  }

  console.log('\n--- 8. Creating Events ---');
  const events = [];
  const EVENT_NAMES = ['Summer Fiesta', 'Windhoek Night Market', 'Cars & Coffee', 'Music Fridays', 'University Social'];
  for (const eventName of EVENT_NAMES) {
    const creator = randomEl(createdUsers);
    const { data } = await supabase.from('events').insert({
      creator_id: creator.id,
      title: eventName,
      description: `Join us for ${eventName}! Good vibes, great people.`,
      location_name: randomEl(NAMIBIAN_CITIES).city,
      event_date: new Date(Date.now() + randomInt(1, 14) * 24 * 60 * 60 * 1000).toISOString(),
      cover_url: faker.image.urlLoremFlickr({ category: 'party' })
    }).select().single();
    if (data) events.push(data);
  }

  if (events.length > 0) {
    const attendees = [];
    for (const event of events) {
      for (let i = 0; i < randomInt(10, 30); i++) {
        attendees.push({
          event_id: event.id,
          user_id: randomEl(createdUsers).id
        });
      }
    }
    // Remove duplicates
    const uniqueAttendees = [];
    const seenAttendees = new Set();
    for (const a of attendees) {
      const key = `${a.event_id}-${a.user_id}`;
      if (!seenAttendees.has(key)) {
        seenAttendees.add(key);
        uniqueAttendees.push(a);
      }
    }
    await supabase.from('event_attendees').insert(uniqueAttendees);
    console.log(`✅ Created ${events.length} Events and ${uniqueAttendees.length} RSVPs.`);
  }

  console.log('\n--- 9. Creating Playlists ---');
  const playlists = [];
  const PLAYLIST_NAMES = ['Friday Vibes 🇳🇦', 'Roadtrip Playlist', 'Amapiano Heat', 'Namibia Top Hits', 'Sunday Chill'];
  for (const pName of PLAYLIST_NAMES) {
    const creator = randomEl(createdUsers);
    const { data } = await supabase.from('playlists').insert({
      creator_id: creator.id,
      title: pName,
      description: `Curated sounds for the Namibian soul.`,
      cover_url: faker.image.urlLoremFlickr({ category: 'music' })
    }).select().single();
    if (data) playlists.push(data);
  }

  if (playlists.length > 0) {
    const tracks = [];
    const followers = [];
    for (const playlist of playlists) {
      for (let i = 0; i < 20; i++) {
        tracks.push({
          playlist_id: playlist.id,
          title: `Track ${i + 1}`,
          artist: randomEl(['King Tee Dee', 'Gazza', 'Top Cheri', 'Lioness', 'DJ Spuzza', 'Kabza De Small', 'Uncle Waffles']),
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          duration: randomInt(120, 300)
        });
      }
      for (let i = 0; i < randomInt(10, 40); i++) {
        followers.push({
          playlist_id: playlist.id,
          user_id: randomEl(createdUsers).id
        });
      }
    }
    await processInBatches(tracks, 100, async (batch) => {
      await supabase.from('playlist_tracks').insert(batch);
    });
    
    const uniqueFollowers = [];
    const seenFollowers = new Set();
    for (const f of followers) {
      const key = `${f.playlist_id}-${f.user_id}`;
      if (!seenFollowers.has(key)) {
        seenFollowers.add(key);
        uniqueFollowers.push(f);
      }
    }
    await supabase.from('playlist_followers').insert(uniqueFollowers);
    console.log(`✅ Created ${playlists.length} Playlists, ${tracks.length} Tracks, and ${uniqueFollowers.length} Followers.`);
  }

  console.log('\n🎉 ALL DONE! The Matisa illusion of life is complete.');
  console.log('Login with any created user or create a new one to see the feed.');
}

seed().catch(console.error);
