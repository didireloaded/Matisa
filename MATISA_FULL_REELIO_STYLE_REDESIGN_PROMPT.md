# MATISA FULL UI REDESIGN INSTRUCTION

## Objective

Redesign the entire Matisa frontend from the ground up using the Reelio social video streaming case study as the primary visual blueprint.

Do not preserve the current Matisa UI. The current layouts, component styling, card system, gradients, navigation treatment, spacing, and visual hierarchy may be discarded.

Preserve the product logic, routes, backend contracts, Supabase integration, authentication, content models, and working functionality wherever possible. Rebuild the presentation layer so the entire app feels like one coherent premium product.

The result must look intentionally designed, not like a generic AI-generated social app.

---

## Mandatory reference sources

Before changing any frontend code, inspect these local reference sources:

```text
C:\Users\PC\Documents\APPS\Matisa\Social Video Streaming Mobile App UI_UX __ Behance.html
```

```text
C:\Users\PC\Documents\APPS\Matisa\Social Video Streaming Mobile App UI_UX __ Behance_files
```

The HTML file and its image folder are the visual source of truth for the redesign.

Study the reference for:

- overall visual mood
- page hierarchy
- spacing
- typography
- colors
- glass surfaces
- background glow
- navigation
- profile presentation
- messaging
- discovery
- live video
- voice rooms
- story presentation
- content cards
- action buttons
- icon treatment
- animation character
- safe-area handling
- mobile proportions

Do not copy the Reelio logo, name, proprietary illustrations, or exact content. Replace all branding, copy, users, images, and product identity with Matisa.

Use the same design language and level of polish, but the finished app must clearly remain Matisa.

---

## Product identity

Matisa is not a standard Instagram clone and not only a video app.

Matisa is a social discovery and live participation platform built around:

- Notes
- Stories
- Voice Notes
- Voice Rooms
- Karaoke Rooms
- Live video
- Physical and virtual events
- Creator discovery
- Messaging
- Voicemail
- Profiles
- Following and recommendation feeds

Use Reelio for the visual language. Use the Matisa product specification and existing backend for the actual product behavior.

---

## Hard implementation rules

1. Read the project `AGENTS.md` and relevant Matisa frontend skill before editing.
2. Inspect the reference HTML and images before producing components.
3. Do not keep the old UI merely because components already exist.
4. Do not rewrite the backend unless a frontend requirement genuinely needs a backend contract change.
5. Reuse existing data services, hooks, Supabase queries, authentication, storage, and realtime code where valid.
6. Replace duplicate UI implementations with one consistent component system.
7. Do not leave fake buttons, fake counts, fake online states, placeholder success messages, or hardcoded activity.
8. Every visible interaction must work, be intentionally disabled with a clear explanation, or remain hidden.
9. Use route-based navigation. Do not control the whole app through one giant local `activeScreen` state.
10. Preserve deep links, browser history, Android back behavior, loading states, errors, and empty states.
11. Work phase by phase. Do not perform an uncontrolled rewrite of the entire repository in one pass.
12. After each phase, run only the checks relevant to the files changed.
13. Do not install dependencies unless the current stack cannot reasonably implement the required design.
14. Do not create a second design system beside the new one.
15. Do not extend features that are not part of the approved Matisa product.

---

# New visual direction

## General mood

The app should feel:

- premium
- cinematic
- immersive
- youthful
- modern
- social
- polished
- atmospheric
- fast
- creator-focused

Avoid:

- generic dashboard layouts
- excessive cards
- orange everywhere
- random gradients
- overuse of pills
- large empty spaces
- fake glassmorphism
- overdesigned empty states
- excessive shadows
- neon effects on every component
- cluttered headers
- tiny unreadable labels

---

## Color system

Use a dark blue-black foundation inspired by the reference.

Suggested starting tokens:

```css
--bg-deep: #030712;
--bg-primary: #06101D;
--bg-secondary: #0B1524;
--surface-1: rgba(19, 30, 45, 0.78);
--surface-2: rgba(27, 42, 59, 0.72);
--surface-3: rgba(255, 255, 255, 0.06);
--border-soft: rgba(255, 255, 255, 0.09);
--text-primary: #FFFFFF;
--text-secondary: #9090A1;
--text-muted: rgba(255, 255, 255, 0.48);
--glow-cyan: #24A3C7;
--glow-blue: #39B7F2;
--glow-purple: #6139F2;
--brand-orange: #FF9D2E;
--success: #35C67A;
--danger: #FF4D5A;
```

These values are a starting point, not an excuse to scatter colors everywhere.

Rules:

- Orange is the Matisa action color.
- Cyan and teal create atmosphere and background depth.
- Purple is reserved mainly for voice, karaoke, or live energy.
- Red is for destructive actions, live indicators, and urgent states.
- White is the main content color.
- Cool grey is used for secondary information.
- Background glows must be soft and local, never cover every screen.

