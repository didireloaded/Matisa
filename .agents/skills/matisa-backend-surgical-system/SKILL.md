---
name: matisa-backend-surgical-system
description: Use when changing, fixing, reviewing, connecting, securing, testing, or documenting any Matisa database, Supabase, Edge Function, storage, realtime, authentication, notification, LiveKit, AI, service, or server-side integration behavior.
metadata:
  project: Matisa
  version: "1.0.0"
---

# Matisa Backend Surgical System

## Core rule

Make the smallest complete backend change that solves the user's exact request. Do not audit, rewrite, migrate, secure, refactor, or connect unrelated systems.

A backend task is complete only when the real path works:

`caller → feature service or repository → RPC or Edge Function → database, storage, realtime, or provider → verified result`

Never replace a missing backend path with mock data, fake success, a browser-only workaround, or a privileged client-side query.

## Mandatory start

Before editing, write a private scope lock containing:

- exact requested result
- affected feature and operation
- expected caller and backend path
- likely tables, functions, policies, buckets, or providers
- explicit non-goals
- risk level
- narrowest acceptance check

Then search for the exact table, RPC, function name, service method, route, or error. Do not begin by reading every migration, Edge Function, service, or production document.

## Context and credit discipline

- Read `AGENTS.md` once per coding session and this file before every Matisa backend task.
- For a focused task, inspect only the direct vertical path and normally no more than 3 to 10 relevant files before the first edit.
- Start with symbol and reference searches. Open full files only when a match is relevant.
- Do not read `BACKEND_SYSTEM_MAP.md`, all production docs, archived migrations, or the full schema unless the task is broad, cross-system, or schema-wide.
- Do not inspect frontend screens unless the backend contract cannot be understood from the service, hook, test, or request.
- Do not install packages, regenerate lockfiles, start every local service, query production, reset a database, or run the full verification suite for a small change.
- Do not repeat searches or reread unchanged files without a concrete reason.
- Stop when the requested result and its necessary tests are complete. Do not continue into nearby cleanup.

## Task routing

### Small backend fix

Examples include one query, one policy, one storage path, one validation bug, one notification payload, or one Edge Function error.

- Trace only the failing call.
- Touch the fewest files possible.
- Add the smallest regression test supported by the current setup.
- Run focused validation first.
- Do not create an architecture plan.

### Feature slice

Examples include making Follow persist, completing RSVP, sending a real notification, uploading voicemail, or joining a karaoke queue.

- Trace one vertical slice from caller to source of truth.
- Reuse the authoritative table, service, RPC, Edge Function, and provider adapter.
- Define input, output, permissions, failure states, idempotency, and observable side effects.
- Add focused service, SQL, RLS, and integration tests where applicable.
- Do not repair other features discovered during the trace.

### Schema or security change

- Verify migration history and the actual schema before editing SQL.
- Use a new forward-only migration unless it is proven that the target migration has never been applied anywhere.
- Update RLS, grants, constraints, indexes, tests, and generated types as one change.
- Do not run destructive commands against a linked, staging, or production project without user approval, backup, rollback plan, and staging evidence.

### Broad system change

Examples include migration consolidation, Edge Function naming consolidation, a security audit, backend production hardening, or a multi-feature architecture change.

- Only enter this mode when explicitly requested.
- Read `BACKEND_SYSTEM_MAP.md` and the applicable `docs/production/` files.
- Produce findings and a phased implementation plan before destructive changes.

## Source-of-truth order

Use this order and call out conflicts instead of guessing:

1. Connected deployed schema and migration history, when safely accessible
2. Active files in `supabase/migrations/`
3. Verified current Edge Function deployments and callers
4. Current service, repository, hook, and test contracts
5. `docs/production/` reports and plans
6. General documentation

The following are reference or legacy material, not automatic sources of truth:

- `supabase/migrations_archive/`
- root `schema.sql`
- `database/*.sql`
- `scratch/`
- generated build output
- old feature docs that conflict with `AGENTS.md`

Never copy archived SQL into an active migration without reconciling it against the current schema.

## Known repository hazards

Treat these as verified risks until current evidence proves otherwise:

- `20260620000000_consolidated_schema.sql` contains malformed `CREATE TABLE` statements.
- Active schema history is mixed with root, `database/`, `scratch/`, and archived SQL.
- Duplicate Edge Functions exist with camelCase and snake_case names.
- Several Edge Functions contain TODO, placeholder, or mock behavior.
- Some services target cut or legacy features.
- Browser-facing environment files have previously included values that belong server-side.
- Storage access patterns are inconsistent between public URLs and private media.
- RLS coverage is documented as not fully verified.
- OneSignal is the intended push provider. Firebase must not be extended unless a verified current dependency requires it.

Do not casually “clean up” these hazards during an unrelated task. Fix only the relevant hazard or enter broad system mode.

