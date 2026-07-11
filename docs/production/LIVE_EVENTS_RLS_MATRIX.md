# MATISA LIVE EVENTS RLS MATRIX

| Table | Role | SELECT | INSERT | UPDATE | DELETE | Notes |
|---|---|---|---|---|---|---|
| `events` | Unauthenticated | Published public events | No | No | No | Only `status = 'scheduled' / 'live' / 'ended'` |
| `events` | Authenticated (Owner) | Yes | Yes | Yes | Soft delete (`cancelled`) | Can edit drafts and manage live status |
| `events` | Authenticated (Cohost/Moderator) | Yes | No | Partial (Status/Stage) | No | Granted via `event_hosts` |
| `events` | Authenticated (Stranger) | Published public events | No | No | No | Must not see draft/cancelled/invite-only |
| `event_attendees` | Owner/Host | Yes | Yes | Yes | Yes | Host can manage all attendees |
| `event_attendees` | Attendee | Own record (`user_id = auth.uid()`) | Own record | Own status | Own record | RSVP handling |
| `event_bans` | Owner/Host/Mod | Yes | Yes | Yes | Yes | Enforces access restrictions |
| `event_bans` | Banned User | No | No | No | No | Server-side token check prevents LiveKit join |
