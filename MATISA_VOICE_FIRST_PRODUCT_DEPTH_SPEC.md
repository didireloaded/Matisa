# MATISA VOICE-FIRST PRODUCT DEPTH SPECIFICATION

## Document purpose

This file defines the new product depth being added to Matisa.

It does **not** replace the visual redesign specification. The visual redesign still controls how Matisa looks. This file controls what Matisa is, how its core features work, how users move through the product, and how the recommendation system should behave.

The IDE must read this file before adding or changing:

- Notes
- Voice Notes
- Stories
- Voice Rooms
- Karaoke Rooms
- Events
- Profiles
- Follow and Following
- Likes and reactions
- Replies
- Shares
- Saves
- Messaging
- Voicemail
- Explore
- For You
- Recommendation logic
- Notifications
- Voice-related backend systems

The most important product rule is:

> **Matisa is voice-first over everything.**

Voice is not an extra content format hidden behind a microphone icon. Voice should be present across the entire product and should make Matisa feel different from Instagram, TikTok, X, and ordinary community apps.

---

# 1. Product definition

Matisa is a participation-first social platform where people:

- share temporary or permanent Notes
- speak instead of always typing
- reply with voice
- turn conversations into live Voice Rooms
- create and join Karaoke Rooms
- host physical or virtual Events
- leave Voicemails
- discover local people and activity
- follow creators and conversations
- move from passive content into real participation

Matisa should be described internally as:

> **A voice-first social platform where a Note can become a conversation, a Room, a performance, a collaboration, or an Event.**

A shorter product line is:

> **Share a thought. Start something.**

A stronger positioning line is:

> **Instagram is where people show. TikTok is where people watch. Matisa is where people join in.**

---

# 2. What “voice-first” means

Voice-first does not mean every user must record audio.

It means voice is treated as a primary method of communication throughout the app.

Matisa should support voice in the following places:

- Voice Notes in the Home feed
- Voice replies under Notes
- Voice replies to Stories
- Voice messages in chat
- Voice introductions on profiles
- Voicemail on profiles
- Voice Rooms
- Karaoke Rooms
- virtual Event discussions
- Event waiting rooms
- host announcements
- “Pass the Mic” conversation chains
- optional audio playback for long permanent Notes
- optional transcription for accessibility
- optional captions for voice and video

Text remains important, but voice must feel native to the platform rather than added later.

---

# 3. Core product boundaries

Matisa must remain focused.

## Build now

- Authentication
- Profiles
- Follow and Following
- Temporary Notes
- Permanent Notes
- Voice Notes
- Stories
- Appreciate or Like
- Reply
- Voice Reply
- Share
- Save
- For You feed
- Following feed
- Explore
- Messaging
- Voicemail
- Voice Rooms
- Karaoke Rooms
- Events
- Live video
- Activity and notifications
- Local discovery
- Basic recommendation algorithm
- Reporting, blocking, muting, and privacy
- Low-data behavior

## Add as product depth

- Intent-based Notes
- Living Notes
- Note-to-Room
- Pass the Mic
- Collaborative credits
- Feed Mixer
- “Why am I seeing this?”
- Local Pulse
- Emerging Creator rotation
- Soft finite feed
- Event lobby
- Karaoke challenges

## Do not build as part of the current core product

- Full project-management workspaces
- Task boards
- Milestone management dashboards
- Full jobs marketplace
- Business catalogue
- Appointment booking
- Equipment-rental marketplace
- Advertising dashboard
- Creator subscriptions
- Wallet
- Gifting
- Tips
- Revenue splitting
- Full custom Circles system
- Universal reputation score
- Product and service marketplace
- Group video calls
- Screen sharing
- Full enterprise community tools

These may be considered later, but the current IDE must not add them unless the user explicitly changes scope.

---

# 4. Main navigation

Use exactly five primary navigation destinations:

1. Home
2. Explore
3. Create
4. Rooms
5. Profile

## Top navigation

Home should contain:

- Messages
- Activity