## Product boundary

Backend work must follow the current Matisa scope in `AGENTS.md`.

Do not reintroduce or extend cut systems such as Radar, marketplace behavior, opportunities, crew finder, wallets, gifting, creator tiers, or unrelated gamification unless the user explicitly changes product scope.

Legacy tables, services, migrations, or AI documents do not make a cut feature active.

## Database rules

- Supabase PostgreSQL is the source of truth for social and business state.
- Use lowercase snake_case identifiers.
- Every table needs a primary key, ownership model, timestamps, appropriate foreign keys, delete behavior, constraints, and indexes for real query paths.
- Add unique constraints for one-per-user relationships such as follows, saves, attendance, reactions, queue membership, and message membership where applicable.
- Prefer atomic SQL, RPCs, `INSERT ... ON CONFLICT`, and transactions over client-side check-then-write logic.
- Use cursor pagination for feeds, messages, notifications, comments, events, and long lists.
- Select only required columns. Avoid N+1 queries and per-card aggregation requests.
- Index foreign keys and frequently filtered or ordered columns. Use partial or composite indexes only when they match verified query patterns.
- Do not add denormalized counters without an explicit consistency strategy.
- Do not use triggers for logic that should remain visible in an RPC or service unless the trigger provides a clear integrity guarantee.
- Use database constraints for invariants that must never be bypassed.

When writing or optimizing SQL, also consult `.agents/skills/supabase-postgres-best-practices/SKILL.md`, then load only its relevant reference file.

## Migration rules

- Never edit an applied production migration as routine work.
- Determine applied state with safe migration inspection before choosing a strategy.
- Prefer one narrowly named forward migration per coherent change.
- A migration must be repeatable in a clean local environment and safe against expected existing data.
- Separate destructive operations from additive changes when possible.
- Use staged backfills for new non-null fields on populated tables.
- Add indexes concurrently only through a deployment process that supports it. Do not place unsupported transaction commands into normal Supabase migrations.
- Record rollback or forward-repair instructions for risky changes.
- Never run `supabase db reset`, `db push`, raw destructive SQL, or data deletion against a linked environment without confirming the target.
- After schema stability, regenerate database types and update callers deliberately.

## RLS and authorization

RLS is mandatory for every exposed table and storage bucket.

For each operation verify:

- unauthenticated user
- authenticated owner
- authenticated stranger
- blocked user
- private-profile behavior
- host or moderator role when applicable
- expired or deleted content
- account deletion and cascades

Rules:

- `auth.uid()` ownership checks belong in policies or trusted server operations, not only in the UI.
- Never rely on a client-supplied user ID for ownership.
- Use explicit `WITH CHECK` for writes and explicit `USING` for reads, updates, and deletes.
- Keep service-role usage inside trusted Edge Functions or controlled server tooling.
- Avoid broad policies such as authenticated users managing all rows.
- Be careful with recursive policies and unqualified column names.
- For `SECURITY DEFINER` functions, set a fixed `search_path`, validate authorization inside the function, and restrict execute grants.
- Treat block relationships as a cross-cutting authorization rule, not only a feed filter.
- Add pgTAP or SQL tests for every changed policy.

## Edge Function standard

Use one canonical function for each operation. Prefer kebab-case for new canonical names.

Before creating a function:

1. Search all function directories.
2. Search all `functions.invoke` calls and deployment references.
3. Check whether a camelCase or snake_case duplicate already performs the operation.
4. Extend or consolidate the authoritative implementation instead of adding another copy.

Every production Edge Function should have:

- shared CORS handling
- explicit allowed methods
- authenticated user verification when required
- request schema validation
- server-side ownership and role checks
- safe environment-variable access
- structured success and error responses
- request or correlation ID
- no secret, token, raw provider response, or personal-data logging
- rate limiting for abuse-prone operations
- idempotency for retryable writes
- bounded timeouts and provider failure handling
- tests for validation, authorization, success, and provider failure

Use service-role clients only after user identity and authorization are established. A valid JWT alone does not authorize the requested resource.

## Services, hooks, and backend contracts

- UI components must not own business logic or privileged Supabase operations.
- Reuse existing feature services and hooks before creating a new layer.
- Keep one authoritative implementation for each feature operation.
- Browser services may perform ordinary RLS-protected CRUD.
- Use RPCs or Edge Functions for multi-row atomic operations, privileged checks, provider calls, token generation, rate-limited actions, and secret-backed processing.
- Use typed request and response contracts. Do not weaken types with `any` or silent casts.
- Return actionable error codes, not provider-specific blobs.
- Preserve existing public contracts unless a deliberate migration updates every caller.
- Do not catch and discard errors. Translate, log safely, and return them to the caller.

## Authentication and user lifecycle

