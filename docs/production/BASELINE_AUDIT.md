# MATISA BASELINE AUDIT

Phase: 0 only
Date: 2026-07-11
Scope: Repository inspection, current verification commands, known-problem verification, no feature implementation.

## Repository Location

- Intended app repository: `C:\Users\PC\Documents\APPS\Matisa`
- Codex writable workspace observed separately: `C:\Users\PC\Documents\Matisa`
- `C:\Users\PC\Documents\Matisa` is not the app repository; it contains only `.agents/` and `skills-lock.json`.

## Instructions Read

- `AGENTS.md`: VERIFIED WORKING
- `docs/production/MATISA_CODEX_MASTER_BUILD_PROMPT.md`: VERIFIED WORKING
- `README.md`: VERIFIED WORKING
- `ARCHITECTURE.md`: VERIFIED WORKING
- `implementation_plan.md`: VERIFIED WORKING

## Git Baseline

- `git status --short --branch` initially failed because Git marked the repository as dubious ownership for sandbox user `DIDIRELOADED-FI/CodexSandboxOffline`.
- Command-scoped safe-directory status succeeded:
  - Initial current branch: `feat/live-events-foundation`
  - Modified files: `.env.example`, `src/components/ui/Button.tsx`
- Required branch creation command attempted:
  - `git -c safe.directory='C:/Users/PC/Documents/APPS/Matisa' -C 'C:\Users\PC\Documents\APPS\Matisa' switch -c feat/production-social-systems`
  - Initial sandbox result: VERIFIED FAILING due permission denied creating `.git/refs/heads/feat/production-social-systems.lock`
  - Elevated result: VERIFIED WORKING
  - Current branch after approval: `feat/production-social-systems`

## Package Manager

- `package.json` scripts use npm commands.
- `package-lock.json` exists: VERIFIED WORKING
- `bun.lock` removed after npm standardization: VERIFIED WORKING
- Master prompt says to standardize on npm unless deployment proves Bun is required.
- Added npm verification scripts: `test:coverage`, `test:e2e`, `test:rls`, `verify`.

## Verification Commands

| Command | Result | Evidence |
|---|---|---|
| `npm ci` | VERIFIED FAILING | EPERM on locked native files under `node_modules`; `npm install` repaired dependencies. |
| `npm install` | VERIFIED WORKING | Installed dependencies and verification CLIs; npm audit later reported 0 vulnerabilities. |
| `npm run typecheck` | VERIFIED WORKING | Command exited 0. |
| `npm run lint` | VERIFIED WORKING | Command exited 0 with 10 warnings. |
| `npm run test` | VERIFIED WORKING | 2 test files, 19 tests passed. |
| `npm run test:coverage` | VERIFIED WORKING | 2 test files, 19 tests passed; statement coverage 52%. |
| `npm run build` | VERIFIED WORKING | Vite 7.3.6 production build succeeded. |
| `npm run verify` | VERIFIED WORKING | Typecheck, lint, tests, and build completed successfully. |
| `npm run test:e2e` | VERIFIED WORKING | Playwright smoke test passed after adding `playwright.config.ts` and `e2e/app-smoke.spec.ts`. |
| `npm run test:rls` | VERIFIED FAILING | Supabase CLI is installed, but `supabase test db` failed to connect to the local database. |
| `npm audit --audit-level=low` | VERIFIED WORKING | 0 vulnerabilities after non-force `npm audit fix`. |

## Lint Warnings

`npm run lint` produced 10 warnings:

- `src/components/common/Avatar.tsx`: react-refresh only-export-components warning.
- `src/components/feed/CreateVoicePostModal.tsx`: missing `useEffect` dependencies.
- `src/components/feed/VoiceRecorderModal.tsx`: missing `useEffect` dependency.
- `src/components/karaoke/KaraokeRoom.tsx`: missing `useEffect` dependency.
- `src/components/providers/ThemeProvider.tsx`: react-refresh only-export-components warning.
- `src/contexts/AuthContext.tsx`: react-refresh only-export-components warning.
- `src/contexts/VoiceContext.tsx`: react-refresh only-export-components warning.
- `src/hooks/useComments.ts`: missing `useEffect` dependency.
- `src/hooks/useEvents.ts`: missing `useEffect` dependency.
- `src/hooks/useMessages.ts`: missing `useEffect` dependency.

