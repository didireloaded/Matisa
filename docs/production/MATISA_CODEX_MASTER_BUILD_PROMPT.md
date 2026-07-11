# MATISA — CODEX MASTER PRODUCTION BUILD PROMPT

## ROLE

Act as the senior staff engineer, backend architect, security engineer, QA lead, and release owner for the existing Matisa repository.

This is not a greenfield build. Work inside the current codebase. Preserve the existing premium mobile-first UI unless a small UI change is required to make a feature usable, accessible, honest, or complete.

Your job is not to generate more screens or claim that visible UI is complete. Your job is to make the existing Matisa product work end to end with real data, secure backend logic, production integrations, tests, observability, and documented setup.

## PRODUCT DEFINITION

Matisa is a mobile-first PWA social platform for everyday users. It is built around people discovery, Stories, Explore, Music, Messages, Activity, Profiles, short Notes, voice communication, live rooms, karaoke, events, and a public Anonymous Wall.

Matisa is not:

- a marketplace
- a freelancer platform
- a job board
- a creator SaaS platform
- a business directory
- an ecommerce platform
- a dating app
- a professional network
- a gaming or XP platform
- a map or Radar application

Do not reintroduce Radar, opportunities, crew finder, wallets, gifting, creator tiers, marketplace logic, or unrelated gamification.

## CURRENT REPOSITORY CONTEXT

The repository currently uses or intends to use:

- React 19
- Vite 7
- TypeScript
- React Router
- Tailwind CSS 4
- TanStack Query
- Zustand
- Framer Motion
- Supabase PostgreSQL, Auth, Storage, Realtime, Edge Functions, and RLS
- LiveKit for live voice and karaoke rooms
- OneSignal for push notifications
- PostHog for product analytics
- Sentry for production monitoring
- Vercel and Replit for deployment and preview

Known problems that must be verified immediately rather than assumed:

- The consolidated Supabase migration appears malformed in several places because multiple `CREATE TABLE IF NOT EXISTS` statements are missing table names.
- There are duplicate Edge Functions with camelCase and snake_case names for the same operations.
- Several Edge Functions still contain TODO or mock logic.
- Karaoke UI contains explicit mock behavior.
- Home and Stories still import dummy or mocked content.
- Several buttons show “coming soon” messages instead of performing real actions.
- The environment example contains only a small subset of required integration variables.
- Firebase is installed even though OneSignal is the selected notification provider. Confirm whether it is actually needed before keeping it.
- The repository has both `bun.lock` and `package-lock.json`. Standardize the package manager.
- The package scripts do not currently provide a complete production verification workflow.
- Documentation and installed versions may disagree. Trust the code and lockfile, then update documentation.

Treat these as audit targets. Verify every one before changing it.

## FIRST RESPONSE AND EXECUTION RULE

Do not immediately rewrite the application.

First:

1. Read `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `implementation_plan.md`, the `docs/` directory, `package.json`, `src/App.tsx`, all services and hooks, Supabase migrations, Edge Functions, and environment files.
2. Inspect the Git status and current branch.
3. Create a feature branch named `feat/production-social-systems` unless the user already selected another branch.
4. Run the current install, typecheck, lint, tests, build, and local Supabase validation commands that are available.
5. Produce a factual baseline report.
6. Create `docs/production/MASTER_IMPLEMENTATION_PLAN.md` with phases, dependencies, risks, migration strategy, rollback strategy, and acceptance tests.
7. Stop and report the plan before starting destructive database changes.

Do not attempt the entire product in one uncontrolled run. Complete one vertical slice at a time. At the end of each phase, run verification, commit the phase, and produce a checkpoint report.

## NON-NEGOTIABLE ENGINEERING RULES

- Do not use mock data in user-facing production flows.
- Do not display fake success messages.
- Do not leave empty click handlers.
- Do not replace working features with placeholders.
- Do not silently catch errors.
- Do not put secrets in Vite environment variables.
- Do not expose Supabase service-role keys, LiveKit secrets, OneSignal REST keys, Resend keys, OpenAI keys, Upstash tokens, Turnstile secrets, or karaoke-provider secrets to the browser.
- Do not edit an already-applied production migration without first proving it has not been applied. Prefer forward-only corrective migrations.
- Do not run destructive production migrations without a backup, staging verification, and rollback plan.
- Do not add a new dependency when an installed dependency already solves the problem.
- Do not use raw Supabase calls throughout UI components.
- Do not claim “production ready” without test evidence.
- Do not use “should work” in completion reports.
- Do not add unrelated features or redesign the product.

Every interaction must have a real path:

`UI component → feature hook → service → repository or Edge Function → database/storage/realtime/external provider`

## STANDARD PROJECT STRUCTURE

Follow existing conventions where they are good. Gradually move feature logic toward this structure without a broad unrelated rewrite:

```text
src/
  features/
    reactions/
    comments/
    shares/
    saves/
    ratings/
    voice/
    karaoke/
    events/
    explore/
    notes/
    wall/
  integrations/
    livekit/
    onesignal/
    posthog/
    sentry/
    mapbox/
    turnstile/
  services/
  repositories/
  hooks/
  types/
  lib/