- Supabase Auth owns identity. `profiles` owns public user data.
- Never expose service-role keys, JWT signing secrets, provider secrets, or admin endpoints to Vite code.
- Only values intentionally public may use a `VITE_` prefix.
- LiveKit API secrets, OneSignal REST keys, Resend keys, AI keys, Turnstile secrets, and Supabase service-role keys are server-only.
- Do not trust email, username, role, or verification status supplied by the browser.
- Handle profile creation, account suspension, deletion, anonymisation, cascades, and storage cleanup deliberately.
- Protect sensitive account changes with recent authentication where required.

## Storage and media

Classify each bucket and object as public or private before coding.

- Public media may use stable public URLs only when public access is intentional.
- Messages, voicemail, private stories, private events, drafts, moderation evidence, and sensitive audio should use private buckets and short-lived signed URLs.
- Enforce object ownership through storage policies and user-scoped paths.
- Validate MIME type, extension, size, duration, and content category server-side where risk requires it.
- Use unique object paths. Never overwrite another user's predictable filename.
- Remove abandoned uploads and define deletion behavior when parent records are deleted.
- Do not make a bucket public merely to make an upload display in the UI.

## Realtime

Use Supabase Realtime only for state that benefits from immediate updates, such as messages, notifications, room state, queue state, and selected live interactions.

- Filter subscriptions narrowly.
- Authorize channel and row access.
- Clean up subscriptions on unmount, sign-out, and room exit.
- Deduplicate optimistic events and realtime echoes.
- Reconnect safely without duplicating writes or participants.
- Do not use realtime as the source of truth. Persist authoritative state first.

## LiveKit and karaoke

- LiveKit transports media and participant presence.
- Supabase owns room records, roles, stage requests, queue order, performance state, reactions, history, moderation, and access rules.
- Generate LiveKit tokens only in a trusted Edge Function after checking room access and role.
- Never expose LiveKit API keys or secrets to the browser.
- Queue operations must be atomic and idempotent.
- Host operations must verify the current host or moderator role server-side.
- Do not add commercial song or lyrics behavior without a valid licensed catalogue provider.

## Notifications and email

- OneSignal is the selected push provider unless verified code proves otherwise.
- Provider REST keys stay server-side.
- Store user notification preferences and device subscription state separately.
- Create notification records transactionally with important social actions when practical.
- Send external delivery asynchronously or with retry-safe jobs so a provider outage does not corrupt the core action.
- Deduplicate repeated notifications and respect blocks, privacy, quiet hours, and opt-outs.
- Resend or another email provider must be called only from trusted server code.

## AI and intelligence

AI is a server-side enhancement, not the source of truth.

- Never call paid or secret-backed AI providers directly from the browser.
- Use deterministic queries and business rules before AI ranking where they are sufficient.
- Validate AI input, bound token and cost usage, apply timeouts, and provide deterministic fallback behavior.
- Never let an AI response directly grant permissions, ban users, transfer value, expose identity, or mutate critical state without validated rules or human review.
- Do not fabricate embeddings, scores, moderation results, or recommendations when a provider is unavailable.
- Log model metadata and outcomes safely without storing unnecessary sensitive content.

## Idempotency and concurrency

Make retryable user actions safe:

- follow and unfollow
- reaction toggles
- saves
- RSVP changes
- invites
- queue joins and leaves
- room joins
- notification delivery
- media finalisation
- provider callbacks

Use unique constraints, transactions, advisory locks where justified, or idempotency keys. Do not use separate client-side existence checks as the only protection.

## Errors, logging, and observability

- Use consistent machine-readable error codes and safe user messages.
- Include request IDs across Edge Functions and provider calls.
- Never log access tokens, service-role keys, signed URLs, private message bodies, full audio transcripts, or unnecessary personal data.
- Capture unexpected server errors in Sentry when configured.
- Track product events through the established analytics adapter, not scattered direct calls.
- Do not claim an external notification, email, AI call, or live-room action succeeded unless the provider response was verified.

## Verification ladder

Use the narrowest applicable evidence:

1. inspect the changed diff
2. run the focused unit or service test
3. run focused SQL or pgTAP tests for changed tables and policies
4. serve and invoke the changed Edge Function locally when applicable
5. run TypeScript checking for changed contracts
6. run lint on touched TypeScript files
7. run migration smoke test on a clean local database for schema changes
8. run production build when client contracts changed
9. run full `npm run verify`, RLS, integration, or end-to-end suites only for broad changes or when requested

Never claim production behavior was verified if only static checks ran.

Use only these result labels when useful:

- VERIFIED WORKING
- VERIFIED FAILING
- NOT VERIFIED

## Completion format

Report only:

- requested backend result
- files changed
- schema, policy, function, service, storage, realtime, or provider impact
- migrations created and whether they were applied
- verification commands and exact results
- real limitations, deployment steps, or secrets still required

Do not propose unrelated backend features or continue beyond the user's scope.
