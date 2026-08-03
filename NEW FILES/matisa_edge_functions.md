
# MATISA EDGE FUNCTIONS
# Supabase Edge Functions (Deno/TypeScript)

---

## 1. AUTH & ONBOARDING

### `auth-guest-session`
Creates a temporary guest session for browsing without signup.
```typescript
// POST /functions/v1/auth-guest-session
// Returns: { token: string, expires_at: string }
// Creates an anonymous user in auth.users with is_anonymous=true
// Guest can browse but cannot create content
```

### `auth-phone-otp`
Phone number verification using OTP.
```typescript
// POST /functions/v1/auth-phone-otp
// Body: { phone: string, country_code: string }
// Returns: { message_id: string, expires_in: number }
// Uses Twilio or Africa's Talking for SMS
```

### `auth-verify-otp`
Verify OTP and create/authenticate user.
```typescript
// POST /functions/v1/auth-verify-otp
// Body: { phone: string, otp: string }
// Returns: { session: Session, user: User, is_new_user: boolean }
// Creates profile automatically on first login
```

### `onboarding-complete`
Completes user onboarding and calculates initial scores.
```typescript
// POST /functions/v1/onboarding-complete
// Body: { interests: string[], skills: string[], location: { city, lat, lng } }
// Returns: { profile: Profile, recommendations: Profile[] }
// Triggers initial people discovery recommendations
```

---

## 2. FEED & DISCOVERY

### `feed-personalized`
Generates the personalized home feed.
```typescript
// POST /functions/v1/feed-personalized
// Headers: Authorization: Bearer <token>
// Body: { cursor?: string, limit?: number }
// Returns: {
//   items: FeedItem[],
//   next_cursor: string,
//   has_more: boolean
// }
// FeedItem = Note | RoomCard | EventCard | PeopleCard
// Algorithm: recency + location + interests + social_graph + engagement
```

### `discover-nearby`
Finds people, events, and content near the user.
```typescript
// POST /functions/v1/discover-nearby
// Body: { lat: number, lng: number, radius_km?: number, type?: 'people'|'events'|'notes'|'rooms' }
// Returns: { results: any[], total: number }
// Uses PostGIS for geospatial queries
```

### `search-unified`
Unified search across all content types.
```typescript
// POST /functions/v1/search-unified
// Body: { query: string, filters?: { type?: string[], location?: string }, limit?: number }
// Returns: { results: SearchResult[], suggestions: string[] }
// Full-text search using PostgreSQL tsvector
```

### `trending-content`
Gets trending content for the user's city.
```typescript
// GET /functions/v1/trending-content?city=Windhoek&period=today
// Returns: { notes: Note[], rooms: Room[], events: Event[], topics: string[] }
```

---

## 3. VOICE ROOMS

### `room-create`
Creates a new voice room.
```typescript
// POST /functions/v1/room-create
// Body: { title: string, description?: string, type: 'voice'|'karaoke'|'stage', topic_tags?: string[], max_participants?: number, is_private?: boolean, scheduled_start?: string }
// Returns: { room: VoiceRoom, token: string }
// Generates LiveKit token for host
```

### `room-join`
Joins a voice room and returns connection credentials.
```typescript
// POST /functions/v1/room-join
// Body: { room_id: string }
// Returns: { token: string, room: VoiceRoom, participants: Participant[] }
// Generates LiveKit token for participant
```

### `room-leave`
Records room exit and updates analytics.
```typescript
// POST /functions/v1/room-leave
// Body: { room_id: string, time_spent_seconds: number }
// Returns: { success: boolean }
// Updates room_participants and user activity scores
```

### `room-karaoke-queue`
Manages karaoke queue.
```typescript
// POST /functions/v1/room-karaoke-queue
// Body: { room_id: string, action: 'add'|'remove'|'reorder', song_title: string, song_artist?: string }
// Returns: { queue: KaraokeQueueItem[], current_position: number }
```

### `room-karaoke-rate`
Rates a karaoke performance.
```typescript
// POST /functions/v1/room-karaoke-rate
// Body: { performance_id: string, rating: number }
// Returns: { average_rating: number, total_ratings: number }
```

---

## 4. MESSAGING

### `message-send`
Sends a message with support for voice and media.
```typescript
// POST /functions/v1/message-send
// Body: { conversation_id: string, content?: string, type: 'text'|'voice'|'image', voice_url?: string, media_urls?: string[] }
// Returns: { message: Message }
// Handles voice transcription via Whisper API
// Updates conversation last_message preview
```

### `message-transcribe`
Transcribes voice messages.
```typescript
// POST /functions/v1/message-transcribe
// Body: { voice_url: string }
// Returns: { transcript: string, confidence: number }
// Uses OpenAI Whisper or Google Speech-to-Text
```

### `conversation-create`
Creates a new conversation (direct or group).
```typescript
// POST /functions/v1/conversation-create
// Body: { type: 'direct'|'group', participant_ids: string[], title?: string }
// Returns: { conversation: Conversation }
```

### `voicemail-leave`
Leaves a voicemail for an offline user.
```typescript
// POST /functions/v1/voicemail-leave
// Body: { recipient_id: string, voice_url: string, duration: number }
// Returns: { voicemail_id: string }
// Creates notification for recipient
```

---

## 5. NOTIFICATIONS

### `notification-send`
Sends push notifications via FCM.
```typescript
// POST /functions/v1/notification-send
// Body: { recipient_id: string, title: string, body: string, data?: object, type: string }
// Returns: { success: boolean, message_id?: string }
// Queues notification if user is offline
```

