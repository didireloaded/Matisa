# Home Conversation Composer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Home quick-action cards with the approved conversation composer and add the Trending Conversations empty state.

**Architecture:** Add one presentation-only Home component for the composer and empty state, then connect it to the existing callbacks in the active `src/App.tsx`. Existing note creation and Events navigation remain authoritative. Unsupported Voice Note and Story actions are rendered disabled rather than faked.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, lucide-react, Vitest, React Testing Library.

## Global Constraints

- Frontend only.
- Preserve the existing Matisa UI and active `src/App.tsx` architecture.
- Do not add dependencies, backend changes, fake success states, or unrelated refactors.
- Run the narrow component test first, then lint the touched files, typecheck, and build.

---

### Task 1: Build and verify the Home conversation UI

**Files:**
- Create: `src/features/home/components/HomeConversationSection.tsx`
- Create: `src/features/home/components/HomeConversationSection.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `avatar: ReactNode`, `onCreateNote: () => void`, `onOpenEvents: () => void`.
- Produces: `HomeConversationComposer` and `TrendingConversationEmptyState` React components.

- [x] **Step 1: Write the failing component test**

Test that the composer renders the approved labels, that all note entry points call `onCreateNote`, that Event calls `onOpenEvents`, and that Voice Note and Story are disabled.

- [x] **Step 2: Run the focused test and verify it fails because the component does not exist**

Run: `npm test -- src/features/home/components/HomeConversationSection.test.tsx`

Expected: FAIL because `HomeConversationSection` has not been implemented.

- [x] **Step 3: Implement the minimal presentation components**

Create the composer card and empty state using existing Matisa colours, rounded surfaces, and lucide icons. Do not include data fetching or business logic.

- [x] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- src/features/home/components/HomeConversationSection.test.tsx`

Expected: PASS.

- [x] **Step 5: Connect the components to the active Home screen**

Replace the two quick-action cards in `HomeScreen`. Pass the current profile avatar, existing note composer callback, and Events navigation callback. Add the Trending Conversations heading and honest loading, error, empty, and populated states. Hide the green presence dot on the composer avatar.

- [x] **Step 6: Run focused and final verification**

Run:

```bash
npm test -- src/features/home/components/HomeConversationSection.test.tsx
npx eslint src/App.tsx src/features/home/components/HomeConversationSection.tsx src/features/home/components/HomeConversationSection.test.tsx
npm run typecheck
npm run build
```

Expected: component test passes, touched-file lint has no errors, typecheck succeeds, and production build succeeds.

## Verification result

- Custom component interaction check: PASS.
- ESLint on touched files: PASS.
- Focused TypeScript compile for the new component and test: PASS.
- Full project typecheck: BLOCKED by pre-existing `KaraokeScreen` and `ActivityScreen` errors in `src/App.tsx`.
- Vitest and Vite build: BLOCKED because the supplied dependency folder contains Windows native packages and is missing `@rollup/rollup-linux-x64-gnu` in this Linux environment.
