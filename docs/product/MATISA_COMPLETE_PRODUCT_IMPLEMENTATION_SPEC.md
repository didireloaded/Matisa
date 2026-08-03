# Matisa Complete Product Implementation Specification

## Document authority

This document is the authoritative product and implementation specification for the current Matisa application.

Before making a broad Matisa product change, the coding agent must read this document. For a small focused task, search this document for the relevant screen or feature and read only that section. Do not reread the entire file for a one-component change.

This document overrides older product descriptions where they conflict with the decisions below. It does not override security rules, migration safety rules, or the surgical scope rules in `AGENTS.md` and the project skills.

---

# 1. Master instruction for the coding IDE

Act as a senior mobile product engineer, React engineer, Supabase architect, realtime systems engineer, security engineer, and QA owner working inside the existing Matisa repository.

Do not rebuild Matisa as a new generic social application. Preserve the current dark premium mobile-first interface and improve the existing screens. The objective is to make every visible interaction real, connected, understandable, responsive, accessible, and safe.

Work in controlled vertical slices. Do not attempt the whole product in one uncontrolled change. For each slice:

1. Confirm the active rendered source and route.
2. Search for existing components, hooks, services, database tables, RPCs, and Edge Functions before creating anything.
3. Define the complete user journey and failure states.
4. Implement the narrowest complete path from UI to source of truth.
5. Remove fake data and dead interactions only within the affected slice.
6. Add focused tests.
7. Run the narrowest useful verification first, then the required broader checks for the completed slice.
8. Stop when the approved slice is complete.

Never present mock counts, random attendees, fake online indicators, pretend rooms, hardcoded messages, empty click handlers, or success states that were not persisted.

The required feature flow is:

```text
UI component
→ feature hook or state controller
→ service or repository
→ Supabase table, RPC, Edge Function, Storage, Realtime, LiveKit, or payment provider
→ observable success or clear failure state
```

Do not put privileged business logic in React components.

---

# 2. Product definition

Matisa is a mobile-first social platform centred on short thoughts, voice, people, live rooms, karaoke, local discovery, and events.

The product should feel social and alive without copying Instagram screen for screen. Its main content language is **Notes**, not Instagram-style text posts.

The core reasons to open Matisa are:

- See relevant Notes and media from people and creators.
- Discover new creators, conversations, rooms, and events.
- Share a temporary or permanent Note.
- Join or create karaoke rooms and live voice rooms.
- Create, discover, host, and attend physical or in-app events.
- Communicate through messages, voice content, and playful voicemail.

Matisa is not currently an internal-wallet product. Paid events must use an external payment flow and event access entitlements. Do not introduce a general wallet, gifting economy, coins, or cash balance as part of this specification.

---

# 3. Locked product decisions

These decisions are not optional during implementation unless the product owner changes them explicitly.

## 3.1 Top navigation

The top navigation contains:

- Matisa logo or Home action.
- Messages button.
- Activity or notifications button.

Remove the profile button from the top navigation. Profile already exists in the bottom navigation and should not be duplicated at the top.

The message and activity indicators must come from real unread counts. Hide a badge when its count is zero.

## 3.2 Bottom navigation

The permanent bottom navigation contains exactly five positions:

1. Home
2. Explore
3. Create
4. Rooms
5. Profile

The centre Create action may remain visually elevated.

The fourth item must be called **Rooms**, not only Karaoke, because it opens both:

- Karaoke rooms
- Voice rooms

All five navigation items must remain fully visible on supported phones. Labels and icons must not be clipped, hidden behind the home indicator, or pushed outside the viewport.

## 3.3 Create menu

Tapping the centre Create button opens these actions:

- Note
- Story
- Room
- Event
- Live

Room opens a choice between Karaoke Room and Voice Room.

Do not add unrelated actions to the top-level create menu.

## 3.4 Content terminology

Use these product terms consistently:

- **Note** means text-first social content.
- **Story** means temporary visual or voice content shown in the story experience.
- **Photo** means an image attached to a permanent Note and shown in the profile Posts grid.
- **Video** means a video attached to a permanent Note, created as eligible saved media, or retained from an authorised live replay.
- **Room** means either a Karaoke Room or Voice Room.
- **Live** means a live video broadcast, separate from audio rooms.

Do not label text Notes as Posts in the interface.

## 3.5 Note lifetimes and limits

The Note composer must ask the user to choose one of two lifetimes:

### 24-hour Note

- Maximum 200 characters.
- Expires 24 hours after successful publication.
- Server sets `expires_at`.
- Excluded from all feeds and discovery after expiry.
- Direct links show an honest expired state after expiry.

### Permanent Note

- Maximum 1,000 characters.
- Remains until the owner deletes it or moderation removes it.
- May optionally contain one supported image or one supported video.
- Image-bearing permanent Notes can populate the profile Posts grid.
- Video-bearing permanent Notes can populate the profile Videos tab.

The UI must never call the permanent option a “post.” Present it as **Permanent Note**.

## 3.6 Profile tabs

The main profile content tabs are:

- Posts
- Voice
- Events
- Videos
- Saved

Remove Music.

The Posts tab is for real image content, not placeholder gradients. Saved is private and visible only to the profile owner.

