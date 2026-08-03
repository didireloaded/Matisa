# Matisa Backend System Map

Read this file only for broad backend audits, cross-system changes, architecture consolidation, migration repair, production hardening, or when a focused trace proves the feature crosses several backend domains.

## Current architecture

Matisa uses:

- Supabase Auth for identity
- PostgreSQL for authoritative social and business state
- Row Level Security for client-access authorization
- Supabase Storage for media
- Supabase Realtime for selected live updates
- Supabase Edge Functions for secrets, privileged operations, provider integrations, tokens, moderation, AI, and atomic workflows that do not belong in browser code
- LiveKit for live audio transport
- OneSignal for push notifications
- Resend for transactional email
- PostHog for analytics
- Sentry for monitoring
- Cloudflare Turnstile and Upstash Redis for abuse protection and rate limiting when implemented
- a licensed provider for commercial karaoke catalogue and lyrics

## Authoritative code locations

| Concern | Primary location | Notes |
|---|---|---|
| Active schema changes | `supabase/migrations/` | Verify applied history before editing |
| Edge Functions | `supabase/functions/` | Consolidate duplicates rather than adding copies |
| Shared function code | `supabase/functions/_shared/` and current shared folder | Standardise deliberately |
| Browser Supabase client | `src/lib/supabase.ts` | Public anon or publishable key only |
| Feature services | `src/services/` | Some services are legacy or cut-feature code |
| Feature data hooks | `src/hooks/` | Should call one authoritative service path |
| Production findings | `docs/production/` | Evidence and plans, not executable truth |
| Archived SQL | `supabase/migrations_archive/` | Reference only |
| Other SQL | root `schema.sql`, `database/`, `scratch/` | Non-authoritative until reconciled |

## Backend domains

### Identity and profiles

Responsibilities:

- Supabase Auth identity and sessions
- public profile data
- user settings and privacy
- verification state
- account lifecycle
- avatar and cover ownership
- visibility and block enforcement

Typical data includes `auth.users`, `profiles`, settings, verification, blocks, and profile-related storage. Verify actual names in the current schema.

### Social graph

Responsibilities:

- follow and unfollow
- followers and following counts
- block and mute behavior
- recommendations and mutual connections
- profile visibility rules

Prefer atomic follow RPCs or unique constrained writes. Block behavior must affect discovery, feeds, messages, rooms, events, notifications, and profile access as required.

### Notes, posts, comments, reactions, shares, and saves

Responsibilities:

- content ownership and visibility
- creation, editing, deletion, expiry, and moderation
- comments and replies
- canonical reactions
- saves and shares
- counters and feed query performance

The repository contains both `notes` and `posts` concepts plus old likes and newer reactions. Do not create another engagement model. Determine the active product contract and consolidate callers deliberately.

### Stories

Responsibilities:

- media or text story creation
- expiry
- views and reactions
- audience privacy
- storage ownership
- removal of expired content and abandoned media

Public URLs are only valid for intentionally public stories. Private story audiences require private objects and controlled access.

### Messaging and voicemail

Responsibilities:

- conversations and membership
- text, media, and voice messages
- message requests and blocks
- unread and read state
- private storage
- realtime delivery
- voicemail sender and recipient permissions

Conversation membership must be enforced in RLS. Storage access must mirror message membership. Signed media URLs should be short-lived.

### Notifications

Responsibilities:

- persistent in-app notifications
- unread state
- preference filtering
- push delivery through OneSignal
- deduplication and retry
- deep-link payloads

Core actions must not fail solely because push delivery failed. External delivery should be retryable and observable.

### Events

Current active migrations include event foundations and access-control tables such as:

- `events`
- `event_hosts`
- `event_bans`
- `event_stage_requests`
- `event_attendees`
- `event_invites`
- `event_tickets`
- `event_orders`
- `event_ledger_entries`

Verify the deployed schema before relying on these names or states. Event mutations must distinguish host, co-host, moderator, attendee, invitee, banned user, public, private, draft, published, cancelled, free, and ticketed access.

### Voice rooms

Responsibilities:

- room records and lifecycle
- host and speaker roles
- membership and stage requests
- access control
- LiveKit token issuance
- moderation
- realtime room state

Supabase owns room business state. LiveKit owns media transport only.

### Karaoke

Responsibilities:

- karaoke room state
- queue membership and order
- performer transitions
- audience reactions
- performance records and scores
- moderation and access
- licensed track catalogue integration

