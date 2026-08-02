---
name: matisa-frontend-surgical-edits
description: Use when changing, fixing, reviewing, or polishing any Matisa frontend screen, component, interaction, styling, navigation, accessibility behavior, or client-side state.
metadata:
  project: Matisa
  version: "1.0.0"
---

# Matisa Frontend Surgical Edits

## Core rule

Make the smallest complete change that solves the user's exact request. Do not audit, redesign, refactor, or repair unrelated parts of Matisa.

## Mandatory start

Before editing, write a private scope lock containing:

- exact requested result
- affected screen or feature
- likely files
- explicit non-goals
- acceptance check

Then inspect narrowly. Search for the visible text, route, component, hook, or symbol first. Do not begin by reading the whole repository.

## Context and credit discipline

- Read this file before every Matisa frontend task.
- Read `AGENTS.md` once per session.
- For a focused frontend task, do **not** read the full master build prompt, all docs, all pages, or the entire `src/` tree.
- Start with search, then open only the files that directly own the requested behavior.
- Before the first edit, normally inspect no more than 2 to 8 relevant source files.
- Expand scope only when a direct dependency proves it is necessary.
- Never repeat searches or reread unchanged files without a concrete reason.
- Do not install packages, regenerate lockfiles, browse the web, run database audits, inspect migrations, or open backend functions unless the requested frontend change genuinely requires them.
- Do not run the full test suite after every edit. Run the narrowest useful check first, then one final broader check when justified.
- Stop when the requested result is complete. Do not continue into nearby cleanup.

## Task size routing

### Small change

Examples include spacing, copy, one button, one card, one modal, one broken state, or one screen adjustment.

- Touch the fewest files possible.
- Reuse existing components and tokens.
- Run focused lint or tests for touched files.
- Do not create a plan document.

### Feature change

Examples include making Follow work, connecting a composer, adding a real empty state, or completing one screen flow.

- Trace only the required vertical path: UI → hook or state → service.
- Reuse the authoritative implementation already in the repository.
- Add or update focused tests for changed behavior.
- Do not repair other features discovered along the way.

### System change

Examples include replacing the active app shell, consolidating duplicate frontend architectures, changing navigation across the app, or a broad production audit.

- Only enter this mode when the user explicitly requests broad work.
- Then consult the relevant production documents and write a phased plan.

## Frontend boundaries

When the user says frontend only:

- Do not change database schemas, migrations, Edge Functions, RLS, external integrations, or backend contracts.
- It is acceptable to connect existing frontend services and hooks.
- If required backend capability does not exist, complete the honest frontend state and report the backend dependency. Do not invent fake success.

## Preserve the Matisa UI

Keep the established identity:

- near-black background
- orange primary accent
- restrained purple for voice or karaoke
- Syne for selected display headings
- rounded mobile surfaces
- circular avatars and story rings
- compact bottom navigation
- dark sheets and modals

Improve the existing UI without replacing it:

- preserve the current layout unless the requested problem requires a layout change
- use existing spacing, type, radius, and colour tokens
- reuse existing Button, Avatar, Modal, BottomSheet, Tabs, audio, and card primitives
- prefer hierarchy, spacing, and real content over new gradients, glows, pills, or cards
- do not add a new colour, font, component variant, animation language, or navigation pattern for one screen
- do not create the generic AI-generated dashboard look

## Interaction honesty

Every visible action must be real, clearly unavailable, or hidden.

Never add:

- fake counts or fake online indicators
- hardcoded social activity presented as live data
- empty click handlers
- fake success messages
- disabled reaction buttons that appear usable
- placeholder gradient content pretending to be real media
- duplicate implementations of an existing component, hook, service, or route

## Implementation rules

- Fix the source actually rendered by `src/main.tsx`. Confirm the active route or import before editing.
- Search for an existing implementation before creating a new one.
- Keep business logic out of visual components where an existing hook or service owns it.
- Preserve public component APIs unless the request requires a deliberate change.
- Avoid broad formatting changes and unrelated import sorting.
- Do not rename files, folders, routes, or database-facing fields as incidental cleanup.
- For bug fixes or behavior changes, add the smallest meaningful regression test first where the current test setup supports it.
- Never weaken types with `any`, suppressions, or ignored errors to make a check pass.

## Verification ladder

Use the smallest applicable verification:

1. inspect the changed diff
2. run focused test for the changed component, hook, or feature
3. run ESLint on touched TypeScript files
4. run TypeScript checking when types or interfaces changed
5. run a production build when routing, imports, configuration, or shared UI changed
6. run full verification only for broad changes or when requested

Do not claim a result worked without reporting what was actually checked.

## Completion format

Report only:

- what changed
- files changed
- verification performed and result
- any real dependency or limitation that remains

Do not propose extra features unless they block the requested work.