## 3.7 Authentication presentation

Show one clear **Sign In** action when the user is signed out.

Do not repeat “click to continue,” email forms, or voicemail sign-in prompts across the same profile screen. After successful authentication, the Sign In action disappears.

---

# 4. Current repository reality

The repository currently contains two competing frontend systems:

- A monolithic active implementation inside `src/App.tsx`.
- A larger page and component architecture under `src/pages`, `src/components`, hooks, contexts, stores, and services.

`src/main.tsx` currently renders `src/App.tsx` directly.

The implementation must converge on one authoritative routed application. Do not keep two independently maintained Home screens, Profile screens, composers, room systems, or navigation systems.

## Required architecture direction

- Use React Router for actual screen navigation and deep links.
- Use the existing page and feature structure where it is sound.
- Move or adapt the strongest current visual implementation into reusable components instead of redesigning the app.
- Remove or archive superseded duplicate components only after all active consumers have moved.
- Use TanStack Query for server state and caching.
- Use Zustand only for genuine cross-screen client state such as active media playback, transient room state, or UI preferences.
- Keep Supabase as the source of truth for social and business data.
- Use LiveKit as the audio or live transport, not as the source of truth for room membership, queues, access, event tickets, or payment state.

## Route direction

The routed application should support at least:

```text
/
/explore
/create/note
/create/story
/create/room
/create/event
/create/live
/rooms
/rooms/karaoke/:roomId
/rooms/voice/:roomId
/events
/events/:eventId
/messages
/messages/:conversationId
/activity
/profile/:username
/settings
/auth
/onboarding
```

Modal routes may be used where appropriate, but deep links and browser or Android back behaviour must remain correct.

---

# 5. Visual direction

Keep the current Matisa identity:

- Near-black background.
- Orange primary accent.
- Restrained purple for voice and karaoke.
- Syne or the current display typeface for selected large headings.
- Rounded mobile surfaces.
- Circular avatars and story rings.
- Compact dark bottom sheets and modals.
- Warm, premium contrast rather than a generic grey dashboard.

## Improve without redesigning

- Preserve the existing shapes and overall visual language.
- Reduce unnecessary glows and decorative gradients.
- Do not introduce a new font or new accent colour for one feature.
- Use real content instead of gradient placeholders.
- Use cards only where grouping adds meaning.
- Keep secondary text readable. Avoid extremely low-opacity white text.
- Maintain a consistent radius, spacing, and type scale.
- Make every tap target at least 44 by 44 CSS pixels.
- Apply safe-area padding at the top and bottom.
- Respect reduced-motion preferences.
- Do not disable browser zoom or global text selection.

Suggested radius system:

- 12 px for inputs and small controls.
- 16 px for rows and compact cards.
- 20 px for Notes and regular content cards.
- 24 px for event cards, room cards, and bottom sheets.
- Fully round for avatars, pills, and the centre Create button.

---

# 6. Home screen

Home is Matisa’s strongest first impression. It must feel active, personal, and immediately understandable.

## 6.1 Header

Display:

- Logo on the left.
- Messages on the right.
- Activity on the right.

Do not display the profile icon in the top header.

## 6.2 Primary composer card

Keep the large dark composer card inspired by the approved reference.

It contains:

- Current user avatar or generated initial.
- Prompt such as “What’s on your mind?”
- Send or open-composer action.
- Quick actions for Note, Voice Note, Story, and Event.

The entire prompt row opens the Note composer. Each quick action opens the same authoritative creation flow used by the centre Create menu. Do not maintain separate implementations.

Guest behaviour:

- A guest may see the composer.
- Tapping a creation action opens the single authentication flow.
- After authentication, return to the intended creation flow.

## 6.3 Stories

Display current stories in a horizontal row using real story data.

- Unseen stories use the active Matisa ring.
- Seen stories use a muted ring.
- The current user gets an Add Story entry.
- Do not add fake online indicators to every avatar.

## 6.4 Karaoke and room feature entry

Home should visibly communicate that live rooms are a major Matisa feature.

Use one prominent but controlled card or module that can show:

- A real live Karaoke Room.
- A real live Voice Room.
- A clear Start a Room action when nothing relevant is live.

Do not show fake listener totals or randomly generated hosts.

## 6.5 Feed tabs

Home includes:

- For You
- Following

The selected tab must persist while navigating away and returning.

## 6.6 For You feed

For You is a mixed personalised feed. Eligible content may include:

- Unexpired 24-hour Notes.
- Permanent Notes.
- Image and video Notes.
- Voice Notes.
- Relevant public events.
- Relevant public live rooms.
- Creator recommendations inserted at controlled intervals.

Do not place recommendation sections before the user sees meaningful content.

## 6.7 Following feed

Following contains content from accounts the user follows.

- Do not implement it by slicing or reusing half of the For You array.
- Default to reverse chronological order with only light quality and freshness adjustments.
- Exclude blocked, muted, deleted, moderated, private, and expired content.
- Include a useful empty state with suggested accounts when the user follows nobody.

## 6.8 Trending conversations

A Trending Conversations section may appear on Home when there are real conversation candidates.

A conversation becomes eligible through genuine signals such as:

- Distinct participants.
- Replies or voice responses.
- Recent velocity.
- Saves or shares.
- Content quality and safety status.

When empty, show the approved restrained empty state and **Ask a Question** action. The action opens a Note composer configured for a conversation-starting Note. It must not publish until the user confirms.

## 6.9 Home states

Provide:

- Initial skeleton.
- Pull to refresh.
- Pagination loader.
- Recoverable error with Retry.
- Offline banner with cached content where possible.
- Honest empty state.
- “New Notes” button for realtime arrivals instead of jumping the scroll position.

---

# 7. Note creation and Note behaviour

## 7.1 Composer flow

The Note composer opens as a full-height bottom sheet or focused mobile screen using the current Matisa styling.

Required controls:

1. Author identity.
2. Lifetime selector:
   - 24 Hours
   - Permanent
3. Text editor.
4. Dynamic character counter.
5. Optional media attachment for Permanent Notes only.
6. Audience selector if privacy is supported.
7. Send Note button.

## 7.2 Character limits

- Selecting 24 Hours sets the limit to 200.
- Selecting Permanent sets the limit to 1,000.
- Switching from Permanent to 24 Hours while over 200 must not silently truncate text.
- Show a clear validation message and disable Send until corrected.
- Validate on both client and server.

## 7.3 Media

Permanent Notes may optionally contain:

- One image, or
- One video within the approved duration and file-size limits.

Temporary Notes remain text-first unless the product owner later approves temporary media Notes separately from Stories.

Before upload:

- Validate MIME type and extension.
- Compress images.
- Generate safe filenames and storage paths.
- Show upload progress.
- Allow cancel and retry.
- Do not claim publication until media and Note records are successfully committed.

## 7.4 Publication

Use an atomic server path or safe ordered transaction so a Note is not left pointing to failed media.

Required data includes:

```text
id
user_id
body
lifespan: temporary_24h | permanent
media_type: none | image | video
media_path
created_at
updated_at
edited_at
expires_at
visibility
moderation_status
reply_count
reaction_count
save_count
```

Counts may be computed or maintained through a verified consistency strategy. Do not let the client invent them.

## 7.5 Feed card

A Note card includes only information that is real:

- Author avatar, name, username, and verification state.
- Relative publication time.
- Temporary indicator and time remaining where useful.
- Text.
- Media when present.
- Reaction, reply, save, share, and More actions when implemented.

Do not place a decorative “Matisa pulse” panel below every text Note.

## 7.6 Actions

Each visible action must work:

- React.
- Reply.
- Save.
- Share.
- Copy link.
- Hide.
- Mute author.
- Report.
- Edit for owner.
- Delete for owner.

Do not show disabled Fire or Laugh buttons as if they are available. Either implement the approved reaction set or show only the working reaction action.

## 7.7 Expiry

Expired 24-hour Notes must:

- Disappear from normal feeds and Explore.
- Be rejected by new reaction, reply, save, or share mutations.
- Return an expired state on direct access.
- Remain available only to authorised internal moderation and retention processes.

Do not rely only on a client timer. Enforce expiry in queries and server operations.

---

# 8. Stories

Stories are immediate temporary content similar in interaction expectations to familiar social story experiences, while preserving Matisa’s visual identity.

Supported story forms may include:

- Photo.
- Short video.
- Text story.
- Voice story.

A published Story appears in the story row immediately and expires after 24 hours.

## Story creation

- Choose or capture media.
- Preview before publishing.
- Add optional text.
- Select audience where supported.
- Show upload progress.
- Publish only after successful storage and database writes.

## Story viewer

Support:

- Tap right to advance.
- Tap left to go back.
- Hold to pause.
- Swipe down or Back to close.
- Progress bars synced to media duration.
- Reply through Messages.
- Lightweight reaction.
- Owner view count.
- Delete for owner.
- Report and mute for viewers.

Do not present an event or room Join action unless the attached event or room still exists and the user has permission.

---

# 9. Explore

Explore is Matisa’s discovery engine. It should feel closer to the purpose of Instagram Explore, meaning users come here to find content and people beyond their current follows.

Explore is not a directory dashboard full of unrelated cards.

## 9.1 Explore content

Eligible discovery content includes:

- New and rising creators.
- Permanent Notes.
- High-quality unexpired temporary Notes.
- Photos and videos.
- Voice content.
- Public Stories where discovery is permitted.
- Public Karaoke and Voice Rooms.
- Upcoming public events.
- Paid virtual events.
- Trending conversations.

## 9.2 Layout

Preserve the current Matisa design while introducing a content-led discovery structure:

- Search at the top.
- A controlled mix of media tiles, Note previews, creator cards, room cards, and event cards.
- Full-width sections only when they add value.
- Avoid turning Explore into many stacked dashboard cards.

A media-led responsive grid is appropriate for photos and videos. Text, voice, rooms, creators, and events should use card forms that suit their content.

## 9.3 Search

The search promise must match the result set.

Search may include:

- People.
- Notes.
- Photos and videos.
- Events.
- Rooms.
- Topics.

Use debouncing, pagination, recent searches, clear states, and safe highlighting.

## 9.4 Discovery filters

Use a small set of clear filters such as:

- For You
- Creators
- Notes
- Rooms
- Events
- Nearby