---

## Typography

Use a clean rounded or geometric sans similar in character to the reference.

If the project already includes a suitable font, evaluate it before adding another.

Typography hierarchy:

```text
Display title: 32–40 px
Screen title: 26–32 px
Section title: 18–22 px
Card title: 16–18 px
Body: 15–17 px
Secondary text: 13–15 px
Caption: 11–13 px
```

Use medium and semibold weights carefully.

Avoid using a display font for every label. Screen titles should feel confident, while body copy remains quiet and readable.

---

## Surface and glass treatment

Use subtle glass surfaces like the reference:

- low-opacity dark surfaces
- light blur where supported
- very soft borders
- gentle internal highlights
- limited glow around selected or important elements
- rounded shapes with consistent radii

Suggested radii:

```text
Small controls: 12 px
Inputs and rows: 14–16 px
Cards: 18–22 px
Large media and sheets: 24–28 px
Pills and avatars: fully rounded
```

Do not place every row inside a separate floating card.

Use cards only where content grouping genuinely benefits from a surface.

---

## Motion

Motion should feel smooth and restrained.

Use:

- 150–220 ms transitions
- spring movement for sheets and create menus
- subtle scale or opacity feedback on press
- fluid tab transitions
- smooth story and feed movement
- controlled background glow animation only on live screens

Respect `prefers-reduced-motion`.

Do not use constant pulsing, floating, bouncing, or rotating decorative elements.

---

# Global app shell

## Top navigation

Remove the profile button from the Home header.

Home header:

- Matisa mark or compact menu control on the left
- Activity button on the right
- Messages button on the right
- real unread indicators only
- no fake count
- no profile shortcut

The header should use translucent circular controls similar to the reference.

## Bottom navigation

Use exactly:

1. Home
2. Explore
3. Create
4. Rooms
5. Profile

Requirements:

- all five items must remain visible
- correct iOS and Android safe-area padding
- labels visible unless usability testing proves icons alone are clear
- active state uses a restrained glowing or filled treatment
- Create may be visually stronger, but not oversized
- no clipped icons
- no hidden items
- no overlap with page content
- preserve tab scroll state

---

# Screen-by-screen redesign

## 1. Splash and authentication

Create a premium Matisa splash screen using the new navy, cyan, and orange system.

Authentication must include:

- Sign in
- Register
- OTP or magic-link state depending on current backend
- loading
- invalid link or OTP
- resend
- account setup
- guest behavior if currently supported

Do not show repeated sign-in calls inside Profile.

Once authenticated, the user should not continue seeing sign-in prompts.

---

## 2. Onboarding

Create a clean, visual onboarding flow:

1. Welcome to Matisa
2. Username and profile identity
3. Interest selection
4. Profile image
5. Suggested people
6. Enter Matisa

Voice introduction can be optional and added later from Profile.

The onboarding should feel like the reference’s clean dark screens, not a long form.

---

## 3. Home

Home is the most important screen.

Structure:

1. Top navigation
2. Story row
3. Large Note composer card
4. Quick content actions
5. For You and Following tabs
6. Main mixed feed
7. Relevant discovery inserts

### Story row

- Your Story first
- actual story media previews
- unseen and seen states
- visually rich rounded story tiles or circles inspired by the reference
- open full-screen story viewer

### Main composer

Use a premium dark glass card.

It should show:

- profile avatar or initial
- “What’s on your mind?”
- send action
- Note
- Voice Note
- Story
- Event

Pressing the main field opens Note creation.

### Note creation

Matisa works with Notes.

The user chooses one of two types:

#### Temporary Note

- expires after 24 hours
- maximum 200 characters
- show expiry clearly
- text-focused
- appears in the correct feeds while active

#### Permanent Note

- stays on the profile and feed
- maximum 1,000 characters
- can include text, image, or video where supported
- can be edited and deleted by the owner

The composer must show:

- content type
- character count
- audience
- media attachment where relevant
- posting state
- error and retry
- clear Send action

### Feed tabs

For You:

- recommendation-based
- uses interests, follows, interactions, freshness, quality, location context where permitted, and content diversity
- must not repeatedly show the same creator
- supports “Not interested”

Following:

- only content from followed accounts
- chronological or lightly ranked by freshness
- never created by slicing the For You array

### Feed content

Support real variants for:

- text Note
- image Note
- video Note
- Voice Note
- event recommendation
- public Voice Room
- Karaoke Room
- live session

Do not use decorative filler panels beneath simple text notes.

---

## 4. Explore

Explore is Matisa’s discovery engine.

Build it as a visually rich discovery surface inspired by the reference.

Include:

- search
- creators
- trending Notes
- live content
- Karaoke Rooms
- Voice Rooms
- upcoming events
- virtual events
- videos
- suggested accounts
- topics where useful

