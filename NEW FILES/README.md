
# MATISA BACKEND SYSTEM v2.0
## Complete Database Schema + Mock Data + API Design

---

## 📦 What's Included

| File | Description | Size |
|------|-------------|------|
| `matisa_schema.sql` | Complete PostgreSQL schema with RLS, indexes, triggers, functions | ~29KB |
| `matisa_seed_data.sql` | 3,000+ lines of realistic Namibian mock data | ~609KB |
| `matisa_features_and_experience.md` | User-centric feature list & experience design | ~11KB |
| `matisa_edge_functions.md` | 20+ Supabase Edge Functions specification | ~11KB |

---

## 📊 Mock Data Overview

### Users (50 Profiles)
- Realistic Namibian names (Oshiwambo, Afrikaans, English)
- Distributed across 10 Namibian cities with real coordinates
- Varied interests, skills, languages, and availability statuses
- Mix of verified/creator accounts
- Voice intros on ~40% of profiles

### Social Graph
- **196 Follows** — realistic follow relationships
- **60 Friend Requests** — mix of pending and accepted

### Content (100 Notes)
- Text and voice notes with realistic Namibian content
- Topics: events, jobs, music, food, tech, photography
- Location-tagged to Namibian cities
- Engagement scores calculated automatically
- **500 Likes** and **454 Replies** distributed naturally

### Events (20 Events)
- Real event titles and descriptions
- Located at actual Namibian venues
- Mix of upcoming, ongoing, and completed
- **300 RSVPs** across all events
- Price range: Free to NAD 200

### Voice Rooms (15 Rooms)
- Mix of live and scheduled rooms
- **200 Participants** with roles (host, speaker, listener)
- Topic tags for discovery
- Listener counts from 5 to 150

### Stories (40 Stories)
- 24-hour ephemeral content
- **1,834 Views** distributed across stories
- Mix of images and videos

### Messaging (35 Conversations)
- 30 direct messages + 5 group chats
- **93 Members** across conversations
- **364 Messages** with text, voice, and images
- **100 Reactions** on messages

### Notifications (200)
- Mix of follow, like, reply, room invite, event reminder
- Read/unread distribution

### Activities (300)
- User activity tracking for analytics

---

## 🗄️ Database Schema Highlights

### Tables (25 total)

**Core Identity:**
- `profiles` — User profiles with scoring system
- `user_settings` — Privacy, notifications, preferences

**Social Graph:**
- `follows` — One-way follows
- `friends` — Two-way friend requests
- `blocks` — User blocking
- `profile_views` — Profile view tracking

**Content:**
- `notes` — Text/voice posts with engagement scoring
- `note_replies` — Threaded replies
- `note_likes` — Like tracking
- `note_saves` — Bookmark tracking
- `stories` — Ephemeral 24-hour content
- `story_views` — Story view tracking
- `story_reactions` — Story reactions

**Audio:**
- `voice_rooms` — Live audio rooms
- `room_participants` — Room membership
- `karaoke_queue` — Karaoke performance queue
- `music_tracks` — Song library

**Events:**
- `events` — Event listings
- `event_attendees` — RSVP tracking

**Messaging:**
- `conversations` — Chat threads
- `conversation_members` — Group membership
- `messages` — Chat messages
- `message_reactions` — Message reactions

**System:**
- `notifications` — Push/in-app notifications
- `activities` — User activity log
- `search_history` — Search tracking
- `trending_searches` — Popular queries
- `reports` — Content moderation

### Key Features

**Row Level Security (RLS):**
- Every table has RLS enabled
- Users can only read/write their own data
- Public content is readable by everyone
- Private rooms require membership

**Auto-Calculated Fields:**
- `master_score` — Composite user score (0-700)
- `engagement_score` — Note ranking algorithm
- Auto-updated `updated_at` timestamps

**Triggers:**
- Follower count updates
- Note reply count updates
- Activity score increments
- Auto-notification on follows

**Indexes:**
- Location-based queries (city, coordinates)
- Time-based sorting (created_at, last_active)
- Engagement scoring
- Full-text search ready

---

## 🚀 Setup Instructions