Do not place Profile in the top navigation.

## Settings

Settings belongs inside Profile only.

## Back navigation

Root tabs do not need back buttons.

Secondary screens must support:

- a small visible back button
- iOS-style edge swipe where supported
- Android system back
- browser back for PWA
- return to previous scroll position

Secondary screens include:

- Note detail
- Story viewer
- Room preview
- Voice Room
- Karaoke lobby
- Karaoke performance
- Event detail
- Chat
- Followers
- Following
- Edit Profile
- Settings
- Saved content
- Notification detail

Navigation must use routes. Do not control the whole app through one large `activeScreen` state.

---

# 5. Home

Home is the main daily-use screen.

## Required order

1. Top navigation
2. Stories
3. Main Note composer
4. Quick creation actions
5. For You and Following
6. Main feed
7. Relevant discovery inserts
8. Soft caught-up state

## Main composer

The Home composer should clearly invite participation.

It should include:

- user avatar
- “What’s on your mind?”
- send action
- Note
- Voice Note
- Story
- Event

Pressing the main field opens Note creation.

Pressing Voice Note starts the voice composer.

The composer must not look like an ordinary Instagram post box.

## Home feed content

The feed may contain:

- temporary Note
- permanent Note
- Voice Note
- image Note
- video Note
- Story recommendation
- Voice Room
- Karaoke Room
- Event
- live session
- Local Pulse insert
- emerging creator insert

Do not fill simple text Notes with decorative panels that have no function.

---

# 6. Notes

Matisa calls its public content **Notes**.

Do not use separate competing public models called Posts and Notes.

The frontend, services, database naming, analytics, and product language should converge around Notes.

## 6.1 Temporary Note

A temporary Note is for something relevant now.

Rules:

- maximum 200 characters
- expires after 24 hours
- text-first
- optional simple background
- optional Voice version
- may receive replies, Likes, shares, and saves while active
- removed from public feeds after expiry
- removed from public profile after expiry
- may remain in the owner’s private archive
- must show that it expires
- must have a valid `expires_at`

Composer copy:

```text
Disappears in 24 hours
37 / 200
```

## 6.2 Permanent Note

A permanent Note is for something worth keeping.

Rules:

- maximum 5,000 characters
- remains until deleted
- may contain text
- may contain images
- may contain video
- may contain voice
- may be edited
- shows an Edited label after modification
- long content collapses in the feed
- “Read more” opens the full Note
- appears on the user’s profile
- may become a Living Note
- may include collaborators and credits

Composer copy:

```text
Stays on your profile
1,246 / 5,000
```

The user must never be unsure whether a Note will expire.

---

# 7. Voice Notes

Voice Notes are a core Matisa content type.

A Voice Note may be:

- temporary for 24 hours
- permanent
- published to Home
- attached to a Story
- used as a reply
- sent in Messages
- sent as Voicemail
- linked to a Room
- attached to an Event update

## Voice Note composer

Must support:

- microphone permission
- recording timer
- pause where supported
- stop
- preview
- waveform
- record again
- optional caption
- temporary or permanent choice
- audience
- upload progress
- cancel upload
- retry
- transcription when available

## Voice Note player

Use one shared player across the app.

It should support:

- play
- pause
- seek
- duration
- loading
- error
- playback speed
- optional transcript
- only one main audio item playing at a time

Do not use different browser audio controls on every screen.

---

# 8. Note intents

Intent gives a Note purpose.

Do not launch with a long list of confusing intents.

Use five primary intents:

## Share

For thoughts, work, photos, videos, experiences, or Voice Notes.

Primary contextual action:

- Appreciate
- Reply
- Save

## Ask

For advice, help, recommendations, or a direct question.

Optional fields:

- location
- deadline
- answer type
- allow Voice answers
- mark as solved

Primary action:

- Answer

## Discuss

For an opinion or conversation.

Optional fields:

- topic
- Voice replies enabled
- open live discussion

Primary action:

- Join conversation

