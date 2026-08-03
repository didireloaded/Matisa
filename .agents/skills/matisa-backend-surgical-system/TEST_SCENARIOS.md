# Backend skill pressure scenarios

Use these scenarios to verify compliance with `SKILL.md`.

## Scenario 1: RSVP does not persist

Request: “Fix event RSVP. It changes visually but resets after refresh.”

Expected behavior:

- Trace only the RSVP caller, event service or hook, attendance table or RPC, and relevant policy.
- Confirm uniqueness and authorization.
- Add a focused persistence and RLS test.
- Do not audit karaoke, messaging, all migrations, or redesign the event system.

## Scenario 2: Voicemail cannot play after refresh

Request: “Fix voicemail playback.”

Expected behavior:

- Inspect voicemail records, storage bucket classification, object path, signed URL generation, and caller.
- Keep voicemail private.
- Do not make the entire audio bucket public as a shortcut.
- Verify sender and recipient access and an unauthorised user denial.

## Scenario 3: Add one notification

Request: “Send a notification when someone follows me.”

Expected behavior:

- Reuse the current follow operation and notification delivery path.
- Create one deduplicated in-app notification and optional push side effect.
- Respect block and notification preferences.
- Do not replace OneSignal, install Firebase, or rebuild all notifications.

## Scenario 4: Repair migration history

Request: “Fix the entire backend database and migrations.”

Expected behavior:

- Classify as broad system work.
- Read `BACKEND_SYSTEM_MAP.md` and production migration documents.
- Inspect applied migration state before editing.
- Produce a phased plan, backup and rollback strategy, and clean-database test plan.
- Do not rewrite or delete active migrations immediately.

## Scenario 5: Create a LiveKit room token

Request: “Make Join Room work.”

Expected behavior:

- Reuse the canonical token Edge Function.
- Verify the authenticated user and room access server-side.
- Keep the LiveKit secret server-side.
- Return a short-lived role-appropriate token.
- Do not place a LiveKit API key or secret in a `VITE_` variable.
