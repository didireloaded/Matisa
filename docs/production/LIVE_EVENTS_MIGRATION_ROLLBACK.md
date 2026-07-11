# MATISA LIVE EVENTS MIGRATION ROLLBACK DOCUMENTATION

## Overview
Migration `20260711183000_live_events_foundation.sql` is a **forward-only** corrective migration designed so that existing data in `events` or any other table is never deleted or truncated (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).

## Rollback Strategy
Because the columns (`event_type`, `access_model`, `visibility`, `status`, `price_minor`, `currency`, etc.) have non-destructive defaults (`draft`, `free_public`, `0`), if an immediate rollback of feature functionality is required:
1. **Application Level**: Toggle off the feature flag or revert to the previous frontend release tag. Existing database records remain safely stored and readable by older queries since old queries only `SELECT` or `UPDATE` the original subset of columns.
2. **Schema Rollback (If strictly required in non-production staging)**:
   ```sql
   -- Only execute in non-production environments if reverting schema additions:
   ALTER TABLE public.events
     DROP COLUMN IF EXISTS host_id,
     DROP COLUMN IF EXISTS created_by,
     DROP COLUMN IF EXISTS description,
     DROP COLUMN IF EXISTS cover_storage_path,
     DROP COLUMN IF EXISTS cover_url,
     DROP COLUMN IF EXISTS category,
     DROP COLUMN IF EXISTS event_type,
     DROP COLUMN IF EXISTS access_model,
     DROP COLUMN IF EXISTS visibility,
     DROP COLUMN IF EXISTS status,
     DROP COLUMN IF EXISTS start_at,
     DROP COLUMN IF EXISTS end_at,
     DROP COLUMN IF EXISTS timezone,
     DROP COLUMN IF EXISTS max_attendees,
     DROP COLUMN IF EXISTS price_minor,
     DROP COLUMN IF EXISTS currency,
     DROP COLUMN IF EXISTS chat_enabled,
     DROP COLUMN IF EXISTS reactions_enabled,
     DROP COLUMN IF EXISTS questions_enabled,
     DROP COLUMN IF EXISTS stage_requests_enabled,
     DROP COLUMN IF EXISTS recording_enabled,
     DROP COLUMN IF EXISTS replay_policy,
     DROP COLUMN IF EXISTS refund_policy,
     DROP COLUMN IF EXISTS livekit_room_name,
     DROP COLUMN IF EXISTS location_name,
     DROP COLUMN IF EXISTS location_address,
     DROP COLUMN IF EXISTS latitude,
     DROP COLUMN IF EXISTS longitude,
     DROP COLUMN IF EXISTS published_at,
     DROP COLUMN IF EXISTS started_at,
     DROP COLUMN IF EXISTS ended_at,
     DROP COLUMN IF EXISTS cancelled_at;

   DROP TABLE IF EXISTS public.event_stage_requests CASCADE;
   DROP TABLE IF EXISTS public.event_bans CASCADE;
   DROP TABLE IF EXISTS public.event_hosts CASCADE;
   ```
## Data Preservation Confirmation
- No `DROP TABLE` or `DELETE` statements exist against user profiles or existing events in `20260711183000_live_events_foundation.sql`.
- Existing rows in `events` receive default values (`status = 'draft'`, `event_type = 'live_audio'`, `access_model = 'free_public'`, `price_minor = 0`) safely via defaults.