Use a mixed visual layout:

- larger feature cards
- compact creator tiles
- media grids
- horizontal discovery rows
- event cards
- live status treatments

Do not turn it into a generic list.

Search must actually search the content types shown in its placeholder and UI.

---

## 5. Create menu

Pressing Create opens a polished bottom sheet or expanded glass panel.

Options:

- Note
- Story
- Room
- Event
- Live

Selecting Room opens:

- Voice Room
- Karaoke Room

Do not use an overcomplicated glowing radial menu unless it remains highly usable.

---

## 6. Stories

Support:

- photo
- video
- text
- voice where backend allows

Viewer behavior:

- tap forward
- tap back
- hold to pause
- swipe down to close
- reply
- react
- report
- delete for owner
- view count for owner
- 24-hour expiry

The viewer must be immersive and full-screen.

---

## 7. Rooms

Rooms is a permanent bottom-navigation destination.

The main Rooms screen should show:

- Live Now
- Karaoke Rooms
- Voice Rooms
- Scheduled Rooms
- Private Invites
- Rooms from followed creators

### Voice Rooms

Allow users to create:

- public room
- private room
- invite-only room
- scheduled room
- immediate room

Settings:

- room name
- topic
- visibility
- participant capacity
- speaker capacity
- who may request to speak
- recording status if ever supported

Live room UI:

- host
- speakers
- listeners
- active speaker highlight
- mute
- raise hand
- request stage
- invite
- share
- participant list
- moderation
- leave room
- room chat only if supported

### Karaoke Rooms

Karaoke must be treated as a major system.

Support:

- public and private rooms
- room host
- audience mode
- singer mode
- song search
- singer queue
- queue position
- request to perform
- current performer
- next performer
- reactions
- room capacity
- moderation
- performance completion
- performance history where supported

Do not show fake listener counts, queue positions, hosts, or scores.

Build in stages if backend support is incomplete, but do not expose nonfunctional controls.

---

## 8. Events

Events may be physical or happen entirely inside Matisa.

Event sections:

- Discover Events
- My Events
- Hosting
- Going
- Interested
- Past Events

Users can create:

- physical event
- free virtual event
- paid virtual event
- talent show
- live music event
- hosted room event
- private event

Event creation fields:

- title
- description
- cover
- host
- date
- time
- location or virtual
- capacity
- price
- currency
- visibility
- access requirements
- room or live-session connection
- publish status

Paid events must use secure server-side access control.

Never unlock paid content based only on frontend state.

Event pages must include:

- event media
- title
- date and time
- host
- location or online status
- real price
- capacity
- attendee state
- RSVP or purchase
- share
- add to calendar
- directions for physical events
- join action for active virtual events

---

## 9. Live video

Live video screens should be highly immersive and inspired by the Reelio full-screen live treatment.

Include:

- live indicator
- real viewer count
- host
- comments
- reactions
- share
- follow
- camera switching for host
- microphone
- moderation
- leave or end
- audience permissions
- replay state only where supported

Do not make live video look like an ordinary feed card after it is opened.

---

## 10. Messages

Redesign the inbox and conversation UI using the reference’s clean dark messaging direction.

Inbox:

- search
- inbox
- unread
- requests
- real last message
- real timestamp
- unread state
- message composition
- no generated fake conversations

Conversation:

- text
- images
- Voice Notes
- replies
- reactions where supported
- typing
- read state where supported
- report
- block
- conversation details

Use one reusable audio player across messages, Voice Notes, voicemail, and profile voice content.

---

## 11. Activity

Activity should show real:

- follows
- reactions
- replies
- story interactions
- room invites
- event invites
- message-related activity where appropriate
- system notices

Support:

- unread state
- grouped notifications
- deep links
- mark read
- real badge count

---

## 12. Profile

Profile redesign:

- real banner image
- avatar overlapping banner
- display name
- username
- verification
- approximate current location when permitted
- bio
- availability or creator status
- posts count
- followers
- following

Owner actions:

- Edit Profile
- Settings

Visitor actions:

- Follow
- Message
- Voicemail
- More

Tabs:

- Posts
- Voice
- Events
- Videos
- Saved

Remove Music.

### Posts

Show real image and text content. Do not display fake gradient placeholders.

### Voice

Show Voice Notes, voice introduction, and related audio content.

### Events

Show hosted, upcoming, and past events where privacy allows.

### Videos

Show video Notes and live replays where supported.

### Saved

Private to the owner.

### Voicemail

Voicemail is a fun but real feature.

A visitor can leave a voicemail when permitted.

Support:

- record
- timer
- preview
- delete and record again
- upload progress
- send
- inbox
- sender
- timestamp
- duration
- unread state
- delete
- report
- block

Remove repeated “Sign in to use voicemail” messaging after authentication.

---

## 13. Settings