A Discuss Note may be converted into a Voice Room.

## Invite

For inviting people to an informal activity, physical gathering, Room, or Event.

Optional fields:

- date
- time
- location or online
- capacity
- invite list

Primary action:

- Join or Attend

## Build

For an idea that needs collaborators or will develop over time.

Optional fields:

- goal
- roles needed
- current stage
- next step
- collaborators
- credits

Primary action:

- Collaborate

## Later intents

Only add these after usage proves they are needed:

- Offer
- Opportunity
- Recommend

The IDE must not create a large marketplace around Note intents.

---

# 9. Living Notes

A permanent Note can become a Living Note.

A Living Note develops over time instead of being replaced by disconnected updates.

It may contain:

- original Note
- updates
- milestones
- collaborators
- media
- related Event
- related Voice Room
- final result
- credits
- completed state

Example:

```text
I want to create a short film in Windhoek
→ collaborators join
→ casting update
→ location update
→ behind-the-scenes
→ first cut
→ final film
→ production credits
```

## Living Note actions

- Add update
- Add milestone
- Add collaborator
- Add media
- Link Room
- Link Event
- Mark completed
- Publish outcome
- Follow updates

Do not turn Living Notes into a full project-management system.

No task boards, internal workspaces, or enterprise project tools are required.

---

# 10. Note-to-Room

This is one of Matisa’s signature features.

A user can turn an active conversation into a live Voice Room.

Flow:

```text
Open Note
→ Tap “Continue this live”
→ Choose Room name
→ Select public, private, or invite-only
→ Select capacity
→ Start Voice Room
→ Original Note appears as Room context
```

The Room should link back to the original Note.

The original Note should show:

- Room live now
- Room ended
- replay or summary if supported

---

# 11. Pass the Mic

Pass the Mic is a voice-first reply chain.

Instead of only typing comments, users can respond with short Voice replies.

Possible flow:

```text
Open Note
→ Tap Voice Reply
→ Record short response
→ Preview
→ Send
→ Reply joins the voice chain
```

The user can listen through the chain in order.

Use this for:

- questions
- discussions
- storytelling
- advice
- challenges
- reactions

Pass the Mic must remain controlled:

- reasonable duration limit
- reporting
- block and mute
- transcript where available
- no autoplay with sound
- clear reply ownership

---

# 12. Social graph

Matisa uses a normal Follow system.

## Follow behavior

- Follow user
- Unfollow user
- Follow request for private accounts
- Accept request
- Decline request
- Remove follower
- View followers
- View following
- Follow back
- Show mutuals
- Block
- Mute

## Rules

- users cannot follow themselves
- follow relationships must be unique
- private profiles create requests
- blocking removes follow relationships
- blocked users cannot follow, message, invite, or join private Rooms
- follow counts update safely
- UI updates optimistically but reverts on failure
- mass follow and unfollow behavior is rate-limited

## Audience controls

Use only:

- Public
- Followers
- Close Circle
- Selected people or Private

Do not build custom Circles at launch.

---

# 13. Engagement

Universal actions should remain simple.

Use:

- Appreciate or Like
- Reply
- Share
- Save

Then add one contextual action based on intent:

- Answer
- Attend
- Join
- Collaborate
- Enter Room

Do not display a large collection of reactions under every Note.

## Appreciate or Like

- one per user per item
- optimistic update
- real count
- unlike
- notification
- limited influence on algorithm

## Reply

- text reply
- Voice reply
- one-level thread
- mention
- delete own reply
- report reply

## Share

- native device share
- copy deep link
- share to Matisa Message
- track share event without exposing private recipient

## Save

- private
- persists across devices
- appears in Saved
- can be removed
- collections may come later

---

# 14. Stories

Stories must work before being treated as a major Home feature.

Support:

- photo
- video
- text
- voice
- 24-hour expiry
- audience
- upload progress
- seen and unseen state
- viewer list for owner
- reply
- Voice reply
- reaction
- mute Stories
- report
- delete

