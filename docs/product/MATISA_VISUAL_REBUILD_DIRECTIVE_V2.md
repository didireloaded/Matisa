# MATISA COMPLETE VISUAL REBUILD DIRECTIVE V2

## This directive supersedes the previous redesign prompt

The previous attempt is not accepted.

Changing colors, gradients, shadows, border radii, or typography on the existing Matisa markup is not a redesign. The current result is only a theme swap.

The next implementation must rebuild the frontend composition, screen hierarchy, navigation, component geometry, spacing, media treatment, interaction placement, and responsive behavior so the application clearly resembles the supplied Social Video Streaming Mobile App UI/UX reference.

The old UI is not the foundation. The working product logic is the foundation.

---

# 1. Mandatory reference sources

Before editing frontend code, inspect both local sources completely:

```text
C:\Users\PC\Documents\APPS\Matisa\Social Video Streaming Mobile App UI_UX __ Behance.html
```

```text
C:\Users\PC\Documents\APPS\Matisa\Social Video Streaming Mobile App UI_UX __ Behance_files
```

The reference images in that folder are not optional mood-board material. They are the visual blueprint for layout, hierarchy, proportions, navigation, surfaces, typography, and screen composition.

Use the reference for:

- Home feed composition
- Stories presentation
- Floating glass navigation
- Large media cards
- Profile layout
- Messaging inbox
- Chat conversation layout
- Voice-note styling
- Discovery layout
- Settings layout
- Live video controls
- Voice-room participant layout
- Background lighting
- Cyan and blue atmospheric glow
- Typography scale
- Spacing rhythm
- Rounded geometry
- Button placement
- Icon containers
- Translucent surfaces

Do not use the Reelio name, logo, text, user names, or copyrighted photography as Matisa production content. Recreate the design language and structure with Matisa branding and Matisa data.

---

# 2. Current code diagnosis

The active frontend is not the routed page system.

`src/main.tsx` currently renders:

```tsx
<App />
```

The active `src/App.tsx` is a monolithic frontend of roughly 2,000 lines. It contains its own:

- top bar
- bottom navigation
- Home screen
- Explore screen
- Events screen
- Karaoke screen
- Messages screen
- Activity screen
- Profile screen
- compose overlays
- voicemail modal
- local screen-state navigation

The separate files under `src/pages`, `src/components`, `src/hooks`, and `src/services` contain reusable work, but most of them are not connected to the active application.

This is why changing component colors does not make the app resemble the reference. The old page composition is still being rendered.

---

# 3. Required architecture decision

## Retire the monolithic UI

Do not continue adding visual changes inside the current giant `src/App.tsx`.

The new `src/App.tsx` should become a small application root responsible for:

- providers
- authentication bootstrap
- router
- global error boundary
- global audio player
- global modal or sheet portal
- toast system

It must not contain entire screen implementations.

## Introduce real route-based screens

Use React Router and connect these routes:

```text
/auth
/onboarding
/
/explore
/messages
/messages/:conversationId
/rooms
/rooms/:roomId
/karaoke/:roomId
/events
/events/:eventId
/activity
/profile
/profile/:username
/settings
/live/:sessionId
```

The bottom navigation must derive its active state from the route.

Browser back, Android back, refresh, deep links, and shared links must work.

## Preserve logic, replace presentation

Reuse valid:

- Supabase client setup
- authentication context
- hooks
- services
- database contracts
- storage logic
- realtime subscriptions
- reaction logic
- voicemail service
- event service
- story service
- messaging service
- profile data

Replace old JSX structure, visual primitives, and screen layouts.

---

# 4. What counts as a real redesign

A screen is redesigned only when all of the following change where necessary:

- DOM and component hierarchy
- content order
- dimensions and proportions
- spacing system
- visual grouping
- navigation treatment
- media treatment
- typography hierarchy
- interaction placement
- empty and loading states
- modal and sheet behavior
- mobile safe-area behavior

A screen is not redesigned when the old markup remains and only these change:

- background color
- text color
- gradient values
- shadow values
- border radius
- icon color
- font family

## Hard rejection rule

If a Git diff for a screen mostly consists of class-name color changes while the JSX structure remains substantially the same, reject the work and rebuild the screen.

---

# 5. New visual foundation

## Background

Use a layered blue-black environment rather than a flat black page.

