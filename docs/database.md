# Database Documentation

The Matisa backend is built entirely on Supabase PostgreSQL. This document outlines the planned schema for Phase 2, moving away from legacy structures towards the "People are the content" architecture.

## Schema Overview

The database is structured to support heavy social interactions, ephemeral content, local event discovery, and real-time karaoke.

### Core Entities

1. **`users`** (Managed by Supabase Auth): Core identity layer.
2. **`profiles`**: Public-facing user data (avatar, bio, mood, location context, badges).
3. **`user_settings`**: Privacy and notification preferences.
4. **`verification`**: Requests and approval status for Creator/Verified badges.

### Connections & Social Graph

5. **`follows`**: One-way following relationships.
6. **`friends`**: Mutual connections (or bidirectional follows).
7. **`blocks`**: User-blocking logic to hide content.
8. **`profile_views`**: Auditing and analytics for profile traffic.

### Content & Engagement

9. **`notes`**: Short, text-first updates (e.g., status, thoughts). Replaces legacy `posts` for non-media updates.
10. **`stories`**: Ephemeral images/videos expiring in 24 hours.
11. **`story_views`**: Tracking who watched a story.
12. **`story_reactions`**: Quick emoji/message reactions to stories.

### Messaging

13. **`conversations`**: Thread containers (1:1 or group).
14. **`conversation_members`**: Participants in a conversation.
15. **`messages`**: Real-time payloads (text, images, voice notes).

### Events & Communities

16. **`events`**: Hyper-local gatherings.
17. **`event_attendees`**: RSVP tracking.
18. **`communities`** (Legacy/Optional): Regional or interest-based groups.
19. **`community_members`**: Group memberships.

### Live Audio & Music

20. **`karaoke_rooms`**: Active WebRTC room states.
21. **`karaoke_participants`**: Users currently inside or on stage in a room.
22. **`music_tracks`**: System catalog of instrumental/karaoke tracks.
23. **`playlists`**: User-curated track lists.
24. **`playlist_tracks`**: Mapping of tracks to playlists.

### Safety & Discovery

25. **`reports`**: User-generated flags for moderation.
26. **`search_history`**: Recent queries for fast UX.
27. **`notifications`**: System-wide activity alerts.

## Row Level Security (RLS)

Every table enforces RLS. Standard policies:
- **Public Read**: Profiles, Notes, Active Stories, Events.
- **Auth Insert**: Users can only insert records tied to their `auth.uid()`.
- **Private Read**: Messages and Settings are restricted strictly to conversation members or the owner.