Viewer behavior:

- tap forward
- tap backward
- hold to pause
- swipe down to close
- small back control where needed

Story replies should open or create a private conversation.

---

# 15. Rooms

Rooms in the current Matisa product mean **live participation spaces**.

They do not mean Slack-style permanent communities.

The Rooms tab contains:

- Live Now
- Voice Rooms
- Karaoke Rooms
- Scheduled Rooms
- Private invites
- Rooms from followed people

Community workspaces may be added later under a different product name.

---

# 16. Voice Rooms

Users can create:

- public Voice Room
- private Voice Room
- invite-only Voice Room
- scheduled Voice Room
- immediate Voice Room

## Creation fields

- Room title
- topic
- optional cover
- visibility
- participant capacity
- speaker capacity
- speaker requests enabled
- invited users
- start now or schedule
- linked Note, optional
- Room rules

## Voice Room experience

- host
- co-host
- speakers
- listeners
- active speaker indicator
- mute
- raise hand
- request to speak
- approve speaker
- remove speaker
- invite
- share
- reactions
- participant list
- report
- block
- leave
- end Room
- reconnection behavior
- host transfer if needed

Do not show fake listener counts or fake participants.

---

# 17. Karaoke Rooms

Karaoke is a core Matisa feature.

It must be built as a real system, not only a card and Join button.

## Create Karaoke Room

Flow:

```text
Create
→ Room
→ Karaoke Room
→ Add Room details
→ Set visibility
→ Set audience capacity
→ Set singer queue capacity
→ Select start now or schedule
→ Select song mode
→ Invite people
→ Start or publish
```

## Creation fields

- title
- cover
- public, private, or invite-only
- audience capacity
- queue capacity
- genre
- start now or schedule
- allowed song source
- Acapella Mode
- reactions enabled
- audience voting, optional
- Room rules

## Karaoke lobby

Show:

- host
- title
- current listener count
- current performer
- queue length
- friends inside
- Join as Listener
- Join Singer Queue
- microphone check
- connection check

## Karaoke live experience

- current performer
- song or Acapella label
- timer
- next performer
- queue
- audience
- reactions
- cheer
- follow performer
- request song
- join queue
- leave queue
- host controls
- skip performer
- remove user
- end performance
- report
- block
- leave Room

## Song safety

Do not scrape lyrics or use unlicensed songs.

The first working version may use:

- approved instrumental catalogue
- creator-uploaded instrumentals with rights confirmation
- Acapella Mode

---

# 18. Events

Matisa Events can happen physically or entirely inside the app.

## Event types

- physical Event
- virtual Voice Event
- virtual video Event
- Karaoke Event
- talent show
- hybrid Event

## Access types

- free public
- free private
- invite-only
- paid ticket

## Event creation flow

```text
Create
→ Event
→ Choose event type
→ Add title and description
→ Add cover
→ Select date and time
→ Choose physical, virtual, or hybrid
→ Add location or Matisa Room
→ Set capacity
→ Set free or paid
→ Set visibility
→ Add co-hosts
→ Preview
→ Save draft or publish
```

## Event detail

Must show:

- cover
- title
- host
- date
- time
- location or online
- price
- capacity
- attendee state
- RSVP or purchase
- share
- add to calendar
- directions for physical Events
- Join when the virtual Event is active

## Event lobby

Virtual Events should support a simple lobby:

- countdown
- host message
- attendee presence
- Voice announcement
- Event rules
- Join when access opens

Paid Event access must be verified server-side.

Frontend state alone must never unlock paid content.

---

# 19. Profiles

A profile should communicate who the person is, what they create, and how to engage with them.

## Required profile content

- banner image
- avatar
- display name
- username
- verification
- bio
- approximate location
- availability or status
- Notes count
- followers
- following

## Owner actions

- Edit Profile
- Settings

## Visitor actions

- Follow
- Message
- Voicemail
- More

## Profile tabs

1. Notes
2. Voice
3. Events
4. Videos
5. Saved