Nearby must use approximate location and explicit permission. Do not expose exact user coordinates.

## 9.5 Recommendation explanations

Where useful, show one non-creepy reason:

- “Because you follow…”
- “Popular near Windhoek”
- “Matches your film interests”
- “Friends are attending”

Do not expose private behavioural details or claim AI certainty.

---

# 10. For You recommendation system

Start with a deterministic, inspectable ranking system. Do not depend on a vague AI call as the primary feed algorithm.

## 10.1 Candidate generation

Generate candidates from bounded sources:

- Followed and second-degree creators.
- Interest-matched Notes and media.
- Local or regionally relevant public content.
- Real trending conversations.
- Upcoming events.
- Live public rooms.
- Controlled exploration candidates from new creators.

## 10.2 Hard filters

Remove candidates that are:

- Expired.
- Deleted.
- Moderation-blocked.
- From blocked or muted accounts.
- Inaccessible due to privacy.
- Already overexposed to the user.
- Unsafe for the account’s age or settings.
- Duplicate media or repeated shares of the same item.

## 10.3 Suggested scoring model

Use normalised signals. Initial weights can be tuned through analytics but must be documented.

```text
30% relationship and interaction affinity
20% freshness and recency
15% content quality and meaningful engagement
10% interest match
10% local or regional relevance
10% creator and content diversity
5% controlled exploration
```

Apply penalties for:

- Repetition from the same creator.
- Low-quality engagement bait.
- High hide or report rate.
- Content already seen recently.
- Excessive similarity to adjacent feed items.

## 10.4 Quality signals

Prefer:

- Distinct meaningful replies.
- Saves.
- Shares.
- Completion or dwell signals appropriate to content type.
- Return engagement.
- Healthy conversation diversity.

Do not rank only by raw likes.

## 10.5 Diversity rules

- Do not allow one creator to dominate consecutive positions.
- Mix content types without making the feed random.
- Reserve a small controlled percentage for emerging creators.
- Avoid repeatedly showing the same event or room.

## 10.6 Pagination

Use cursor pagination based on stable ranking inputs or a generated feed session. Do not use fragile offset pagination for a changing personalised feed.

## 10.7 Analytics and feedback

Track privacy-respecting events such as impression, open, meaningful dwell, reaction, reply, save, share, hide, not interested, follow, and report.

Allow users to choose:

- Not interested.
- Show less like this.
- Mute creator.

These signals must affect future ranking.

---

# 11. Following feed

Following is a trustable feed of accounts the user intentionally follows.

Required behaviour:

- Query only content from currently followed accounts.
- Include the user’s own content where appropriate.
- Exclude expired, blocked, muted, private-inaccessible, and moderated content.
- Use reverse chronological ordering as the primary rule.
- Use cursor pagination.
- Subscribe to new eligible content and show a New Notes button.
- Preserve scroll position when switching tabs.

Do not inject unrelated recommended creators into the middle of Following. Suggestions belong in the empty state or at the end.

---

# 12. Rooms hub

The fourth bottom navigation item opens a unified Rooms hub.

## 12.1 Main tabs

- Karaoke
- Voice Rooms

Optional secondary filters:

- Live Now
- Starting Soon
- Your Rooms

## 12.2 Room card

A room card displays real values:

- Room name.
- Type.
- Host.
- Public or private state where relevant.
- Live or scheduled status.
- Current participant count.
- Capacity.
- Friends inside only when real.
- Join or Request Access action.

## 12.3 Create Room flow

Room creation asks:

1. Karaoke Room or Voice Room.
2. Room name.
3. Optional description or topic.
4. Start now or schedule.
5. Public or Private.
6. Maximum participant capacity.
7. Speaker or singer rules.
8. Recording state, default off.

Private means invite-only. It does not mean a room that appears publicly but rejects strangers later.

Validate capacity server-side.

## 12.4 Room access

Before joining:

- Verify room exists and is active or ready.
- Verify visibility and invitation.
- Verify capacity atomically.
- Verify the user is not banned.
- Create or confirm Supabase room membership.
- Issue a short-lived LiveKit token from a trusted Edge Function.

Do not issue host or speaker permissions based only on a client-provided role.

---

# 13. Karaoke rooms

Karaoke is a major Matisa system and must be built as a real room workflow rather than a decorated mock screen.

## 13.1 Roles

- Host
- Co-host where supported
- Current singer
- Queued singer
- Listener

## 13.2 Join flow

Users choose:

- Join as Listener
- Request to Sing

Request to Sing places the user in a server-authoritative queue. It does not immediately grant microphone publishing.

## 13.3 Queue

The queue must support:

- Atomic join.
- One active queue entry per user per room.
- Position updates through realtime.
- User leaving the queue.
- Host removing or skipping an entry.
- Promotion of the next singer.
- Recovery when the current singer disconnects.
- Clear “You’re next” state.

Supabase owns the queue. LiveKit does not.

## 13.4 Song selection

Do not ship scraped or unlicensed commercial lyrics or tracks.

Use a provider-neutral licensed catalogue adapter. Until a provider is configured, support only approved royalty-free, user-owned, or platform-cleared audio.

A selection stores:

