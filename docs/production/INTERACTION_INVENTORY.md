# MATISA MASTER INTERACTION INVENTORY

Phase: 0 baseline inventory only.

Statuses allowed by current directive: VERIFIED WORKING, VERIFIED FAILING, NOT VERIFIED.

## Inventory Method

- Static repository file list inspected.
- Static search run for dead/mock patterns across `src` and `supabase/functions`.
- Runtime interaction testing was NOT VERIFIED because `npm run build` and `npm run test` fail to load `vite.config.ts` in the current sandbox.

## High-Level Routes / Screens

| Screen | Component / File | Interaction Scope | Status | Evidence |
|---|---|---|---|---|
| App shell | `src/App.tsx` | Top bar, bottom nav, create sheet, screen routing | NOT VERIFIED | Runtime not tested in this Phase 0 pass. |
| Home feed note card | `src/App.tsx` `PostCard` | Heart reaction toggle | VERIFIED WORKING | `ReactionService` writes/removes through `ReactionRepository`; optimistic UI rollback added; `npm run typecheck`, `npm run test`, `npm run lint`, and `npm run build` passed. Database/RLS runtime remains NOT VERIFIED. |
| Home | `src/pages/Home.tsx` | Feed, stories, create actions, dummy imports | VERIFIED FAILING | Imports `USERS` / dummy source from `src/data/dummy.ts`; static search found placeholder/dead action indicators. |
| Auth | `src/pages/Auth.tsx` | Sign-in/sign-up/password flows | NOT VERIFIED | Static placeholder text found; real flow not executed. |
| Chat | `src/pages/Chat.tsx` | Message actions, media buttons | VERIFIED FAILING | Static search found empty handlers and placeholder indicators. |
| Messages | `src/pages/Messages.tsx` | Conversation list/search | NOT VERIFIED | Static placeholder text found; realtime behavior not tested. |
| Events | `src/pages/Events.tsx` | Event create/RSVP/actions | NOT VERIFIED | Event service/test files exist; runtime not tested. |
| Discovery | `src/pages/Discovery.tsx` | Search/filter/discovery | NOT VERIFIED | Static placeholder text found. |
| Notes | `src/pages/Notes.tsx` | Note create/read/reactions | NOT VERIFIED | Static placeholder text found; persistence not tested. |
| Music | `src/pages/Music.tsx` | Music/player/playlists | NOT VERIFIED | Static placeholder text found. |
| Activity | `src/pages/Activity.tsx` | Notifications/activity | NOT VERIFIED | Realtime/read-state behavior not tested. |
| Profile | `src/pages/Profile.tsx` | Profile view/edit/social actions | NOT VERIFIED | Runtime not tested. |
| Onboarding | `src/pages/Onboarding.tsx` | Onboarding progress | NOT VERIFIED | Runtime not tested. |
| Settings | `src/pages/Settings.tsx` | Account/settings actions | NOT VERIFIED | Runtime not tested. |

## Pattern Findings

| Pattern | Status | Evidence |
|---|---|---|
| `console.log` in source | VERIFIED FAILING | Found in `src/contexts/AuthContext.tsx`, `src/lib/analytics.ts`, `supabase/functions/send_push_notification/index.ts`. |
| Dummy data | VERIFIED FAILING | `src/data/dummy.ts`; `src/pages/Home.tsx` imports dummy content. |
| TODO Edge Functions | VERIFIED FAILING | Found in voice/karaoke/speaker queue Edge Functions. |
| Mock Edge Functions | VERIFIED FAILING | Found in embeddings/search/push notification functions. |
| Empty handlers | VERIFIED FAILING | Static search found `onClick={() => {}}` in page code. |

## Required Next Inventory Step

Before implementation, generate a machine-readable registry with:

Screen, Component, Visible label, Expected action, Handler, Hook, Service, Repository or Edge Function, Database tables, External integration, Analytics event, Notification, Permission rule, Test file, Status.

Status remains NOT VERIFIED until each interaction has automated or manual evidence.
