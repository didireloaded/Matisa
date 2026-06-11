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
envFile.split('
').forEach(line => {
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
  "Anyone going to the
<truncated 8437 bytes>