# Matisa Frontend Cutover Map

> Created during Phase 1 routing migration. Records every active prototype behavior and its routed destination or honest deferral.

| Prototype behavior | Current owner | Routed destination | Decision | Verification |
|---|---|---|---|---|
| App shell and local screen state (`Screen` type, `active` state) | `src/App.tsx` | `src/App.tsx` (composition root), `src/app/routes.tsx`, `src/components/layout/MainLayout.tsx` | Replace with URL routes | Route tests + E2E |
| TopBar (logo, messages, activity, profile/sign-out buttons) | `src/App.tsx` `TopBar` | `src/components/layout/MainLayout.tsx` `TopBar` | Use existing `MainLayout` TopBar (already has real notification query) | Shell visual verification |
| BottomNav (Home, Explore, Create, Karaoke, Profile) | `src/App.tsx` `BottomNav` | `src/components/layout/PrimaryNavigation.tsx` | Replace with URL-driven `NavLink` navigation; change tabs to Home, Explore, Create, Inbox, Profile | Navigation test + E2E |
| CreateRadialOverlay (Room, Story, Event, Note, Live) | `src/App.tsx` `CreateRadialOverlay` | `src/components/common/CreateRadialMenu.tsx` | Restrict to Note, Voice, Story only | Create menu test |
| ComposeSheet (note + karaoke creation) | `src/App.tsx` `ComposeSheet` | `src/components/feed/CreateNoteModal.tsx` (notes), karaoke deferred | Split; notes use existing modal, karaoke hidden until Phase 3 | Modal test |
| HomeScreen (stories, quick cards, feed, reactions) | `src/App.tsx` `HomeScreen` | `src/pages/Home.tsx` | Migrate real feed logic in Phase 4; page exists | Home slice test |
| ExploreScreen (search, people cards, events preview) | `src/App.tsx` `ExploreScreen` | `src/pages/Discovery.tsx` → route `/explore` | Migrate in Phase 4; page exists | Discovery slice test |
| EventsScreen (event cards, local RSVP) | `src/App.tsx` `EventsScreen` | `src/pages/Events.tsx` | Migrate in Phase 4; page exists | Events slice test |
| KaraokeScreen (hardcoded rooms, broken profiles) | `src/App.tsx` `KaraokeScreen` | Deferred | Hide from primary navigation; TypeScript errors originate here | Absence test (no `/karaoke` primary nav) |
| MessagesScreen (fake conversations, generated timestamps) | `src/App.tsx` `MessagesScreen` | `src/pages/Messages.tsx` → route `/inbox` | Migrate in Phase 4; page exists with honest empty state | Inbox slice test |
| ActivityScreen (empty state) | `src/App.tsx` `ActivityScreen` | `src/pages/Activity.tsx` → route `/activity` | Migrate in Phase 4; page exists | Activity slice test |
| ProfileScreen (fake tabs, gradient squares, fake edit) | `src/App.tsx` `ProfileScreen` | `src/pages/Profile.tsx` | Migrate in Phase 4; page exists with real profile loading | Profile slice test |
| RadarScreen (fake distances, fake people-nearby) | `src/App.tsx` `RadarScreen` | None | Remove from active product | Route absence test |
| Note reactions (heart toggle, optimistic updates) | `src/App.tsx` `PostCard`, `src/features/reactions` | Home post card using `reactionService` | Preserve service; rewire in Phase 4 | Existing reaction service tests |
| Voicemail (recording, inbox, playback) | `src/features/voicemail` | Inbox/chat slice | Preserve service; hide until routed UI verified | Existing voicemail tests |
| Event loading/RSVP | `src/features/events` | `/events` | Preserve service; routed page migration in Phase 4 | Existing event tests |
| Direct Supabase queries in App.tsx (profiles, notes, events) | `src/App.tsx` | Feature hooks/services | Do not copy; pages use hooks/services instead | No raw Supabase calls in routed pages |
| Fake notification badge (hardcoded "3") | `src/App.tsx` `TopBar` | None | Do not migrate; `MainLayout` TopBar queries real unread count | Visual verification |
| Fake profile badge (hardcoded "1") | `src/App.tsx` `TopBar` | None | Do not migrate | Visual verification |
| Green online dots on every avatar | `src/App.tsx` `Avatar` | None | Do not migrate until real presence exists | Visual verification |
| "Matisa pulse" decorative panels | `src/App.tsx` `PostCard` | None | Do not migrate | Visual verification |
| Feed status pill ("Latest activity loaded") | `src/App.tsx` `HomeScreen` | None | Do not migrate; developer feedback | Visual verification |
| Following feed (sliced For You array) | `src/App.tsx` `HomeScreen` | Proper following query in Phase 4 | Do not copy the array-slice approach | Home slice test |
| Hardcoded event labels ("Free", "social") | `src/App.tsx` `EventsScreen` | Real event metadata in Phase 4 | Do not migrate hardcoded labels | Events slice test |
| Fake attendee avatars on events | `src/App.tsx` `EventsScreen` | Real attendee query in Phase 4 | Do not migrate | Events slice test |
| Sign-out from profile header icon | `src/App.tsx` `TopBar` | Settings page | Move to Settings in Phase 3 | Settings test |
| `src/utils/supabase.ts` duplicate client | `src/utils/supabase.ts` | `src/lib/supabase.ts` (authoritative) | Delete duplicate; point features to `@/lib/supabase` | Singleton test |
