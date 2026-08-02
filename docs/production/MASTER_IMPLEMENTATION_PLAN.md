# MATISA MASTER IMPLEMENTATION PLAN

Phase 0 baseline plus approved first implementation slice.

## Current Gate Status

Phase 0 verification tooling is partially stabilized, but database/RLS verification is not complete enough to claim production readiness.

Blocking items:

- `npm ci`: VERIFIED FAILING due locked native files in `node_modules`; `npm install` is VERIFIED WORKING.
- `npm run test:rls`: VERIFIED FAILING because Supabase CLI cannot connect to the local database.
- Consolidated migration integrity: VERIFIED FAILING.
- Duplicate Edge Functions: VERIFIED FAILING.
- Mock/TODO Edge Functions: VERIFIED FAILING.

## Phase 0 Completion Plan

1. Resolve repository access:
   - `feat/production-social-systems` branch created: VERIFIED WORKING.
   - Preserve existing modified files `.env.example` and `src/components/ui/Button.tsx`.

2. Standardize package manager:
   - Confirm deployment uses npm: VERIFIED WORKING from repository docs and scripts.
   - Keep `package-lock.json`: VERIFIED WORKING.
   - Remove `bun.lock`: VERIFIED WORKING.
   - Add missing scripts: VERIFIED WORKING.

3. Stabilize verification commands:
   - Scope `vite-tsconfig-paths` to `./tsconfig.json`: VERIFIED WORKING.
   - Re-run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run verify`: VERIFIED WORKING.
   - Add and run Supabase-safe validation commands: command exists, local DB connection VERIFIED FAILING.

4. Migration audit:
   - Identify whether `20260620000000_consolidated_schema.sql` has been applied anywhere.
   - Do not edit applied migration in place unless proven unapplied.
   - Create forward-only corrective migration if needed.
   - Add migration smoke test for clean local database.

5. Edge Function audit:
   - Choose canonical kebab-case function names.
   - Record all callers before deleting duplicates.
   - Standardize CORS, JWT verification, validation, structured errors, safe logging, rate limiting, idempotency where needed.

6. Interaction inventory:
   - Replace the current summary with a row-per-interaction registry.
   - Mark anything without verified evidence as NOT VERIFIED.
   - Mark TODO/mock/dead/fake behavior as VERIFIED FAILING.

7. RLS audit:
   - Extract table list from canonical schema.
   - Document select/insert/update/delete rules per role.
   - Add pgTAP/SQL tests for unauthenticated, owner, stranger, blocked user, and private-profile behavior.

## Feature Implementation Order After Approval

1. Core reactions / likes.
2. Sharing.
3. Comments and replies.
4. Saves.
5. Contextual user rating.
6. Voice system.
7. Karaoke.
8. Events.
9. Explore.
10. Notes.
11. Anonymous Wall.

## Current Feature Slice: Core Reactions / Likes

FEATURE: Core reactions / likes

Expected user flow: Signed-in user taps the visible heart on a note, Matisa writes or removes a real `reactions` row, updates the UI optimistically, and rolls back with an error message if the write fails. Signed-out users are sent to the profile/auth screen before write attempts.

Files changed:

- `src/App.tsx`
- `src/features/reactions/index.ts`
- `src/features/reactions/types/index.ts`
- `src/features/reactions/validation/reactionSchemas.ts`
- `src/features/reactions/repositories/ReactionRepository.ts`
- `src/features/reactions/services/ReactionService.ts`
- `src/features/reactions/services/ReactionService.test.ts`
- `supabase/migrations/20260711210000_core_reactions.sql`

Database tables: `public.reactions`

Migrations: `20260711210000_core_reactions.sql` created, NOT VERIFIED against local/staging database.

RLS policies: `reactions_authenticated_read`, `reactions_own_insert`, `reactions_own_update`, `reactions_own_delete` authored, NOT VERIFIED against local/staging database.

Edge Functions: none for this slice.

Realtime channels: `public.reactions` added to `supabase_realtime` in migration, NOT VERIFIED.

Storage buckets: none.

Notifications: NOT VERIFIED.

Analytics events: NOT VERIFIED.

Tests added: `src/features/reactions/services/ReactionService.test.ts`

Commands executed:

- `npm run typecheck`: VERIFIED WORKING
- `npm run test -- ReactionService`: VERIFIED WORKING
- `npm run lint`: VERIFIED WORKING with existing warnings
- `npm run build`: VERIFIED WORKING with existing large chunk warning
- `npm run test`: VERIFIED WORKING
- `npm run test:rls`: VERIFIED FAILING with `LegacyDbConnectError`

Observed results: 23 unit tests passed across 3 files. TypeScript and production build passed. The visible note heart button no longer uses local-only fake state for signed-in users.

Known limitations: `npm run test:rls` was already VERIFIED FAILING because local Supabase Postgres is unavailable, so database migration application, RLS behavior, realtime delivery, two-account behavior, notification behavior, and staging verification remain NOT VERIFIED.

Production readiness percentage: 35% for reactions / likes.

## Migration Strategy

- No destructive production migrations in Phase 0.
- Use forward-only corrective migrations after applied-state verification.
- Run migrations against clean local/staging database before production.
- Record rollback plan for each migration.

## Rollback Strategy

- Code rollback: Git revert or branch rollback after commits exist.
- Database rollback: forward corrective migration; destructive rollback only with backup and explicit approval.
- Edge Function rollback: deploy previous version only after confirming caller compatibility.

## Acceptance Tests Required Before Leaving Phase 0

- `npm ci`: VERIFIED FAILING due locked native files; `npm install`: VERIFIED WORKING
- `npm run typecheck`: VERIFIED WORKING
- `npm run lint`: VERIFIED WORKING with no critical errors
- `npm run test`: VERIFIED WORKING
- `npm run build`: VERIFIED WORKING
- `npm run test:rls`: VERIFIED FAILING until local Supabase database is available
- `npm run verify`: VERIFIED WORKING after script exists
- Supabase migration smoke test: NOT VERIFIED
- No user-facing mock/dead behavior remains in the audited feature before that feature is marked complete
