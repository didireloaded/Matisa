# MATISA MASTER RLS MATRIX

Phase: 0 baseline only.

## RLS Verification Status

RLS behavior is NOT VERIFIED.

Supabase CLI is now installed as a dev dependency, but `npm run test:rls` failed to connect to the local database.

Command:

`npm run test:rls`

Observed result:

`LegacyDbConnectError`: failed to connect to postgres.

## Schema Sources Observed

- Active migrations:
  - `supabase/migrations/20260620000000_consolidated_schema.sql`
  - `supabase/migrations/20260620000001_drop_cut_features.sql`
  - `supabase/migrations/20260711183000_live_events_foundation.sql`
- Archived migrations exist under `supabase/migrations_archive/`.
- Additional SQL exists under `database/` and `scratch/`.

## Critical Schema Finding

`supabase/migrations/20260620000000_consolidated_schema.sql` contains many malformed `CREATE TABLE IF NOT EXISTS (` statements with no table names.

Status: VERIFIED FAILING

## Matrix Template

The following rows must be completed from the canonical schema after migration integrity is repaired.

| Table | Select | Insert | Update | Delete | Unauthenticated | Owner | Stranger | Blocked user | Private profile | Expired content | Account deletion | Test file | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| profiles | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| follows / social graph | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| notes | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| reactions | authenticated read authored | owner insert authored | owner update authored | owner delete authored | no anon grant authored | owner policies authored | read allowed, write denied by ownership | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | cascade by auth.users FK authored | NOT VERIFIED | NOT VERIFIED |
| stories | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| messages | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| voice assets | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| live rooms | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| karaoke rooms / queue / votes | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| events / rsvps | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| notifications | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |

## Required RLS Test Coverage

- Unauthenticated access.
- Owner access.
- Authenticated stranger access.
- Blocked user behavior.
- Private profile behavior.
- Expired notes/stories behavior.
- Account deletion behavior.
- Moderation/admin-only attribution where applicable.
