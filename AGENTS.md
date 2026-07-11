# AGENTS.md — Matisa Repository Instructions

## Product scope

Matisa is a mobile-first PWA social platform for everyday users. Its core product includes people discovery, Stories, Explore, Music, Messages, Activity, Profiles, 50-character Notes, voice content, live voice rooms, karaoke, events, reactions, comments, sharing, saves, contextual user ratings, and an Anonymous Wall.

Matisa is not a marketplace, freelancer platform, job board, creator SaaS platform, business directory, ecommerce app, dating app, professional network, game, XP platform, or Radar/map-discovery app. Do not reintroduce opportunities, crew finder, wallets, gifting, creator tiers, or Radar.

## Required master specification

Before planning or changing code, read:

`docs/production/MATISA_CODEX_MASTER_BUILD_PROMPT.md`

Treat that document as the implementation and production-readiness specification. Work phase by phase. Begin with Phase 0 unless the user explicitly selects another approved phase.

## Working rules

- This is an existing codebase, not a greenfield rewrite.
- Preserve the established premium mobile-first UI unless a small change is needed for usability, accessibility, honesty, or completion.
- Do not add new features while production-hardening the current systems.
- Do not use user-facing mock data, fake success messages, empty handlers, or “coming soon” behavior.
- Do not expose secrets in Vite variables, source code, logs, docs, screenshots, fixtures, or test snapshots.
- Do not edit an applied production migration without proving it is safe. Prefer forward-only corrective migrations.
- Do not run destructive database commands without staging verification, backup, rollback plan, and user approval.
- Do not add a production dependency without explaining why the current stack cannot solve the requirement.
- Do not duplicate services, hooks, database schemas, or Edge Functions.
- Keep UI components focused on rendering. Use feature hooks, services, repositories, Supabase RPCs, or Edge Functions for business logic.
- Keep Supabase as the source of truth. LiveKit transports live audio but does not own karaoke business state.
- Keep the Anonymous Wall anonymous to the public but attributable to authorised internal moderation.
- Use deterministic Explore ranking before relying on AI.
- Do not enable commercial karaoke songs without a valid licensed catalogue provider.
- Do not claim completion without verification evidence.

## Stack

Use the repository’s established stack:

- React 19, Vite, TypeScript
- React Router
- Tailwind CSS
- TanStack Query
- Zustand
- Supabase Auth, PostgreSQL, Storage, Realtime, Edge Functions, and RLS
- LiveKit
- OneSignal
- Resend
- Mapbox or the documented MapLibre/Mapbox combination for Events only
- PostHog
- Sentry
- Cloudflare Turnstile
- Upstash Redis
- OpenAI moderation and speech-to-text through server-side Edge Functions only
- A provider-neutral licensed karaoke catalogue integration
- Vitest, React Testing Library, pgTAP/SQL RLS tests, and Playwright

## Required workflow

1. Read the master specification and repository documentation.
2. Inspect Git status and work on a feature branch.
3. Run baseline install, typecheck, lint, tests, build, and Supabase checks.
4. Produce factual findings and a written plan before destructive changes.
5. Implement one vertical slice at a time.
6. Add or update migrations, RLS, tests, observability, and documentation with each slice.
7. Run verification before committing.
8. Report exact commands and results.
9. Stop when a critical check fails. Fix it before proceeding.

## Verification

The repository should provide and pass an equivalent of:

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
npm run test:rls
npm run verify
```

Use these completion labels only:

- VERIFIED WORKING
- VERIFIED FAILING
- NOT VERIFIED

Never write “should work” as evidence.