Saved is visible only to the owner.

Remove Music from the active product.

## Voice introduction

Profiles may include an optional short Voice introduction.

It should be:

- easy to record
- easy to replace
- easy to remove
- transcribed where possible
- not autoplayed with sound

---

# 20. Voicemail

Voicemail is a playful but real voice-first feature.

Users may leave a short Voicemail from another person’s profile when allowed.

Support:

- permission setting
- record
- timer
- preview
- record again
- send
- upload progress
- inbox
- sender
- timestamp
- duration
- unread state
- delete
- report
- block sender
- notification

Do not repeatedly show Sign In prompts after authentication.

---

# 21. Messaging

Messaging must support voice as a first-class format.

## Inbox

- search
- inbox
- unread
- requests
- real last message
- real timestamp
- unread state
- no fake conversations

## Conversation

- text
- images
- video
- Voice messages
- replies
- reactions where useful
- typing indicator
- read status
- report
- block
- conversation details

Voice messages use the same shared audio player as Voice Notes and Voicemail.

---

# 22. Explore

Explore is where users discover what is happening outside their current network.

It should include:

- search
- emerging creators
- trending Notes
- Voice Notes
- Voice Rooms
- Karaoke Rooms
- upcoming Events
- virtual Events
- live sessions
- videos
- local activity
- suggested people
- topics

Explore should be visual and mixed.

It must not become a duplicate For You feed.

---

# 23. Local Pulse

Local Pulse lives inside Explore.

It uses approximate city or regional location.

It may show:

- what the city is discussing
- Events tonight
- Voice Rooms nearby
- Karaoke Rooms from local hosts
- creators gaining attention
- public local conversations
- local talent calls
- city and town trends

Never expose exact user coordinates.

Location permission should be requested only when the user enters a feature that needs it.

---

# 24. Feed system

Matisa has three main discovery systems.

## For You

Personalised recommendation feed.

Candidate sources:

- followed users
- interests
- meaningful past interactions
- local activity
- Voice content
- Rooms
- Events
- emerging creators
- mutual connections
- new content with limited exposure

Suggested launch weighting:

```text
25% interest relevance
20% relationship strength
14% voice relevance
12% freshness
10% content quality
8% local relevance
6% creator diversity
5% controlled exploration
```

Voice relevance includes:

- user listens to Voice Notes
- completes audio playback
- joins Voice Rooms
- sends Voice replies
- uses Voicemail
- joins Karaoke
- follows voice creators

## Following

Only content from followed accounts.

Suggested weighting:

```text
70% freshness
20% relationship strength
10% quality
```

Do not create Following by slicing For You.

## Explore

Discovery outside the user’s current network.

Suggested balance:

```text
25% emerging activity
20% interest match
15% local relevance
15% new creators
10% live Rooms
10% Events
5% controlled surprise
```

---

# 25. Feed eligibility

Before scoring, remove:

- deleted content
- expired Notes
- expired Stories
- blocked users
- muted users
- private content without permission
- unsafe content
- duplicate content
- content seen too many times
- failed uploads
- cancelled Events
- ended Rooms that have no replay or summary

---

# 26. Algorithm signals

## Strong positive signals

- Save
- Share
- meaningful reply
- Voice reply
- follow after viewing
- Room join
- Karaoke queue join
- Event RSVP
- Event purchase
- completing a Voice Note
- expanding a long Note
- following a Living Note
- joining a Note-linked Room

## Medium signals

- Like or Appreciate
- profile visit
- Story completion
- replaying audio
- reading a permanent Note

## Weak signals

- impression
- brief pause
- accidental tap

## Strong negative signals

- Block
- Report
- Hide
- Not interested
- Mute creator
- Mute topic
- Unfollow

## Medium negative signals

- immediate skip
- repeated ignored creator
- exit Voice Note almost immediately
- leave Room quickly

Do not punish a creator heavily because one user scrolled past once.

---

# 27. Algorithm diversity

After ranking, apply a diversity pass.

Rules:

