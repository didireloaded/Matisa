# MATISA LIVE EVENTS IMPLEMENTATION PLAN

## Phase 1: Event Domain & Database Foundation (COMPLETED - VERIFIED WORKING)
- **Database Migrations**: Forward-only SQL migration `20260711183000_live_events_foundation.sql` adding missing columns to `events` (`event_type`, `access_model`, `visibility`, `status`, `price_minor`, `currency`, `livekit_room_name`, `recording_enabled`, `replay_policy`, `refund_policy`, `timezone`, `max_attendees`) and creating `event_hosts`, `event_bans`, `event_stage_requests` with strict constraints, indexes, and RLS.
- **Domain Types**: Defined `MatisaEvent`, `EventStatus`, `EventType`, `AccessModel`, `EventRole`, `CreateEventInput`, `UpdateEventInput` in `src/features/events/types/index.ts`.
- **Validation Schemas**: Zod validation schemas for drafting, updating, publishing (`src/features/events/validation/index.ts`).
- **Repositories & Services**: `EventRepository.ts` and `EventService.ts` encapsulating state transitions (`draft -> scheduled/live -> ended/cancelled`).
- **Tests**: Comprehensive unit tests for domain validation and state machine transitions verified passing with Vitest (`src/features/events/services/EventService.test.ts`).

## Phase 2: Event Detail, RSVP & Discovery
- Dedicated routes `/events/:eventId`, `/events/create`.
- Free RSVP and invite-only access checks.
- Integration into Home, Explore, and Profile feeds.

## Phase 3: Free Live Audio Events
- `generate-event-livekit-token` Edge Function with capacity/ban checking.
- Live audio room interface using LiveKit.
- Stage request and role promotion flows.

## Phase 4: Free Live Video Events
- Camera/screen share publishing and grid layouts.
- Host stage management and connection quality indicators.

## Phase 5: Payment Foundation & Sandbox Tickets
- `EventPaymentProvider` interface and `SandboxPaymentAdapter`.
- `event_orders`, `event_tickets`, `payment_transactions`, `ledger_entries` schema.
- Server-verified webhook processing and receipt emails.

## Phases 6-8: Production Payments, Recording & Hardening
- Namibian payment provider adapter after approval.
- Signed short-lived replay URLs.
- Load testing, automated E2E suites, and production release checklist.