### 1. Create Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Initialize project
supabase init
```

### 2. Apply Schema
```bash
# Connect to your Supabase project
supabase link --project-ref your-project-ref

# Apply schema
psql -h your-db-host -U postgres -d postgres -f matisa_schema.sql
```

### 3. Seed Data
```bash
# Apply mock data
psql -h your-db-host -U postgres -d postgres -f matisa_seed_data.sql
```

### 4. Configure Auth
```bash
# Enable Phone OTP provider in Supabase Dashboard
# Configure SMS provider (Twilio / Africa's Talking)
# Set up OAuth providers (Google, Apple) if needed
```

### 5. Deploy Edge Functions
```bash
# Create edge functions from the specification
supabase functions new auth-phone-otp
supabase functions new feed-personalized
supabase functions new room-join
# ... etc

# Deploy
supabase functions deploy
```

### 6. Configure Storage
```bash
# Create buckets:
# - avatars (public)
# - covers (public)
# - notes (public)
# - voice (public)
# - stories (public)
# - media (public)

# Set bucket policies for authenticated uploads
```

### 7. Configure Realtime
```bash
# Enable realtime for:
# - voice_rooms (status updates)
# - room_participants (join/leave)
# - messages (new messages)
# - notifications (new notifications)
```

---

## 📱 Client Integration

### Supabase Client Setup
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)
```

### Example Queries

**Get personalized feed:**
```typescript
const { data, error } = await supabase
  .rpc('get_personalized_feed', {
    user_id: currentUser.id,
    limit: 20,
    cursor: null
  })
```

**Get live rooms:**
```typescript
const { data } = await supabase
  .from('voice_rooms')
  .select(`
    *,
    host:profiles(id, display_name, avatar_url),
    participants:room_participants(count)
  `)
  .eq('status', 'live')
  .order('listener_count', { ascending: false })
  .limit(10)
```

**Get nearby people:**
```typescript
const { data } = await supabase
  .rpc('get_nearby_people', {
    lat: -22.5609,
    lng: 17.0658,
    radius_km: 50,
    exclude_ids: [currentUser.id]
  })
```

---

## 🔒 Security Checklist

- [ ] RLS policies applied to all tables
- [ ] Auth hooks configured (user_created, user_deleted)
- [ ] Storage bucket policies set
- [ ] API rate limiting configured
- [ ] CORS origins restricted
- [ ] Service role key secured (never exposed to client)
- [ ] Environment variables for secrets
- [ ] Content moderation pipeline active
- [ ] GDPR/data privacy compliance
- [ ] Backup strategy implemented

---

## 📈 Scaling Considerations

**Current:**
- 50 users, 100 notes, 15 rooms
- Perfect for beta testing

**Phase 2 (1,000 users):**
- Add read replicas for feed queries
- Implement Redis caching for trending content
- Archive old activities (>90 days)
- Compress old voice messages

**Phase 3 (10,000+ users):**
- Shard by city/region
- Implement CDN for media
- Add full-text search (Elasticsearch/Meilisearch)
- Separate analytics database

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | PostgreSQL 15+ (Supabase) |
| Auth | Supabase Auth (Phone OTP + OAuth) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime (WebSockets) |
| Edge Functions | Deno/TypeScript (Supabase) |
| Voice Streaming | LiveKit (WebRTC) |
| Push Notifications | Firebase Cloud Messaging |
| SMS | Africa's Talking / Twilio |
| AI/ML | OpenAI API (Whisper, Moderation) |
| Media Processing | Sharp (images), FFmpeg (audio/video) |

---

## 📝 Next Steps

1. **Apply the schema** to your Supabase project
2. **Seed the data** to make the app feel alive
3. **Implement the edge functions** from the specification
4. **Configure auth** (phone OTP is critical for Namibia)
5. **Set up LiveKit** for voice rooms
6. **Test with real users** in Windhoek first
7. **Iterate based on feedback** — don't add features, refine what works

---

## 🤝 Contributing

This backend is designed for the Matisa app. Feel free to:
- Add more mock data for specific cities
- Extend the schema for new features
- Optimize queries for performance
- Add more edge functions

---

Built for Namibia. Built for people.