The repository currently contains several queue, room, score, and performance Edge Functions, including duplicate naming styles and incomplete implementations. Identify the canonical path before modifying any karaoke operation.

### Music

Responsibilities may include tracks, albums, playlists, playlist tracks, and media storage. Confirm that Music remains in current product scope and verify the live schema before extending it. Uploaded commercial content requires rights and takedown processes.

### Anonymous Wall

Public anonymity must not mean untraceable abuse. Store public anonymous identity separately from restricted internal attribution. Only authorised moderation paths may reveal attribution. Do not expose author IDs through client queries, logs, realtime payloads, or storage paths.

### Moderation and safety

Responsibilities:

- reports
- blocks and mutes
- content status
- evidence access
- rate limits
- moderation queues
- internal attribution for anonymous content
- appeals and audit records when required

AI may assist triage but must not become the sole authority for serious enforcement.

### Search, ranking, and intelligence

The repository contains deterministic services and several AI Edge Functions for discovery, recommendations, search, fake-account detection, embeddings, and personalised home ranking.

Rules:

- use deterministic SQL and filters first
- remove blocked and ineligible content before ranking
- keep provider calls server-side
- provide fallback results
- do not present fabricated scores
- cap cost, duration, and returned result size

## Existing Edge Function inventory

Current directories include operations for:

- speaker approval and requests
- performance scoring and submission
- voice and karaoke room creation and joining
- queue joining and leaving
- LiveKit token generation
- recommendations and discovery
- embeddings and semantic search
- fake-account detection
- notification delivery
- voice analytics

Known duplicate groups include:

- `createVoiceRoom` and `create_voice_room`
- `detectFakeAccounts` and `detect_fake_accounts`
- `generateDiscoveryFeed` and `generate_discovery_feed`

There are also overlapping queue function naming styles. Search all callers and deployment state before selecting a canonical function. Migrate callers first. Remove old deployed functions only through an explicit deprecation step.

## Current schema risk

The consolidated migration is known to contain malformed unnamed `CREATE TABLE` statements. Therefore:

1. Do not assume a clean reset can reproduce the deployed database.
2. Inspect local, staging, and production migration history where safely available.
3. Compare the real schema with active migration files.
4. Repair through new forward migrations when applied status is uncertain.
5. Add clean-database migration smoke tests and RLS tests.
6. Generate typed database definitions only after the schema is stable.

## Storage classification guide

| Media | Default classification |
|---|---|
| Public avatar | Public, unless account privacy requires otherwise |
| Public event cover | Public |
| Public post or story media | Public only when audience is public |
| Private story media | Private |
| Direct-message media | Private |
| Voicemail | Private |
| Moderation evidence | Private and restricted |
| Karaoke catalogue | Provider-controlled or public only under licence |
| Performance recordings | Private or consent-controlled |
| Draft uploads | Private |

## Realtime guide

Use realtime for:

- new messages and read state
- notification arrival
- room participants and roles
- karaoke queue and performance state
- selected event stage interactions

Do not use realtime for static profiles, ordinary feed pagination, historical lists, or data that is already efficiently refreshed through TanStack Query.

## External provider boundary

| Provider | Browser exposure | Trusted server responsibility |
|---|---|---|
| Supabase | URL and anon/publishable key | service role and admin actions |
| LiveKit | public server URL and short-lived participant token | API key, secret, room authorization |
| OneSignal | public app ID where required | REST API key and delivery |
| Resend | none | API key and email sends |
| PostHog | public project key when intended | privacy configuration and event governance |
| Sentry | public DSN may be acceptable | server DSN and sensitive filtering |
| Turnstile | site key | secret verification |
| Upstash | none for privileged rate limiting | tokens and counters |
| AI providers | none | API keys, prompts, moderation, transcription, ranking |
| Karaoke provider | public catalogue data only as licensed | secret, entitlements, usage reporting |

## Feature completion checklist

A backend feature is not complete until the applicable items are verified:

- schema and constraints
- RLS and grants
- RPC or Edge Function authorization
- typed service contract
- storage access
- realtime behavior
- idempotency and concurrency
- notification side effects
- blocks and privacy
- moderation and abuse limits
- analytics and error monitoring
- unit, integration, RLS, and end-to-end tests
- migration and rollback or forward-repair notes
- required environment variables documented without secret values
