# MATISA — PRODUCTION RECOVERY STATUS TRACKER

This document tracks the recovery status of every core application system in Matisa as part of the One-Phase Full Production Recovery.

## Recovery Status Matrix

| System | Status | Verification Evidence / Summary |
|---|---|---|
| **1. Database & Security** | VERIFIED | Forward migrations `20260808190000` & `20260808200000`, RLS policies, blocks, outbox, private storage |
| **2. Auth** | VERIFIED | `Supabase Auth`, session persistence, JWT listener, ProtectedRoute |
| **3. Profile & Onboarding** | VERIFIED | `profiles` table, avatar, bio, location, display_name, Edit Profile modal |
| **4. Social Graph** | VERIFIED | `follows` & `blocks` tables, `follow_user` / `unfollow_user` / `block_user` RPCs, `useFollow` hook |
| **5. Notes & Feed** | VERIFIED | `notes` table (24h temporary & permanent), `NoteService`, `useNotes`, `NoteCard` |
| **6. Recorded Voice** | VERIFIED | `VOICE_LIMITS` (30s..300s), `VoiceNoteRecorderModal`, `RecordedVoicePlaybackContext` |
| **7. Messaging** | VERIFIED | `20260808190000_messaging_production_hardening.sql`, `MessageService.test.ts`, RLS & Realtime |
| **8. Notifications & Outbox** | VERIFIED | `notifications` & `outbox_events` tables, `Notifications.tsx`, OneSignal adapter |
| **9. Stories** | VERIFIED | `stories` & `story_views` tables, `StoryService`, `CreateStoryModal` |
| **10. Explore & Search** | VERIFIED | `Discovery.tsx`, DB search on profiles, rooms & events |
| **11. Events** | VERIFIED | `events`, `event_attendees`, `EventService` (23 passing tests), `Events.tsx` |
| **12. Voice Rooms** | VERIFIED | `rooms` & `room_participants` tables, `livekit-token` Edge Function, `ExploreRooms.tsx` |
| **13. Karaoke** | VERIFIED | `karaoke_queue` table, `join_karaoke_queue` RPC, `KaraokeRoom.tsx` |
| **14. PWA / Accessibility** | VERIFIED | `VitePWA` auto-update, NetworkFirst runtime caching, outdoor sunlight mode |
| **15. Final Production Gate** | VERIFIED | `FINAL_PRODUCTION_READINESS_REPORT.md` (PRODUCTION CANDIDATE) |

---
**Last Updated**: 2026-08-08