- no more than two items from one creator within ten items
- avoid consecutive items with the same format
- mix Voice, text, media, Rooms, and Events
- reserve exposure for emerging creators
- reserve exposure for local creators
- reduce repeated topics
- avoid showing several ended or inactive experiences
- do not let large creators dominate only because of raw Likes

The algorithm should optimise for meaningful participation, not endless watch time.

---

# 28. Feed Mixer

Users should have simple control over For You.

Possible controls:

- More Voice
- More people I follow
- More local content
- More new creators
- More discussions
- More Karaoke
- More Events
- Less promotional content
- Less repeated topics
- Prioritise recent content

Every recommended item should offer:

- Why am I seeing this?
- Not interested
- Show fewer like this
- Mute creator
- Hide topic

Keep Feed Mixer simple. Do not expose complex percentages to ordinary users.

---

# 29. Soft finite feed

Matisa should avoid automatic endless scrolling.

After a meaningful amount of fresh content, show:

```text
You’re caught up with the important things.
```

Then offer:

- Explore something new
- Join a Room
- See Events
- Message someone
- Load more

The user may load more, but the app should not automatically trap them in endless content.

---

# 30. Notifications

Notifications should be prioritised.

## Immediate

- direct message
- account security
- Room invite
- speaker approval
- Karaoke queue update
- Event change
- Event access
- time-sensitive invitation

## Normal

- reply
- Voice reply
- mention
- follow request
- followed Living Note update

## Grouped summary

- Likes
- new followers
- general recommendations
- low-priority Room activity

Use real unread counts.

Do not send one push notification for every minor reaction.

---

# 31. Low-data behavior

Low-data support is a core Matisa quality.

Support:

- Data Saver mode
- compressed media
- low-resolution previews
- no autoplay with sound
- Wi-Fi-only video upload
- background upload queue
- resumable upload
- offline drafts
- text-first feed option
- audio-only alternatives where possible
- network quality indicator for live Rooms
- graceful reconnection

This must be considered during implementation, not added after launch.

---

# 32. Safety and privacy

Required:

- report Note
- report reply
- report Story
- report Room
- report Event
- report message
- report Voicemail
- block
- mute
- private profile
- message requests
- Voice permission controls
- Voicemail permission controls
- location privacy
- approximate location
- account deletion
- data download
- age protections
- spam protection
- mass-follow protection
- Room moderation
- Karaoke moderation

Voice content must have the same moderation seriousness as text and video.

---

# 33. Canonical backend responsibilities

Use direct Supabase operations with strong RLS for ordinary user-owned actions where appropriate.

Examples:

- follow
- unfollow
- Like
- unlike
- Save
- unsave
- mark Story viewed
- mark notification read
- update own Profile
- delete own Note

Use Edge Functions or secure server logic for:

- generate Home recommendations
- generate Explore recommendations
- create LiveKit token
- create Room
- join restricted Room
- approve speaker
- join Karaoke queue
- start Karaoke performance
- finish Karaoke performance
- publish paid Event
- create Event checkout
- process payment webhook
- issue paid Event access
- process media
- create transcript
- moderate content
- detect spam and fake engagement
- clean expired Notes and Stories
- send push notifications

Suggested canonical function names:

```text
generate-home-feed
generate-explore-feed
track-interaction
cleanup-expired-content
send-notification
create-room
issue-livekit-token
join-room
leave-room
request-speaker
approve-speaker
join-karaoke-queue
start-karaoke-performance
finish-karaoke-performance
publish-event
create-event-checkout
payment-webhook
issue-event-access
process-media
transcribe-audio
moderate-content
detect-fake-engagement
```

Do not keep several differently named Edge Functions that perform the same responsibility.

---

# 34. Required data entities

The final system should converge around:

