# AGENTS.md — Matisa Repository Instructions

## Product scope

Matisa is a mobile-first social platform centred on Notes, Stories, people discovery, Messages, Activity, Profiles, voice content, live voice rooms, karaoke, physical and in-app events, and live video.

Matisa uses two Note lifetimes:

- 24-hour Note, maximum 200 characters
- Permanent Note, maximum 1,000 characters, with optional image or video

The permanent bottom navigation is Home, Explore, Create, Rooms, and Profile. The top navigation contains Messages and Activity but no Profile button. Rooms contains Karaoke and Voice Rooms. Profile tabs are Posts, Voice, Events, Videos, and Saved. Music is not part of the current product UI.

Matisa may sell access to specific paid virtual events through an external payment provider and server-authoritative event entitlements. This does not make Matisa a general wallet, gifting, marketplace, job board, dating app, creator SaaS, or Radar/map-discovery product. Do not reintroduce wallets, gifting, opportunities, crew finder, creator tiers, Radar, or unrelated gamification.

For the complete current product behaviour, consult `docs/product/MATISA_COMPLETE_PRODUCT_IMPLEMENTATION_SPEC.md` as directed below.

## Task routing and required instructions

Always read this file once at the start of a coding session. Then load only the instructions required by the current task.

### Focused frontend work

For any Matisa frontend screen, component, interaction, styling, navigation, accessibility, or client-side state task, read:

`.agents/skills/matisa-frontend-surgical-edits/SKILL.md`

Follow its scope-lock and context-efficiency rules. For a focused frontend request, do not load the full production specification or audit the whole repository unless the task proves that broader context is necessary.

### Focused backend work

For any Matisa database, Supabase, Edge Function, RLS, storage, realtime, authentication, LiveKit, notification, AI, service, or server-side integration task, read:

`.agents/skills/matisa-backend-surgical-system/SKILL.md`

Follow its scope-lock, source-of-truth, security, migration, and context-efficiency rules. For a focused backend request, do not load every migration, all Edge Functions, the full backend map, or the master production prompt unless the direct trace proves broader context is necessary.

### Broad product implementation

For a multi-screen product build, navigation change, Home or Explore rebuild, Note lifecycle work, room-system work, profile-system work, or event-system work, read:

`docs/product/MATISA_COMPLETE_PRODUCT_IMPLEMENTATION_SPEC.md`

Work only on the approved phase. For a focused task, search the specification for the relevant section instead of loading the whole document.

### Broad production or cross-system work

Read `.agents/skills/matisa-backend-surgical-system/BACKEND_SYSTEM_MAP.md` and `docs/production/MATISA_CODEX_MASTER_BUILD_PROMPT.md` only when the user requests a broad audit, production hardening, architecture consolidation, migration repair, security review, deployment readiness, or a multi-feature system change. The current product behaviour in `docs/product/MATISA_COMPLETE_PRODUCT_IMPLEMENTATION_SPEC.md` overrides older product descriptions where they conflict. Work phase by phase and begin with the applicable approved phase.

User scope overrides ambition. If the user requests one screen, one function, or one behavior, complete only that scope.

## Working rules

- This is an existing codebase, not a greenfield rewrite.
- **REELIO UI STYLE LOCK**: Preserve the established Reelio visual UI design (`Social Video Streaming Mobile App UI_UX __ Behance_files`) 100%. Do NOT redesign, replace, or alter the UI layout, visual aesthetics, glassmorphism, floating capsule navigation, gradient cards, or screen structure unless explicitly requested by the user. Only refine or fix underlying usability and bugs while maintaining 100% visual parity with the Reelio Behance blueprint.
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

1. Read only the specifications and repository documentation required by the approved task scope.
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