The default screen background should combine:

- deep navy base
- subtle cyan glow near the upper area
- darker lower region
- occasional soft radial light behind key content
- no repeated decorative glow on every card

Suggested foundation:

```css
--app-bg: #020711;
--app-bg-raised: #07111f;
--surface-dark: #101927;
--surface-glass: rgba(19, 31, 47, 0.72);
--surface-glass-strong: rgba(25, 39, 57, 0.88);
--line-soft: rgba(255, 255, 255, 0.08);
--text-primary: #ffffff;
--text-secondary: #9090a1;
--cyan: #39b7f2;
--cyan-deep: #24a3c7;
--purple: #6139f2;
--matisa-orange: #ff9d2e;
--success: #38c779;
--danger: #ff4d5a;
```

Orange remains Matisa’s primary product action color. Cyan and blue create the reference atmosphere. Purple is mainly for voice, live, and karaoke states.

## Typography

The reference uses Publica Sans Round. Use it only if the project has a properly licensed local or web source. Otherwise select a legally available rounded geometric sans with a similar character.

The new hierarchy must be visible in layout, not only token definitions:

- screen title: 28 to 32 px
- major feature heading: 22 to 26 px
- section heading: 18 to 20 px
- card title: 16 to 18 px
- body: 15 to 16 px
- supporting text: 13 to 14 px
- metadata: 11 to 12 px

## Surfaces

Build one real glass system:

- semi-transparent blue-grey fill
- subtle one-pixel border
- restrained blur
- gentle inner highlight
- no thick outlines
- no excessive orange glow

## Shape system

Use:

- 14 px for compact controls
- 18 px for rows and inputs
- 22 px for standard cards
- 26 to 30 px for large media cards and sheets
- circular icon buttons
- capsule treatment only for tabs, status, and compact actions

---

# 6. Global shell reconstruction

## Top bar

Rebuild the existing top bar. Do not restyle it in place.

Home top bar must resemble the reference composition:

- compact circular menu or Matisa control at left
- Activity and Messages circular glass buttons at right
- no profile button in the top bar
- real unread dot only
- large enough top safe area
- background glow that fades into the page rather than a hard border

## Bottom navigation

Replace the existing bottom navigation markup.

Required destinations:

1. Home
2. Explore
3. Create
4. Rooms
5. Profile

Visual behavior:

- floating translucent glass dock
- sits above the device safe area
- rounded outer capsule
- selected destination gets a filled or luminous capsule
- labels remain visible
- all five items fit without clipping
- Create is centered and distinct, but not a giant floating orange button
- no continuous pulsing animation
- underlying content receives enough bottom padding

The bottom navigation must feel like the reference navigation, not the current five loose icons around a glowing circle.

---

# 7. Home screen reconstruction

Do not retain the current Home layout and merely recolor it.

## Required page composition

1. atmospheric top region
2. top bar
3. For You and Following selector
4. visual story rail
5. large primary content area
6. Note composer integrated naturally into the experience
7. feed content
8. occasional discovery modules

## Stories

Replace small generic circular story items with a more visual treatment inspired by the reference:

- rounded portrait tiles or larger story circles
- real image preview
- Your Story first
- clear viewed and unviewed state
- no fake online dot
- horizontally scrollable
- carefully cropped media

## Note composer

Rebuild the composer component rather than recoloring the current card.

It must have:

- glass container with large rounded corners
- avatar or profile initial
- large natural prompt
- circular Send control
- separated lower action row
- Note
- Voice Note
- Story
- Event

The component should look intentionally integrated into the reference design, with correct spacing and icon containers. It should not look like the old card with new colors.

## Feed

Create distinct layouts for:

- temporary text Note
- permanent text Note
- image Note
- video Note
- Voice Note
- event recommendation
- Voice Room
- Karaoke Room
- live session

Large image and video content should use immersive rounded media blocks like the reference.

Text-only Notes should remain clean and editorial. Do not place a decorative gradient panel beneath every Note.

Interaction controls should use translucent vertical or horizontal containers based on content type.

---

# 8. Explore reconstruction

The existing Explore page must be replaced with a discovery-first layout.

It should borrow the reference’s immersive discovery composition, not behave as a simple list of profiles.

Required elements:

- top profile or menu control
- centered Explore title
- circular search action
- featured live or event billboard
- mixed two-column discovery grid
- creator cards
- media cards
- Voice Room cards
- Karaoke Room cards
- upcoming events
- trending Notes
- suggested accounts

Use variable card sizes and visual rhythm. Do not make every result the same row height.

Search results may switch to a more structured list, but the default Explore view must remain visual.

---

# 9. Profile reconstruction

Delete the old gradient-header Profile composition.

Build the profile with:

- actual cover or banner image
- large overlapping avatar
- centered or carefully aligned identity block
- display name
- username
- verification
- real presence status only when available
- bio
- approximate location
- Follow, Message, and Voicemail actions
- Posts, Followers, and Following statistics
- content tabs

Tabs:

- Posts
- Voice
- Events
- Videos
- Saved

Remove Music.

Do not show nine fake gradient squares. Each tab must render real content or an honest empty state.

Use the reference profile image as the composition benchmark for balance, avatar scale, spacing, media grid, and action buttons.

---

# 10. Messaging reconstruction

Rebuild both inbox and chat layout based on the supplied messaging reference.

## Inbox

Required structure:

- atmospheric header
- title
- optional orbit or active-conversation visual only if data supports it
- Inbox, Unread, and Requests segmented control
- real conversation rows
- avatar
- real last-message preview
- real timestamp
- unread state
- new-message action

## Conversation

Required structure:

- recipient avatar, name, and presence state
- voice and video actions only when functional
- dark asymmetric message bubbles
- media cards
- custom Voice Note bubble with waveform
- fixed glass composer
- attachment action
- microphone
- Send

Do not use generated conversations, fake times, or fake online state.

---

# 11. Rooms and live reconstruction

Rooms must be visually immersive.

## Voice Room

Use the reference group-call screen as a layout benchmark:

- participant avatar grid or stage layout
- room timer or status
- active speaker emphasis
- clear microphone state
- bottom control bar
- raise hand
- mute
- leave
- host moderation

## Karaoke Room

Karaoke must not look like a normal list page.

Use a full-screen stage composition:

- current performer as the visual focus
- room title and live state
- audience avatars or count
- lyrics or song area when available
- singer queue
- reaction controls
- request to perform
- microphone state
- host controls
- leave action

## Live video

Rebuild into a full-screen video interface:

- edge-to-edge media
- translucent top controls
- host identity
- Live badge
- viewer count
- right-side reaction rail
- comments near bottom
- glass comment composer
- share
- follow
- leave or end

Do not open live content inside a small standard card.

---

# 12. Settings reconstruction

Use the reference settings composition:

- atmospheric upper header
- avatar and identity
- simple dark setting rows
- leading circular icon
- label
- trailing state or chevron
- clear section spacing
- restrained red Logout action

Do not wrap every setting inside a separate oversized card.

---

# 13. Exact file-level implementation direction

## Replace or radically rebuild

```text
src/App.tsx
src/main.tsx
src/index.css
src/components/layout/MainLayout.tsx
src/pages/Home.tsx
src/pages/Discovery.tsx
src/pages/Messages.tsx
src/pages/Chat.tsx
src/pages/Profile.tsx
src/pages/Events.tsx
src/pages/Activity.tsx
src/pages/Settings.tsx
src/pages/Onboarding.tsx
src/pages/Auth.tsx
```

## Reuse logic from where valid

```text
src/hooks
src/services
src/contexts
src/features/reactions
src/features/voicemail
src/lib
src/utils
```

## Create one new visual system

Suggested structure:

```text
src/design-system/
  tokens.css
  typography.css
  motion.ts
  primitives/

src/components/shell/
  AppShell.tsx
  TopNavigation.tsx
  BottomNavigation.tsx

src/components/content/
  StoryTile.tsx
  NoteCard.tsx
  VoiceNoteCard.tsx
  MediaNoteCard.tsx
  EventCard.tsx
  RoomCard.tsx

src/components/feedback/
  LoadingState.tsx
  EmptyState.tsx
  ErrorState.tsx

src/components/overlays/
  GlassSheet.tsx
  Dialog.tsx
  CreateMenu.tsx
```

Do not create another parallel set of duplicate buttons, avatars, cards, modals, and audio players.

---

# 14. Visual reconstruction workflow

For every major screen:

1. Open the matching reference image.
2. Describe its hierarchy and geometry in a short implementation note.
3. Identify which existing data and functions will power each visible section.
4. Build the new JSX structure from scratch.
5. Apply the new tokens and surfaces.
6. Capture a screenshot at 390 × 844.
7. Capture a screenshot at 430 × 932.
8. Compare the implementation against the reference for composition, not only color.
9. Fix visible structural differences.
10. Verify interactions and data states.

Do not mark a screen complete without screenshots.

---

# 15. Visual acceptance checklist

A screen passes only when:

- the old layout is no longer recognizable
- the page silhouette resembles the reference family
- header geometry has changed
- navigation geometry has changed
- content order matches the new design
- major cards have reference-like proportions
- spacing feels intentional and spacious
- media is the visual focus where appropriate
- cyan and blue glow create depth
- orange is used selectively
- typography has clear scale
- surfaces use restrained glass treatment
- controls align correctly with safe areas
- no content is hidden behind navigation
- there are no fake counts or placeholder actions
- loading, empty, and error states belong to the same system

## Automatic failure conditions

Reject the screen if:

- only CSS variables were changed
- old JSX structure remains almost unchanged
- the old card stack is still visible
- the old radial Create menu remains
- the old top profile button remains
- the old loose-icon bottom navigation remains
- Profile still uses a blank gradient banner
- Explore is still a plain list
- Live still opens as a normal card
- chat still uses generic unstyled bubbles
- fake gradient media placeholders remain

---

# 16. Credit-control rules

This is a large redesign, but work must still be controlled.

- Complete one screen family at a time.
- Do not scan backend folders unless the current screen needs a missing contract.
- Do not run the entire test suite after every visual change.
- Use targeted type checking, linting, and tests.
- Do not install a new UI framework.
- Do not rewrite working services.
- Do not redesign unrelated backend systems.
- Stop after the requested phase and report progress.

The goal is not fewer visual changes. The goal is fewer unrelated changes.

---

# 17. Required execution order

## Phase A. Architecture and shell

- reduce `src/App.tsx` to app bootstrap
- connect router
- activate routed pages
- build design tokens
- build AppShell
- rebuild top navigation
- rebuild bottom navigation
- verify safe areas

## Phase B. Home

- rebuild stories
- rebuild composer
- rebuild tabs
- rebuild feed variants
- integrate real data
- screenshot comparison

## Phase C. Explore

- rebuild discovery page
- billboard
- mixed grid
- creator and event discovery
- real search
- screenshot comparison

## Phase D. Profile and Settings

- banner
- avatar
- identity
- actions
- tabs
- voicemail
- settings rows
- screenshot comparison

## Phase E. Messages and Activity

- inbox
- requests
- conversation
- Voice Notes
- activity
- screenshot comparison

## Phase F. Rooms, Karaoke, Events, and Live

- Rooms discovery
- Voice Room
- Karaoke
- event discovery and detail
- Live interface
- screenshot comparison

## Phase G. Final visual and functional audit

- remove old components no longer referenced
- remove fake placeholders
- verify all routes
- verify all actions
- verify accessibility
- verify device sizes
- verify performance

---

# 18. First instruction for the IDE

Use this exact instruction:

```text
Read MATISA_VISUAL_REBUILD_DIRECTIVE_V2.md completely. The previous redesign is rejected because it only changed colors on the old UI. This task is a structural frontend reconstruction.

First inspect the reference HTML and every relevant image in:
C:\Users\PC\Documents\APPS\Matisa\Social Video Streaming Mobile App UI_UX __ Behance.html
C:\Users\PC\Documents\APPS\Matisa\Social Video Streaming Mobile App UI_UX __ Behance_files

Then inspect src/main.tsx, src/App.tsx, src/components/layout/MainLayout.tsx, and the routed page files.

Begin with Phase A only. Retire the monolithic active UI, connect a real routed application, and rebuild the top and bottom shell from new JSX. Do not merely modify colors or class names on the current markup.

Before coding, provide:
1. the exact old components being retired
2. the exact logic being preserved
3. the new route map
4. the new component tree
5. the files you will create or replace
6. the reference images you will use for the shell

After implementation, provide screenshots at 390 × 844 and 430 × 932. Do not call Phase A complete until the old top bar and bottom navigation are no longer recognizable.
```