- Provider track identifier.
- Display title and artist.
- Duration.
- Rights or availability metadata.
- Queue entry association.

## 13.5 Performance state

The room state moves through:

```text
waiting
→ singer_preparing
→ performing
→ performance_complete
→ next_singer
```

Only authorised host operations can advance or override performance state.

## 13.6 Live experience

Display:

- Current singer.
- Host.
- Song title where permitted.
- Queue position for the current user.
- Audience count.
- Reactions.
- Mute and audio controls.
- Leave Room.

If synchronised lyrics are licensed, sync them to provider timing. Otherwise do not show placeholder lyrics.

## 13.7 Reactions and scoring

Realtime reactions may be transient and rate-limited.

Do not present a mysterious “Fire Score” as an objective talent score. If audience energy is shown, clearly describe it as live audience reaction.

Any post-performance rating must:

- Be limited to completed performances.
- Prevent duplicate votes.
- Resist self-voting and manipulation.
- Require a minimum sample before public display.

## 13.8 Moderation

Hosts need controls to:

- Mute or revoke speaker access.
- Remove a participant.
- Ban from the room.
- Skip the current singer.
- Remove queue entries.
- End the room.

Participants need Report and Block.

---

# 14. Voice rooms

Voice Rooms are live audio conversations rather than performances.

## Roles

- Host
- Co-host
- Speaker
- Listener

## Required behaviour

- Listener joins without publishing microphone audio.
- Listener can raise hand.
- Host sees the request queue.
- Host promotes a listener to speaker.
- Speaker can mute and unmute.
- Host can return a speaker to the audience.
- Participant state updates in realtime.
- Room remains usable while the user browses through a compact floating audio bar where technically supported.

## Privacy

- Public rooms are discoverable.
- Private rooms require invitations.
- Capacity is enforced before token issuance.
- Recording is off by default and requires visible consent and a persistent indicator.

---

# 15. Events

Events include physical events and events that happen entirely inside Matisa.

## 15.1 Events screen

Use two primary sections or tabs:

- Discover Events
- Your Events

Your Events should distinguish where helpful:

- Hosting
- Going
- Interested
- Past

## 15.2 Event types

Support:

- Physical event
- Virtual Matisa event
- Hybrid event where approved

A virtual Matisa event can be a talent show, live performance, discussion, workshop, or other hosted experience that users attend inside the app.

## 15.3 Event access models

Support:

- Free public
- Free private or invite-only
- Paid public
- Paid private or invite-only

Do not hardcode every event as Free or Social.

## 15.4 Create Event flow

Required fields and steps:

1. Event title.
2. Description.
3. Cover image.
4. Physical, virtual, or hybrid.
5. Start and end time.
6. Location or Matisa virtual venue.
7. Public or private.
8. Capacity.
9. Free or paid.
10. Price and currency for paid events.
11. Host and optional co-hosts.
12. Draft preview.
13. Publish confirmation.

Save drafts. Validate server-side before publication.

## 15.5 Paid virtual events

Use an external payment provider through a provider-neutral server adapter.

Do not build a general Matisa wallet for event access.

Required payment flow:

1. Authenticated user taps Buy Access.
2. Server verifies event state, price, capacity, and existing entitlement.
3. Server creates a checkout session with an idempotency key.
4. User completes provider checkout.
5. Provider webhook is verified server-side.
6. Server records payment and creates the event access entitlement.
7. User receives a ticket or access state.
8. Join Event checks the entitlement server-side.

Never unlock a paid event based only on a browser redirect or query parameter.

Required records may include:

```text
events
event_hosts
event_attendance
event_invitations
event_access_entitlements
payments
payment_webhook_events
event_bans
event_room_sessions
```

## 15.6 Cancellations and refunds

- Host cancellation changes the event status and prevents joining.
- Notify attendees.
- Use documented provider refund behaviour.
- Never promise an automatic refund unless the provider operation succeeded.
- Keep an audit trail.

## 15.7 Virtual event room

A virtual event is not automatically the same as a casual Voice Room.

It may use:

- Live video broadcast.
- Voice stage.
- Karaoke or performance stage.
- Moderated audience chat.

The event record owns schedule, access, payment, capacity, and attendance. LiveKit or another provider transports the media session.

## 15.8 Event card and detail

Cards display real:

- Cover.
- Title.
- Date and time.
- Physical or Virtual label.
- Location or In Matisa.
- Host.
- Price or Free.
- Attendance.
- Friends attending when real.

Event detail includes:

- Full overview.
- Host and co-hosts.
- Date, time, timezone, and location.
- Price and access state.
- Capacity state.
- Going or Interested action.
- Buy Access or Join Event when appropriate.
- Share.
- Add to Calendar.
- Report.
- Cancellation state.

---

# 16. Live video

Live is separate from audio Rooms.

## Create Live flow

- Title.
- Optional category.
- Audience: Public, Followers, or Private where supported.
- Camera preview.
- Microphone test.
- Front or rear camera choice.
- Clear Go Live confirmation.

## Live session

Required controls:

- Viewer count from real session state.
- Camera switch.
- Mute microphone.
- End Live.
- Moderated comments where enabled.
- Rate-limited reactions.
- Participant block and removal tools.
- Persistent live state.

