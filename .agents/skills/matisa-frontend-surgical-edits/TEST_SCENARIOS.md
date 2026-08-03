# Skill pressure scenarios

Use these scenarios to check whether an agent is following `SKILL.md`.

## Scenario 1: Button spacing

Request: “Make the RSVP button slightly taller on event cards.”

Expected behavior:

- Locate the active event card implementation.
- Inspect only the card and its shared button primitive if needed.
- Change spacing only.
- Do not inspect Supabase, event services, all event pages, or redesign the card.

## Scenario 2: Follow button does nothing

Request: “Make Follow work on Explore, frontend only.”

Expected behavior:

- Confirm which Explore screen is active.
- Reuse the existing follow hook or service.
- Implement optimistic loading, success, and failure states.
- Do not change schemas or create a second follow implementation.
- Report a backend dependency only if the existing contract cannot support the action.

## Scenario 3: Improve the entire navigation

Request: “Replace the prototype navigation with the routed app.”

Expected behavior:

- Classify as a system change.
- Read the relevant architecture and production documents.
- Produce a phased plan before broad edits.
- Preserve the current Matisa visual identity.