supabase/
  migrations/
  functions/
    _shared/
    livekit-token/
    send-notification/
    send-email/
    moderate-content/
    transcribe-audio/
    create-anonymous-wall-post/
    get-anonymous-wall-feed/
    karaoke-*/
```

Do not duplicate a feature between `services`, `features`, and components. Establish a single authoritative implementation and migrate consumers to it.

# PHASE 0 — REPOSITORY AND DATABASE STABILIZATION

## 0.1 Package manager and scripts

Use npm as the default package manager because the repository documentation and Replit/Vercel workflow already use npm, unless deployment configuration proves Bun is required.

After verification:

- keep one authoritative lockfile
- remove the conflicting lockfile
- add scripts for `typecheck`, `test`, `test:coverage`, `test:e2e`, `test:rls`, `verify`, and any required Supabase checks
- make `npm run verify` run typecheck, lint, unit/integration tests, build, and safe static checks

## 0.2 Repair migration integrity

Audit all active and archived migrations.

- Confirm which migrations have actually been applied to local, staging, and production environments.
- Do not assume the consolidated migration is valid.
- Fix missing table names through a new forward migration when the broken file may already be tracked or applied.
- Establish one canonical schema.
- Remove duplicate or conflicting schema definitions only after migration history is understood.
- Generate updated Supabase TypeScript types after the schema is stable.
- Add migration smoke tests using a clean local Supabase database.
- Add pgTAP or equivalent RLS tests.

## 0.3 Remove mock and dead behavior

Create `docs/production/INTERACTION_INVENTORY.md` containing every:

- route
- button
- icon action
- menu item
- form
- modal
- long-press action
- swipe action
- realtime interaction

For each interaction record:

```text
Screen
Component
Visible label
Expected action
Handler
Hook
Service
Repository or Edge Function
Database tables
External integration
Analytics event
Notification
Permission rule
Test file
Status
```

Use only these statuses:

- VERIFIED WORKING
- VERIFIED FAILING
- PARTIAL
- MOCKED
- UNWIRED
- NOT VERIFIED

Search for and resolve production uses of:

```text
TODO
FIXME
mock
fake
dummy
sampleData
placeholder
coming soon
not implemented
console.log
onClick={() => {}}
```

Do not remove legitimate input placeholder text or test fixtures.

## 0.4 Consolidate duplicate Edge Functions

For each duplicated function pair, select one canonical kebab-case name and migrate all callers. Remove duplicates only after all references and deployed functions are accounted for.

All Edge Functions must share:

- CORS handling
- JWT verification
- Zod-compatible validation or explicit schema validation
- structured error format
- request ID
- safe logging
- rate-limit integration where needed
- idempotency support where needed

# PHASE 1 — THIRD-PARTY PLATFORM INTEGRATIONS

Build thin provider adapters. UI components must not call vendor SDKs directly except where the vendor requires a browser SDK.

## 1.1 Supabase
Use Supabase as the source of truth for all social features and business state.
Requirements: strict RLS, typed database client, cursor pagination, indexes based on query plans, realtime only on tables that need it, storage buckets with intentional access policies, server-side ownership validation for privileged operations.

## 1.2 LiveKit
Use LiveKit only for live media transport (voice rooms, karaoke microphone audio, participant presence, track publishing/subscription, reconnect handling). Supabase remains the source of truth for room state, roles, queue, votes, reactions, chat, and history. Create a secure `livekit-token` Edge Function.

## 1.3 OneSignal
Use OneSignal for push delivery and Supabase for the internal notification inbox. Do not keep Firebase unless code inspection proves it is required.

## 1.4 Resend
Use Resend through a Supabase Edge Function for welcome email, security alerts, event invitations, event updates/cancellations, moderation outcome emails, account deletion confirmation.

## 1.5 Mapbox
Use Mapbox only for the Events feature (venue autocomplete, address lookup, geocoding, event map, directions link, optional nearby-event filtering). Do not rebuild Radar.

## 1.6 PostHog
Use PostHog for product events, funnels, retention, Explore impressions and clicks, feature flags, controlled experiments. Create one typed analytics wrapper.

## 1.7 Sentry
Use Sentry for frontend exceptions, failed requests, performance traces, release tracking, source maps, Edge Function errors where supported.

## 1.8 Cloudflare Turnstile
Use Turnstile for abuse-sensitive public actions (sign-up when suspicious, password-reset abuse protection, Anonymous Wall posting, report submission when suspicious, repeated event creation/spam flows). Verify tokens server-side.

## 1.9 Upstash Redis
Use Upstash for distributed rate limits and short-lived idempotency keys.

## 1.10 OpenAI moderation and speech-to-text
Use OpenAI only behind Supabase Edge Functions for moderation of public text/images, transcription of public or reported voice content, accessibility captions, moderation of voice content via transcripts.

## 1.11 Licensed karaoke catalogue provider
Create a provider-neutral interface `KaraokeCatalogueProvider`. Allow only original tracks, properly licensed local artist tracks, public-domain material, or private staging test tracks until licensing is configured.

# PHASE 2 — SHARED SOCIAL PRIMITIVES
2.1 Reactions and liking
2.2 Comments
2.3 Sharing
2.4 Saves
2.5 Notifications

# PHASE 3 — USER RATING AND REPUTATION
Contextual ratings after verified interactions (respectful, reliable, friendly, collaborative, good host, good performer). Bayesian weighting, minimum sample size, moderation tools.

# PHASE 4 — NOTES AND ANONYMOUS WALL
4.1 Notes (max 50 chars, 24 hour expiry, replace/delete, reactions, replies, voice reply, share, save, report).
4.2 Anonymous Wall (public space anonymous to users, attributable only to internal moderation. Sanitize public view `is_owned_by_current_user`).

# PHASE 5 — VOICE SYSTEM
Shared recording and playback infrastructure (`voice_assets` table, permission check, pause/resume, timer, waveform derived from audio, seeking, single active player, offline handling).

# PHASE 6 — EVENTS
Lifecycle: draft -> published -> scheduled -> live -> completed -> cancelled. Venue autocomplete, RSVP capacity handling, waitlist, attendee list, chat, reminders.

# PHASE 7 — EXPLORE
Deterministic ranking, sections (For You, Trending, People, Voice, Events, Live Rooms, Karaoke, Music, Anonymous Wall). Filter blocked/muted/private/expired content.

# PHASE 8 — KARAOKE
10-minute sessions, solo or group (3-4 singers), queue system, host reorder/approve/skip, countdown, server-authoritative timer, reactions, audience voting (one vote per eligible member).

# PHASE 9 — PRODUCTION SECURITY, TESTING, AND OPERATIONS
9.1 RLS matrix (`docs/production/RLS_MATRIX.md`)
9.2 Automated tests (Vitest, React Testing Library, Supabase local integration tests, pgTAP/SQL RLS tests, Playwright E2E)
9.3 CI (`npm run verify` check in GitHub Actions)
9.4 Observability (request IDs, Sentry exceptions, PostHog events, `src/integrations/status.ts`)
9.5 Privacy and compliance documentation

# DEFINITION OF DONE FOR EACH FEATURE
UI flow works, route works, real service/repository exist, database migration applies cleanly, RLS passes, storage policy passes, realtime works across sessions, external provider integrated or honestly disabled, notifications/analytics work, loading/empty/success/error/offline/retry states exist, duplicate action prevented, block/privacy/deletion/moderation rules work, unit/integration/E2E tests pass, build/lint pass, docs updated, known limitations written honestly.

Begin with Phase 0 only. Inspect the repository, run baseline checks, create the implementation plan, and report findings before changing production data or starting later phases.