Replay is optional and only created when enabled, permitted, and successfully stored. Never show a replay card for a session that was not recorded.

---

# 17. Messages

Keep Messages in the top navigation and provide a real conversations system.

## Conversation list

Show:

- Actual participant.
- Real last-message preview.
- Real timestamp.
- Real unread state.
- Message type preview for text, image, voice, event, room, or Note share.

Do not generate conversations from random profiles.

## Conversation screen

Support in phases:

1. Text messages.
2. Shared Notes, profiles, rooms, and events.
3. Voice messages.
4. Images.
5. Replies and reactions.

Required baseline:

- Cursor pagination.
- Optimistic send with failure retry.
- Delivery and read state where implemented.
- Realtime arrival.
- Message requests from unknown accounts.
- Block and Report.
- Safe media upload.
- Correct keyboard and safe-area behaviour.

---

# 18. Activity

Activity displays real notification events such as:

- New follower.
- Reaction.
- Reply.
- Story reply or reaction.
- Message request.
- Room invitation.
- Event invitation.
- Event purchase or access confirmation.
- Event reminder.
- Host or moderation action where appropriate.

Use grouping to avoid notification spam. Mark read state accurately. A badge count must match unread records.

Each notification opens the exact relevant destination and handles deleted, expired, ended, or inaccessible content gracefully.

---

# 19. Profile

The Profile screen remains visually close to the current approved design but becomes fully functional.

## 19.1 Header and banner

Replace the blank gradient header with a real user-selected banner image.

Owner behaviour:

- Upload.
- Crop.
- Reposition.
- Replace.
- Remove.

Viewer behaviour:

- Display the banner with a tasteful fallback when none exists.
- Do not use random decorative gradients pretending to be content.

## 19.2 Identity

Display:

- Avatar.
- Display name.
- Username.
- Verification state when real.
- Bio.
- Current city or approximate location.
- Availability or mood only when the user set it.

## 19.3 Location

Location is based on current approximate user location only with permission.

- Ask when the feature needs it, not immediately on first launch.
- Convert coordinates to an approximate city or region.
- Allow manual correction.
- Never publicly expose precise coordinates.
- Respect Ghost or Hidden location settings.

## 19.4 Counts

Show real counts for:

- Posts
- Followers
- Following

Counts open real lists or content where applicable.

## 19.5 Actions

Own profile:

- Edit Profile.
- Settings.
- Voicemail Inbox.

Other profile:

- Follow or Following.
- Message.
- Leave Voicemail when permitted.
- More menu with Share, Mute, Block, and Report.

## 19.6 Sign in

When signed out, display one Sign In button.

Do not display:

- Repeated “click to continue” cards.
- A second inline email form on the same profile.
- “Matisa.app sign in to use voicemail” inside the profile body.

## 19.7 Tabs

### Posts

- Shows real images attached to eligible permanent Notes.
- Uses a clean media grid.
- Opens the source Note or media detail.
- Shows an honest empty state.
- Never fills the grid with decorative gradient squares.

### Voice

- Shows public Voice Notes and eligible public voice content.
- May include the profile voice introduction near the top.
- Uses one shared Matisa audio player.

### Events

- Shows public upcoming, hosting, and past events according to privacy.
- Distinguish Hosting and Attending where useful.

### Videos

- Shows videos attached to permanent Notes and authorised saved live replays.
- Use real thumbnails and duration.

### Saved

- Visible only to the profile owner.
- Loads persisted saved content grouped by content type.

## 19.8 Permanent text Notes

Permanent text-only Notes remain discoverable in Home, Following, Explore, direct links, search, and the user’s public activity where applicable. Do not force text-only Notes into the visual Posts grid.

If a dedicated profile Notes view is later needed, add it only after product approval rather than silently adding a sixth main tab.

---

# 20. Voicemail

Voicemail is a playful asynchronous voice message left from another user’s profile.

## Visibility

- On another user’s profile, show Leave Voicemail only when the recipient allows it.
- It may be emphasised when the recipient is offline.
- The profile owner sees Voicemail Inbox, not Leave Voicemail to self.
- Guests who tap it use the single authentication flow and return to the intended profile.

## Recording

- Maximum duration initially 30 seconds unless changed by product decision.
- Request microphone permission only when recording starts.
- Show timer and waveform.
- Allow Stop, Preview, Record Again, Send, and Cancel.
- Upload privately.
- Do not use a public storage URL for private voicemail.

## Inbox

Show:

- Sender.
- Timestamp.
- Duration.
- Read or unread state.
- Shared audio player.
- Delete.
- Report.
- Block sender.

A new voicemail creates a real notification.

## Privacy settings

Allow:

- Everyone.
- People I Follow or Followers, based on the selected social model.
- Nobody.

RLS must prevent unauthorised reading.

---

# 21. Media and shared audio system

Use one authoritative audio player and one recorder system across:

- Voice Notes.
- Voicemail.
- Story voice.
- Chat voice messages.
- Profile voice introduction.
- Room previews or replays where applicable.

Required player behaviour:

- Play and pause.
- Seek.
- Duration and current time.
- Playback speed where appropriate.
- Only one normal audio item plays at a time.
- Continue through a global mini-player only for content designed for background playback.
- Release resources when content is discarded.

