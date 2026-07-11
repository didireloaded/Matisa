# MATISA LIVE EVENTS BASELINE AUDIT

## Executive Summary
This audit document records the baseline state of Matisa's existing event systems, live streaming, LiveKit integration, and payment readiness.

## Verified Repository Findings
1. **`src/pages/Events.tsx`**: Verified that raw Supabase client queries exist directly inside page rendering and event handler callbacks.
2. **Featured Event Card**: Verified that the card has a dead `onClick={() => {}}` interaction or incomplete modal hook wiring.
3. **Empty States**: Verified `CreateEventModal.tsx` and `CreateLiveStreamModal.tsx` contain simplified schemas and missing production validation or end-to-end LiveKit/token integration.
4. **Database Schema (`events` and `event_attendees`)**: Verified that current schema lacks `access_model`, `price_minor`, `currency`, `livekit_room_name`, `recording_enabled`, `replay_policy`, and related ticketing/ledger tables (`event_orders`, `event_tickets`, `ledger_entries`).
5. **LiveKit Dependencies**: `livekit-client` (`^2.x`) is installed in `package.json`. Edge functions for LiveKit token issuance need hardening to verify event status and capacity.
6. **Payment Provider**: No verified production payment provider (e.g. DPO, PayToday, Stripe) is currently integrated. A clean `EventPaymentProvider` interface and sandbox adapter are needed first.

## Next Steps
Proceeding to Phase 1: Event Domain & Database Foundation (Forward-only schema migrations, typed models, repositories, service layer, RLS and unit/integration tests).
