# Matisa Frontend Consolidation Design

## Objective

Consolidate Matisa's active monolithic prototype and its disconnected routed frontend into one production-oriented routed application without losing the existing reactions, voicemail, events, audio, configuration, documentation, or migration work in the dirty checkout.

## Scope lock

- Activate URL-driven routing and the existing provider/layout architecture.
- Preserve Matisa's near-black, orange-led mobile visual identity.
- Retain only honest interactions: working, explicitly unavailable, or hidden.
- Fix the active TypeScript failures, accessibility blockers, navigation history, safe areas, and PWA shell consistency.
- Migrate user-facing screens one verified vertical slice at a time: shell, Home, Explore, Inbox/Activity, Profile, then creation flows.
- Reuse existing hooks, services, repositories, and UI primitives; converge on one Supabase client.

## Non-goals

- No product redesign, new feature expansion, destructive database work, schema rewrite, or external-provider setup.
- No broad formatting, unrelated cleanup, or deletion of user-owned uncommitted work.
- No fake data, counts, presence, messages, success states, or empty handlers.

## Chosen approach

Use an incremental strangler cutover. Restore the small routed application shell and provider stack, preserve the monolith as temporary migration input, and move only validated behavior into focused routed pages. This is safer than either continuing to patch the 2,062-line component or replacing it wholesale, because current uncommitted feature work overlaps the monolith.

## Architecture

`src/main.tsx` continues to render `App`. `App` becomes a small composition root containing providers, `BrowserRouter`, lazy route modules, an error boundary, and route-level suspense. `MainLayout` owns the mobile shell and renders an `Outlet`; the URL is the sole navigation state. Feature pages consume hooks and services, not raw Supabase queries. The structured `src/lib/supabase.ts` client becomes authoritative, with reactions and voicemail factories migrated to receive or import that instance.

## Route surface

- `/` — Home
- `/explore` — unified discovery
- `/create` — honest create sheet or route with Note, Voice, and Story only when each works
- `/inbox` — conversations with an Activity tab
- `/profile/:username?` — signed-in or public profile
- Secondary routes for authentication, chat, settings, events, and content detail remain addressable but do not expand primary navigation.

## Migration sequence

1. Capture the monolith's uncommitted feature behavior and add regression coverage for anything retained.
2. Introduce the routed composition root and compile-safe shell.
3. Consolidate providers, Supabase client usage, navigation, safe areas, zoom, text selection, contrast, focus, and reduced motion.
4. Rebuild Home around real feed data and honest loading/empty/error/retry states.
5. Connect Explore to real people, notes, and event queries with truthful filtering.
6. Connect Inbox/Activity, then Profile, following existing service boundaries.
7. Expose only working creation flows and remove the temporary monolith.

## Data and error flow

Each interaction follows `page/component -> feature hook -> service -> repository/Edge Function -> Supabase/provider`. TanStack Query owns server cache and retry boundaries. Mutations use optimistic updates only when rollback is implemented. Guests receive an authentication-required flow before protected writes. Errors are visible, specific, retryable, and never converted into fake success.

## Verification

Each slice begins with a failing focused test for changed behavior, then passes focused tests, ESLint on touched files, TypeScript checking, and a production build when routing or shared UI changes. Visible shell and navigation changes receive browser verification at mobile dimensions. Final evidence must report exact commands, pass/fail counts, warnings, and remaining external dependencies.

## Acceptance criteria for the first slice

- Browser back, forward, refresh, and deep links work for primary routes.
- `src/App.tsx` is a small routed composition root instead of the active monolith.
- Existing user-owned reactions, voicemail, events, and audio work is preserved or explicitly mapped for later migration.
- No compile errors remain.
- No fake badges, fake online state, dead navigation buttons, Radar route, or internal development copy appears in the active shell.
- Zoom is enabled, text is selectable, safe areas are respected, and reduced-motion behavior exists.
- Focused tests, TypeScript, lint, and production build complete with recorded evidence.
