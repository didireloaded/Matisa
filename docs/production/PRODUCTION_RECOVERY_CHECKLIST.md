# MATISA — PRODUCTION RECOVERY CHECKLIST & SYSTEM AUDIT

## System Audit Summary

### 1. Current Routed Screen Map & State

| Route | Component | Status | Backend Service / Hook | DB Tables | Edge Functions |
|---|---|---|---|---|---|
| `/` | `Home.tsx` | REAL | `useNotes` / `NoteService` | `notes`, `profiles` | - |
| `/explore` | `Discovery.tsx` | REAL | `NoteService`, `EventService` | `notes`, `events`, `profiles` | - |
| `/explore/people` | `ExplorePeople.tsx` | PARTIAL | `USERS` dummy | `profiles` | - |
| `/explore/rooms` | `ExploreRooms.tsx` | PARTIAL | `RoomService` | `rooms` | `livekit-token` |
| `/explore/events` | `ExploreEvents.tsx` | REAL | `EventService` | `events`, `event_attendees` | - |
| `/notes` | `Notes.tsx` | REAL | `useNotes` / `NoteService` | `notes`, `profiles` | - |
| `/events` | `Events.tsx` | REAL | `EventService` | `events`, `event_attendees` | - |
| `/inbox` | `Inbox.tsx` | MOCK (BEING REPAIRED) | `MessageService` / `useMessages` | `conversations`, `messages`, `conversation_participants` | `send-notification` |
| `/messages/:conversationId` | `ChatRoom.tsx` | MOCK (BEING REPAIRED) | `MessageService` / `useMessages` | `conversations`, `messages`, `conversation_participants` | `send-notification` |
| `/profile` | `Profile.tsx` | REAL | `NoteService`, `profiles` | `profiles`, `notes` | - |
| `/activity` | `Activity.tsx` | REAL | `notifications` | `notifications` | - |
| `/rooms/:roomId` | `KaraokeRoom.tsx` | PARTIAL | `LiveKit` | `rooms` | `livekit-token` |

---

### 2. Security & RLS Risks Identified (P0)

1. **Messaging RLS Flaw**:
   - `messages` `INSERT` policy previously checked `auth.uid() = sender_id` but failed to check if `sender_id` was actually a member of `messages.conversation_id`.
   - `conversation_participants` `SELECT` policy had a self-referential clause `conversation_id = conversation_id`.
2. **Private Voice Media RLS**:
   - Private voice messages and voicemails must use signed URLs with bucket-level ownership checks (`message_media`, `voicemail_media`).
3. **RPC & Client Identity**:
   - User identity must be strictly derived from `auth.uid()` in Postgres functions and Edge Function JWTs.

---

### 3. Production Recovery Priority Checklist

#### P0 — SECURITY & DATA LOSS (CRITICAL)
- [x] Fix messaging RLS policies to enforce `conversation_participants` membership on `SELECT` and `INSERT`.
- [x] Create atomic Postgres RPCs for direct conversation retrieval/creation (`get_or_create_direct_conversation`) and message sending (`send_direct_message`).
- [ ] Enforce signed URL access on private storage buckets (`message_media`, `voicemail_media`).

#### P1 — CORE PRODUCT (CURRENT SPRINT: MESSAGING)
- [ ] Connect `Inbox.tsx` route to real `conversations` database query via `MessageService`.
- [ ] Connect `ChatRoom.tsx` route (`/messages/:conversationId`) to real `messages` realtime stream via `useMessages`.
- [ ] Support text, voice, and image media message delivery in `ChatRoom.tsx`.
- [ ] Add conversation read state (`last_read_at`) and unread badge calculation.
- [ ] Provide atomic fallback for push notifications on message insert.

#### P2 — RELIABILITY & SOCIAL GRAPH (UPCOMING)
- [ ] Consolidate Follow/Unfollow graph persistence across all user cards.
- [ ] Realtime notification pipeline outbox pattern.

#### P3 — POLISH & ROOMS (UPCOMING)
- [ ] Separate Voice Room and Karaoke Room control planes.

---

## Sprint 1 Target: Messaging (P1)
**Scope**: `/inbox`, `/messages`, `/messages/:conversationId`, `/chat/:id`
- Take routed UI from mock state to **VERIFIED** production state.
