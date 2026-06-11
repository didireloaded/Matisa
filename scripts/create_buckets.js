import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE URL or SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBuckets() {
  const bucketsToCreate = ['stories_media', 'avatars'];

  for (const bucket of bucketsToCreate) {
    const { data, error } = await supabase.storage.createBucket(bucket, {
      public: true,
      allowedMimeTypes: ['image/*', 'video/*', 'audio/*'],
    });
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`Bucket ${bucket} already exists.`);
      } else {
        console.error(`Error creating bucket ${bucket}:`, error.message);
      }
    } else {
      console.log(`Created bucket ${bucket}`);
    }
  }
}

createBuckets();
