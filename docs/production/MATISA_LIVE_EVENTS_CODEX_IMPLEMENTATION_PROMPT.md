# MATISA — LIVE AUDIO, LIVE VIDEO, FREE AND PAID EVENTS CODEX IMPLEMENTATION PROMPT

## ROLE

Act as the senior staff engineer, backend architect, payments engineer, security engineer, realtime-media engineer, QA lead, and release owner for the existing Matisa repository.

This is an existing React, Vite, TypeScript and Supabase application. Do not rebuild the app from scratch. Do not redesign the visual identity. Preserve the current premium mobile-first interface and existing navigation while replacing mocked, incomplete, unsafe, or dead event functionality with a production-grade end-to-end system.

Your job is to build a real Matisa Events platform where ordinary users can create and host:

- free live video events
- paid live video events
- free live audio events
- paid live audio events
- physical events
- hybrid events

Example: a user creates a live cooking event, schedules it, chooses whether it is free or paid, publishes it, shares the event page, sells tickets when applicable, starts a live video room, interacts with attendees, ends the event, and optionally offers a replay.

Do not claim completion because screens exist. Completion requires real database persistence, RLS, server-side authorization, LiveKit access control, payment webhook verification, notifications, observability, tests, and proof that the full flow works with multiple accounts.

---

## CURRENT REPOSITORY FINDINGS TO VERIFY

Before changing code, verify these observations against the repository:

- `src/pages/Events.tsx` performs raw Supabase calls inside the page.
- The featured event card contains a dead `onClick={() => {}}` interaction.
- The empty state displays `Event creation coming soon!` instead of opening a working flow.
- `src/components/events/CreateEventModal.tsx` currently supports only limited event types and does not represent the required live-audio, live-video, physical and hybrid model.
- `src/components/live/CreateLiveStreamModal.tsx` inserts a record into `live_streams` but does not establish a complete LiveKit broadcast, role, token, presence, moderation, or ending flow.
- The current `events` and `event_attendees` tables are too limited for ticketing, paid access, live roles, refunds, recording and payouts.
- The consolidated Supabase migration appears malformed in places. Do not edit migration history blindly. Determine which migrations have been applied and use forward-only corrective migrations.
- LiveKit client dependencies are already present.
- OneSignal, PostHog and Sentry dependencies are already present but must be verified as correctly configured.
- No verified production payment provider is currently integrated.

Treat these as audit targets, not assumptions.

---

## NON-NEGOTIABLE PRODUCT RULES

1. Any authenticated Matisa user may create an event, subject to moderation, account standing, rate limits and paid-host eligibility.
2. Event types are:
   - `live_video`
   - `live_audio`
   - `physical`
   - `hybrid`
3. Access models are:
   - `free_public`
   - `free_private`
   - `invite_only`
   - `paid_ticket`
   - `free_with_tips` only after the payment foundation is stable
4. Event lifecycle is:
   - `draft`
   - `scheduled`
   - `live`
   - `ended`
   - `cancelled`
5. Event live roles are:
   - `host`
   - `cohost`
   - `moderator`
   - `speaker`
   - `attendee`
6. Only hosts, approved cohosts and approved speakers may publish microphone or camera tracks.
7. Attendees join as listen/view-only unless approved to speak or appear on camera.
8. Paid access is granted only after a server-verified payment webhook or an explicit staff-approved manual payment record.
9. Never unlock a paid event based only on a frontend redirect or client-side “success” state.
10. Money is stored as integer minor units. Never use floating-point values for prices, fees, balances or refunds.
11. Paid hosts must complete the selected payment provider’s identity and payout requirements before automated payouts are enabled.
12. Host earnings remain pending until the event ends and the configured settlement/dispute delay has passed.
13. Private and paid replays must never use permanently public storage URLs.
14. No secrets may exist in Vite browser environment variables.
15. Do not add arbitrary bank instructions or unverified external payment links as the primary paid-event system.
16. Support a provider adapter so the final supported Namibian payment provider can be selected without rewriting the Events domain.
17. The UI must clearly distinguish free, paid, live, scheduled, audio, video, physical and hybrid events.
18. Keep the experience social and accessible to normal users. Do not turn Events into a marketplace dashboard or enterprise SaaS interface.

---

## IMPLEMENTATION PHASES

### Phase 1 — event domain and database foundation
- forward-only schema migration
- generated types
- repositories/services
- RLS and tests
- lifecycle state machine
- event creation draft and publish flow

### Phase 2 — event detail, RSVP and discovery
- dedicated routes
- event detail
- free RSVP
- invite-only access
- sharing and saving
- Home/Explore/profile integration

### Phase 3 — free live audio events
- secure LiveKit token function
- audio room UI
- roles and stage requests
- E2E tests

### Phase 4 — free live video events
- camera publishing permissions
- view-only attendees
- guest stage
- E2E tests

### Phase 5 — payment foundation and sandbox tickets
- payment-provider interface
- sandbox adapter
- orders, webhook idempotency, tickets, ledger

### Phase 6 — selected production payment provider
### Phase 7 — recording, replay and settlement
### Phase 8 — hardening and release