Redesign Settings in the new visual system.

Include only real settings:

- account
- profile
- privacy
- message permissions
- voicemail permissions
- story privacy
- room privacy
- blocked users
- muted users
- notifications
- data saver
- accessibility
- help
- terms
- privacy policy
- log out
- delete account

Do not display a Dark Mode toggle if the app only supports dark mode.

---

# Component system

Create one consistent reusable component system.

At minimum:

- AppShell
- TopBar
- BottomNavigation
- IconButton
- PrimaryButton
- SecondaryButton
- GlassSurface
- Avatar
- UserRow
- StoryTile
- NoteCard
- VoiceNoteCard
- VideoCard
- EventCard
- RoomCard
- LiveBadge
- CountBadge
- Tabs
- SearchField
- TextInput
- TextArea
- BottomSheet
- Dialog
- EmptyState
- ErrorState
- LoadingSkeleton
- Toast
- MediaUploader
- AudioRecorder
- AudioPlayer
- ProfileBanner
- StatRow

Do not keep parallel versions of the same primitive.

---

# Functional quality requirements

Every screen must include:

- loading state
- empty state
- error state
- retry
- offline behavior where appropriate
- authentication requirements
- permissions state
- success feedback
- disabled state
- mobile keyboard handling
- safe areas
- accessibility labels
- minimum touch targets
- reduced-motion handling

Remove:

- `user-scalable=no`
- global `user-select: none`
- low-contrast text
- fake online indicators
- hardcoded counts
- hardcoded event prices
- nonfunctional action buttons
- placeholder developer copy
- random gradients used as fake content

---

# Data and backend boundary

Do not change backend structures merely to make the UI easier.

First inspect existing:

- Supabase tables
- services
- hooks
- routes
- storage
- Edge Functions
- realtime channels
- authentication
- message models
- event models
- room models
- note models
- profile models

Where frontend data is missing:

1. identify the exact contract needed
2. reuse existing services if possible
3. create the smallest safe backend addition
4. apply RLS and authorization
5. avoid duplicate tables and RPCs
6. do not expose secrets
7. do not simulate success

---

# Execution plan

Do not rebuild everything in one uncontrolled pass.

## Phase 0

- inspect reference HTML and image folder
- inspect the project entry point and routes
- identify the active frontend
- inventory reusable logic
- define new design tokens
- choose one active component architecture
- remove duplicate shell routing

## Phase 1

- AppShell
- top navigation
- bottom navigation
- safe areas
- routing
- shared buttons, surfaces, typography, inputs, sheets

## Phase 2

- authentication
- onboarding
- profile shell
- Settings

## Phase 3

- Home
- Note creation
- For You
- Following
- story row
- feed cards

## Phase 4

- Explore
- global search
- creator discovery
- event and room discovery

## Phase 5

- Stories
- media creation
- media viewing

## Phase 6

- Messages
- conversation
- Voice Notes
- Activity

## Phase 7

- Rooms
- Voice Rooms
- live participant experience

## Phase 8

- Karaoke
- queue
- performer
- audience
- host controls

## Phase 9

- Events
- virtual events
- paid access
- live event entry

## Phase 10

- polish
- accessibility
- responsive behavior
- performance
- final removal of fake data and dead controls

At the end of each phase:

- list changed files
- list completed behaviors
- list remaining backend dependencies
- run targeted type checking, linting, and tests
- stop before continuing unless the user explicitly requested uninterrupted execution

---

# Final quality bar

The redesign is complete only when:

- the old Matisa UI is no longer visible
- the entire app follows the new visual system
- the app feels cohesive across every screen
- all primary navigation is visible
- every major action works
- temporary and permanent Notes behave correctly
- For You and Following are distinct
- Explore is a real discovery surface
- Voice Rooms work
- Karaoke is treated as a complete system
- physical and virtual Events work
- Profile content is real
- messaging uses real conversation data
- voicemail works
- no fake counts or fake activity remain
- mobile safe areas work
- the app passes relevant frontend checks
- branding says Matisa everywhere
- no Reelio branding or assets remain
- the product looks inspired by the reference but belongs to Matisa

---

## First instruction to execute

Begin with Phase 0 only.

Read:

```text
C:\Users\PC\Documents\APPS\Matisa\Social Video Streaming Mobile App UI_UX __ Behance.html
```

and inspect:

```text
C:\Users\PC\Documents\APPS\Matisa\Social Video Streaming Mobile App UI_UX __ Behance_files
```

Then inspect the Matisa project entry point, active routes, current design system, shared components, and frontend service boundaries.

Report:

1. which frontend is actually active
2. which existing functionality can be preserved
3. which UI files should be replaced
4. which shared components should be created
5. the proposed design tokens
6. the exact Phase 1 file plan

Do not begin Phase 1 until the Phase 0 report is complete.