Use private signed URLs for private audio and suitable access-controlled delivery for public content.

---

# 22. Data and backend contracts

Before adding tables, inspect the active Supabase migration history and current schema. Use forward-only corrective migrations.

The following conceptual entities are required. Reuse or safely evolve existing tables rather than creating duplicates.

## Social identity

```text
profiles
profile_banners
follows
blocks
mutes
user_interests
user_presence
notification_preferences
privacy_settings
```

## Notes and media

```text
notes
note_media
note_reactions
note_replies
note_saves
note_impressions
note_reports
```

## Stories

```text
stories
story_views
story_reactions
```

## Rooms

```text
rooms
room_members
room_invitations
room_bans
room_speaker_requests
karaoke_queue
karaoke_performances
karaoke_reactions
```

## Events and payments

```text
events
event_hosts
event_attendance
event_invitations
event_bans
event_access_entitlements
payments
payment_webhook_events
event_room_sessions
```

## Messaging and voicemail

```text
conversations
conversation_members
messages
message_receipts
voicemails
```

## Notifications and moderation

```text
notifications
reports
moderation_actions
```

## Required database principles

- One source of truth per feature.
- Ownership and foreign keys.
- Unique constraints for follows, saves, reactions, attendance, queue membership, and conversation membership where appropriate.
- Cursor-friendly indexes.
- RLS for every exposed table.
- Storage policies for every bucket.
- Block relationships enforced across content, messages, rooms, and discovery.
- Server-side validation for limits, expiry, capacity, price, and permissions.
- Atomic operations for queue entry, capacity, purchases, reactions, follows, and RSVP where race conditions are possible.

---

# 23. Security and privacy

## Authentication

- Never trust a client-provided owner ID.
- Derive authenticated identity from the verified session.
- Use service role only in trusted server code after authorisation.

## RLS checks

For every changed table test:

- Unauthenticated user.
- Owner.
- Authenticated stranger.
- Follow relationship where relevant.
- Blocked user.
- Private profile or private room.
- Host or moderator.
- Expired or deleted content.

## Uploads

- Validate type, size, duration, and ownership.
- Use safe paths.
- Do not expose private media publicly.
- Remove abandoned uploads through a cleanup strategy.

## Payments

- Keep provider secrets server-side.
- Verify webhook signatures.
- Store provider event IDs uniquely.
- Use idempotency.
- Never grant paid access from client claims.
- Keep an audit trail.

## Rooms

- Issue short-lived provider tokens server-side.
- Derive role grants from authoritative room state.
- Enforce capacity atomically.
- Revoke or deny banned users.

## Location

- Store only what is needed.
- Prefer city, region, or rounded coordinates for discovery.
- Never show precise user location by default.

---

# 24. Loading, error, empty, and offline states

Every major screen and mutation must have:

- Initial loading state.
- Empty state.
- Recoverable error state.
- Retry where safe.
- Mutation pending state.
- Mutation failure rollback.
- Offline behaviour.
- Permission-denied behaviour where relevant.

Do not use generic “Something went wrong” when the app can provide a safe useful explanation.

Do not show success before persistence is confirmed.

---

# 25. Accessibility and mobile quality

Required:

- Correct safe areas.
- No clipped bottom navigation.
- No `user-scalable=no`.
- No global `user-select: none` on readable content.
- Minimum 44 px touch targets.
- Accessible names for icon buttons.
- Visible keyboard focus.
- Screen-reader announcements for important state changes.
- Reduced motion support.
- Text contrast that remains readable outdoors.
- Captions or transcripts for important voice and video content where available.
- Keyboard-aware chat and composer layouts.
- Correct Android and browser Back behaviour.

Test on narrow iPhone-sized and common Android-sized viewports, not only desktop responsive mode.

---

# 26. Analytics and observability

Track meaningful product events, not every render.

Suggested events:

```text
home_viewed
feed_tab_changed
note_composer_opened
note_lifetime_selected
note_published
note_publish_failed
story_published
content_impression
content_opened
content_reacted
content_replied
content_saved
content_shared
content_hidden
user_followed
room_created
room_joined
karaoke_queue_joined
karaoke_performance_started
event_created
event_checkout_started
event_access_granted
live_started
message_sent
voicemail_sent
report_submitted
```

Do not send message bodies, private audio, exact coordinates, payment secrets, or sensitive personal content to analytics.

Use Sentry or the established error provider for actionable errors with safe context and correlation IDs.

---

# 27. Testing requirements

Use test-driven changes for new behaviour and regressions where the repository supports it.

## Frontend unit and integration tests

Cover:

- Note limit switching.
- 24-hour and Permanent selection.
- Composer validation.
- Bottom navigation visibility and route actions.
- Header without profile icon.
- For You and Following separation.
- Explore result categories.
- Profile signed-out and signed-in states.
- Profile tab privacy.
- Voicemail recording states.
- Room creation validation.
- Event free and paid access states.

## Service and integration tests

Cover:

- Feed candidate queries and filters.
- Followed-user feed.
- Note expiry enforcement.
- Room capacity race conditions.
- Karaoke queue atomicity.
- Event RSVP and entitlement.
- Payment webhook idempotency.
- Message unread updates.
- Voicemail access.