## Known Problems Verified

| Master Prompt Item | Status | Evidence |
|---|---|---|
| Consolidated migration appears malformed | VERIFIED FAILING | `supabase/migrations/20260620000000_consolidated_schema.sql` contains many `CREATE TABLE IF NOT EXISTS (` patterns with no table name. |
| Duplicate Edge Functions with camelCase and snake_case names | VERIFIED FAILING | Examples include `createVoiceRoom` and `create_voice_room`, `detectFakeAccounts` and `detect_fake_accounts`, `generateDiscoveryFeed` and `generate_discovery_feed`. |
| Edge Functions contain TODO or mock logic | VERIFIED FAILING | TODOs found in `approveSpeaker`, `createKaraokeRoom`, `createVoiceRoom`, `joinQueue`, `joinVoiceRoom`, `leaveQueue`, `leaveVoiceRoom`, `requestSpeaker`, `submitPerformance`, `updateVoiceAnalytics`; mock logic found in `generateEmbeddings`, `semanticSearch`, `send_push_notification`. |
| Karaoke UI contains explicit mock behavior | NOT VERIFIED | Karaoke files exist, but full behavior was not executed because build/test failed in sandbox. |
| Home and Stories import dummy or mocked content | VERIFIED FAILING | `src/pages/Home.tsx` imports from `src/data/dummy.ts`; `src/data/dummy.ts` exists. |
| Buttons show coming soon messages | VERIFIED FAILING | Static search found dead/placeholder action indicators in page files including `Home.tsx`, `Chat.tsx`, and `Events.tsx`; full runtime inventory remains incomplete. |
| Environment example is incomplete | VERIFIED FAILING | `.env.example` is modified and small relative to integrations listed in `AGENTS.md`; full secret validation was not performed. |
| Firebase installed while OneSignal is selected provider | VERIFIED FAILING | `firebase` exists in dependencies; `react-onesignal` also exists. Usage audit not completed. |
| Both `bun.lock` and `package-lock.json` exist | VERIFIED FAILING | Both files present at repository root. |
| Package scripts incomplete | VERIFIED FAILING | Missing `test:e2e`, `test:rls`, `verify`, and `test:coverage`. |

## Supabase Structure Observed

- `supabase/config.toml`: present.
- Active migrations:
  - `20260620000000_consolidated_schema.sql`
  - `20260620000001_drop_cut_features.sql`
  - `20260711183000_live_events_foundation.sql`
- Archived migrations: present under `supabase/migrations_archive/`.
- Edge Functions: many functions present; duplicate naming and TODO/mock logic verified.
- Supabase validation against local/staging database: NOT VERIFIED because Supabase CLI version command timed out.

## Environment Files

- `.env.example`: present and modified before this audit.
- `.env.local`: present. Contents were not copied into this report to avoid exposing secrets.
- Secret exposure in frontend bundle: NOT VERIFIED because build failed.

## Existing Production Docs

Present under `docs/production/`:

- `MATISA_CODEX_MASTER_BUILD_PROMPT.md`
- `BASELINE_AUDIT.md`
- `INTERACTION_INVENTORY.md`
- `MASTER_IMPLEMENTATION_PLAN.md`
- `RLS_MATRIX.md`
- Live Events-specific audit, plan, inventory, rollback, RLS, and report docs.

## Phase 0 Limitations

- Feature branch creation is VERIFIED WORKING after elevated permission.
- Production runtime feature implementation has not started beyond verification tooling and docs.
- Production data was not accessed or modified.
- No destructive migrations were run.
- Sandbox build/test failed due Vite config access, but elevated `npm run verify` is VERIFIED WORKING.
- RLS behavior across users remains NOT VERIFIED because local Supabase database connection failed.