### `notification-batch`
Sends batched notifications.
```typescript
// POST /functions/v1/notification-batch
// Body: { notifications: NotificationPayload[] }
// Returns: { sent: number, failed: number }
// Batches similar notifications (e.g., "5 people liked your note")
```

### `notification-preferences`
Updates notification preferences.
```typescript
// POST /functions/v1/notification-preferences
// Body: { quiet_mode?: boolean, quiet_start?: string, quiet_end?: string, types?: Record<string, boolean> }
// Returns: { preferences: UserSettings }
```

---

## 6. SCORING & AI

### `score-calculate`
Recalculates user scores.
```typescript
// POST /functions/v1/score-calculate
// Body: { user_id: string }
// Returns: { scores: UserScores }
// Recalculates all sub-scores and master score
// Triggered by activity webhooks
```

### `recommend-people`
Recommends people to connect with.
```typescript
// POST /functions/v1/recommend-people
// Body: { user_id: string, limit?: number }
// Returns: { recommendations: Profile[], reasons: string[] }
// Uses: interest match, mutual connections, location, activity correlation
```

### `recommend-content`
Recommends content for the feed.
```typescript
// POST /functions/v1/recommend-content
// Body: { user_id: string, cursor?: string }
// Returns: { items: FeedItem[], next_cursor: string }
// Ranking: recency * engagement * social_graph * location * interest_match
```

### `content-moderate`
Moderates content using AI.
```typescript
// POST /functions/v1/content-moderate
// Body: { content: string, content_type: string, content_id: string }
// Returns: { is_safe: boolean, flags?: string[], confidence: number }
// Uses OpenAI Moderation API or custom classifier
// Auto-reports if confidence > 0.9
```

---

## 7. EVENTS

### `event-create`
Creates a new event.
```typescript
// POST /functions/v1/event-create
// Body: { title: string, description?: string, location: object, start_at: string, end_at?: string, type?: string, price?: number, max_attendees?: number }
// Returns: { event: Event }
```

### `event-rsvp`
RSVPs to an event.
```typescript
// POST /functions/v1/event-rsvp
// Body: { event_id: string, status: 'interested'|'going'|'not_going' }
// Returns: { event: Event, rsvp: EventAttendee }
// Sends notification to organizer
```

### `event-checkin`
Checks in at an event.
```typescript
// POST /functions/v1/event-checkin
// Body: { event_id: string, lat: number, lng: number }
// Returns: { success: boolean, badge?: string }
// Validates location is within 500m of event
```

---

## 8. MEDIA & STORAGE

### `media-upload-url`
Generates signed upload URLs.
```typescript
// POST /functions/v1/media-upload-url
// Body: { filename: string, content_type: string, folder: 'avatars'|'covers'|'notes'|'voice'|'stories' }
// Returns: { upload_url: string, public_url: string, expires_in: number }
// Client uploads directly to Supabase Storage
```

### `media-compress`
Compresses images and videos.
```typescript
// POST /functions/v1/media-compress
// Body: { source_url: string, target_format?: string, quality?: number }
// Returns: { compressed_url: string, original_size: number, compressed_size: number }
// Uses Sharp for images, FFmpeg for videos
```

### `voice-optimize`
Optimizes voice recordings.
```typescript
// POST /functions/v1/voice-optimize
// Body: { source_url: string, target_bitrate?: number }
// Returns: { optimized_url: string, duration: number, size: number }
// Converts to Opus/OGG for efficient streaming
```

---

## 9. ANALYTICS & HEALTH

### `analytics-event`
Tracks user events.
```typescript
// POST /functions/v1/analytics-event
// Body: { event: string, properties?: object, timestamp?: string }
// Returns: { success: boolean }
// Batches events and writes to analytics table
```

### `health-check`
System health check.
```typescript
// GET /functions/v1/health-check
// Returns: { status: 'healthy'|'degraded', services: object, version: string }
// Checks: database, storage, realtime, edge functions
```

---

## WEBHOOKS

### `webhook-auth-user-created`
Triggered when a new user signs up.
```typescript
// Creates default profile and settings
// Sends welcome notification
// Triggers onboarding flow
```

### `webhook-auth-user-deleted`
Triggered when a user deletes their account.
```typescript
// Cascades deletion to all user content
// Anonymizes activity data
// Sends goodbye email (optional)
```

### `webhook-storage-object-created`
Triggered when media is uploaded.
```typescript
// Compresses images > 2MB
// Generates thumbnails
// Scans for inappropriate content
```

### `webhook-realtime-room-update`
Triggered by realtime room events.
```typescript
// Updates room participant counts
// Broadcasts to all connected clients
// Updates room status (live/ended)
```

---

## CRON JOBS

### `cron-cleanup-expired`
Runs every hour.
```typescript
// Deletes expired stories
// Archives ended rooms
// Cleans up old notifications (>90 days)
// Removes unused guest sessions
```

### `cron-score-recalculation`
Runs daily at 2 AM.
```typescript
// Recalculates all user scores
// Updates trending content
// Generates daily digests
// Identifies inactive users for re-engagement
```

### `cron-event-reminders`
Runs every 15 minutes.
```typescript
// Sends event reminders (1 day, 1 hour before)
// Checks for upcoming scheduled rooms
// Sends "Your friend is going" notifications
```

### `cron-backup`
Runs daily.
```typescript
// Exports critical tables to S3
// Verifies backup integrity
// Alerts on backup failures
```