## RLS tests

Cover owner, stranger, guest, blocked, private, host, and expired scenarios for every changed table.

## End-to-end critical paths

At minimum:

1. Sign in and onboarding.
2. Create a 24-hour Note.
3. Create a Permanent Note with an image.
4. Follow an account and see its Note in Following.
5. Discover a new creator in Explore.
6. Create and join a Voice Room.
7. Create and join a Karaoke Room queue.
8. Create a free physical event and RSVP.
9. Complete paid virtual event checkout in sandbox and join.
10. Send a message.
11. Leave and listen to voicemail.
12. Update profile banner and location privacy.

---

# 28. Implementation phases

Do not build all systems simultaneously.

## Phase 0. Stabilise the application shell

- Fix current TypeScript errors.
- Establish one routed frontend.
- Connect providers, error boundary, query client, auth, and layouts.
- Remove the top profile button.
- Fix bottom navigation visibility and safe areas.
- Keep the current UI.

Acceptance:

- All five navigation items are visible.
- Browser and Android Back behaviour is correct.
- Messages and Activity routes work.
- Profile exists only in bottom navigation.

## Phase 1. Authentication and Profile foundation

- One Sign In flow.
- Session restoration.
- Profile create or retrieve.
- Real banner upload.
- Edit profile.
- Approximate current location with permission and manual fallback.
- Counts and follow lists.
- Correct profile tabs and privacy.
- Remove Music from UI and routes where no longer used.

## Phase 2. Notes and Home

- Build the authoritative Note composer.
- Add 24-hour and Permanent lifetimes.
- Enforce 200 and 1,000 character limits.
- Add optional permanent image or video.
- Build real Home states.
- Connect For You and Following as separate data paths.
- Implement reactions, replies, saves, share, edit, delete, hide, and report for the approved initial set.

## Phase 3. Stories and Explore

- Complete story creation and viewing.
- Build mixed discovery candidates.
- Connect search across approved types.
- Add creator, event, room, and content discovery.
- Add deterministic ranking and feedback actions.

## Phase 4. Messages, Activity, and Voicemail

- Real conversation list and chat.
- Real notifications and unread badges.
- Voicemail privacy, recording, inbox, notifications, delete, and report.

## Phase 5. Voice Rooms

- Rooms hub.
- Create public and private Voice Rooms.
- Capacity and invitations.
- LiveKit token flow.
- Listener, speaker, raise hand, host controls, floating room state.

## Phase 6. Karaoke Rooms

- Karaoke room creation.
- Listener and singer pre-join.
- Queue.
- Host control.
- Cleared catalogue adapter.
- Performance state.
- Reactions and moderation.

## Phase 7. Events

- Discover and Your Events.
- Physical and virtual events.
- Event creation, drafts, hosts, RSVP, invites, capacity, and moderation.
- Free virtual event access.

## Phase 8. Paid virtual events

- Provider adapter.
- Sandbox checkout.
- Signed webhook.
- Payment record and entitlement.
- Join enforcement.
- Cancellation and refund path.

## Phase 9. Live video

- Create Live.
- Preview.
- Broadcast controls.
- Moderation.
- Optional replay.

## Phase 10. Production hardening

- Full accessibility pass.
- Performance and list virtualisation.
- Offline behaviour.
- Analytics and monitoring.
- Security and RLS audit.
- Cross-device E2E verification.

Do not begin a later phase merely because files for it already exist. Complete and verify the current phase first.

---

# 29. Definition of done for every feature

A feature is complete only when:

- The visible interaction is connected.
- Data persists in the correct source of truth.
- Permissions are enforced server-side.
- Loading, empty, error, offline, and retry states exist.
- No fake data remains in that feature.
- Mobile layout works at supported sizes.
- Accessibility basics are met.
- Focused automated tests pass.
- Relevant RLS or integration tests pass.
- Build and typecheck pass for the completed slice.
- Completion report states exact verification results.

Use only:

- VERIFIED WORKING
- VERIFIED FAILING
- NOT VERIFIED

Never say “should work” as completion evidence.

---

# 30. Explicit non-goals for this implementation

Do not add these while implementing the above unless separately approved:

- General internal wallet.
- Gifting or coins.
- Radar map of nearby users.
- Job board or opportunity marketplace.
- Creator subscription SaaS.
- Dating matching.
- XP, levels, badges, or unrelated gamification.
- Unlicensed commercial karaoke catalogue.
- A complete visual redesign.
- A new frontend stack.

Paid event access is allowed, but it must remain an event checkout and entitlement system rather than a general wallet.

---

# 31. First execution request for the IDE

When this file is first given to the coding IDE, do not ask it to implement every phase at once.

Use this prompt:

> Read `AGENTS.md`, the Matisa frontend surgical skill, the backend surgical skill, and this product implementation specification. Verify the currently active frontend source. Then complete only Phase 0, Stabilise the application shell. Preserve the current UI. Produce a short factual plan before editing, implement the phase in controlled changes, run focused verification, and stop after reporting exact results. Do not begin Phase 1.

After Phase 0 is approved, proceed one phase at a time with a separate instruction.