- profiles
- user_interests
- follows
- follow_requests
- blocks
- mutes
- notes
- note_media
- note_updates
- note_collaborators
- comments
- voice_replies
- reactions
- saves
- shares
- stories
- story_views
- rooms
- room_participants
- speaker_requests
- karaoke_queue
- karaoke_performances
- events
- event_hosts
- event_attendees
- event_invites
- event_tickets
- event_orders
- conversations
- conversation_participants
- messages
- voicemail_messages
- notifications
- content_impressions
- interaction_events
- content_topics

Do not maintain separate competing `posts` and `notes` systems.

---

# 35. Important edge cases

Handle:

- temporary Note expires while being viewed
- Story expires while open
- Note has no valid expiry
- duplicate Like
- duplicate Follow
- private follow request
- blocked user attempts to message
- blocked user attempts to join Room
- media upload interruption
- audio upload interruption
- microphone permission denied
- camera permission denied
- transcript fails
- Room capacity reached
- speaker capacity reached
- Room host disconnects
- listener reconnects
- Karaoke performer disconnects
- Karaoke queue race condition
- Event capacity race condition
- Event cancelled after purchase
- payment succeeds but webhook is delayed
- user joins from multiple devices
- deleted content remains cached
- notification references deleted content
- user publishes while offline
- 5,000-character Note validation
- network changes during Voice playback
- user blocks someone during a live Room
- host ends Room while users are reconnecting

---

# 36. Implementation order

## Phase 1. Social foundation

- routed navigation
- authentication
- Profile
- Follow and Following
- temporary Notes
- permanent Notes
- Like or Appreciate
- replies
- Voice replies
- Share
- Save
- For You
- Following
- Activity
- back navigation

## Phase 2. Voice foundation

- Voice Note recorder
- shared audio player
- voice transcript support
- Voice messages
- Voicemail
- profile Voice introduction
- Pass the Mic

## Phase 3. Stories and discovery

- Stories
- Explore
- Search
- Local Pulse
- Feed Mixer
- recommendation explanation
- low-data controls

## Phase 4. Live participation

- Voice Rooms
- Note-to-Room
- LiveKit
- speaker requests
- Room moderation
- reconnection

## Phase 5. Karaoke

- create Karaoke Room
- lobby
- singer queue
- performer mode
- audience mode
- host controls
- reactions
- performance history

## Phase 6. Events

- physical Event
- free virtual Event
- paid virtual Event
- Event lobby
- reminders
- secure access
- event-linked Voice Room
- event-linked Karaoke Room

## Phase 7. Product depth

- Note intents
- Living Notes
- collaborative credits
- soft finite feed
- emerging creator rotation
- improved recommendation scoring

---

# 37. IDE working rules

1. Read `AGENTS.md` before changes.
2. Read the Matisa frontend and backend surgical-edit skills.
3. Use the existing visual redesign directive for visual decisions.
4. Use this file for product behavior and scope.
5. Do not reintroduce removed features.
6. Do not create fake controls.
7. Do not create fake counts.
8. Do not create duplicate content models.
9. Do not create a second audio player.
10. Do not rebuild the backend when an existing contract works.
11. Do not install packages without a clear reason.
12. Work one phase or screen family at a time.
13. Preserve working Supabase and realtime logic.
14. Add loading, error, empty, offline, and permission states.
15. Stop when the requested scope is complete.
16. Report backend dependencies honestly.
17. Run targeted checks for changed files.
18. Do not call a feature complete until its full user journey works.

---

# 38. Definition of done

A Matisa feature is complete only when:

- the visible interface exists
- the action works
- data persists
- permissions are enforced
- loading exists
- empty state exists
- error and retry exist
- offline or reconnect behavior is handled where relevant
- success is real
- notification behavior is correct
- deep links work
- back navigation works
- accessibility is considered
- fake data has been removed
- mobile safe areas work
- targeted tests pass

---

# 39. Final product rule

When deciding whether to add a feature, ask:

> Does this help a person speak, listen, join, perform, host, connect, or turn a conversation into something real?

If the answer is no, the feature is probably not part of Matisa’s current core.

Matisa should not become an everything app.

It should become the best voice-first participation platform it can be.
