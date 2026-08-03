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

1. **Share** — For thoughts, work, photos, videos, experiences, or Voice Notes.
2. **Ask** — For advice, help, recommendations, or a direct question.
3. **Discuss** — For an opinion or conversation. A Discuss Note may be converted into a Voice Room.
4. **Invite** — For inviting people to an informal activity, physical gathering, Room, or Event.
5. **Build** — For an idea that needs collaborators or will develop over time.

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

---

# 10. Note-to-Room

A user can turn an active conversation into a live Voice Room.

Flow:

Open Note → Tap “Continue this live” → Choose Room name → Select public, private, or invite-only → Select capacity → Start Voice Room → Original Note appears as Room context.

---

# 11. Pass the Mic

Pass the Mic is a voice-first reply chain.

Instead of only typing comments, users can respond with short Voice replies.

---

# 12. Social graph

Matisa uses a normal Follow system with Public, Followers, Close Circle, and Private privacy controls.

---

# 13. Engagement

Universal actions: Appreciate or Like, Reply, Share, Save.

---

# 14. Stories

24-hour expiry, photo, video, text, or voice. Story replies open a private message.

---

# 15. Rooms

Live participation spaces (Voice Rooms & Karaoke Rooms).

---

# 16. Voice Rooms

Public, private, invite-only, scheduled or immediate. Host, co-host, speakers, listeners, raise hand, approve speaker.

---

# 17. Karaoke Rooms

Core Matisa feature with host controls, singer queue,Acappella mode, and instrumentals catalogue.

---

# 18. Events

Physical, virtual Voice Event, virtual Video Event, Karaoke Event, hybrid Event. Paid event access verified server-side.

---

# 19. Profiles

Notes, Voice, Events, Videos, Saved tabs. Optional short Voice introduction.

---

# 20. Voicemail

Short voice messages left on someone's profile when allowed.

---

# 21. Messaging

Text, images, video, Voice messages. Voice messages use the shared audio player.

---

# 22. Explore & 23. Local Pulse

Search, emerging creators, trending Notes, Voice Rooms, Karaoke Rooms, Events, Local Pulse (approximate regional/city location).

---

# 24-29. Feed & Recommendation Algorithm

For You (hybrid scoring), Following (70% freshness), Explore, Feed Mixer, and Soft finite feed ("You're caught up").

---

# 30. Notifications, 31. Low-Data, 32. Safety & Privacy

Prioritized notifications, Data Saver mode, reporting, blocking, muting.

---

# 33. Canonical Backend Edge Functions

- `generate-home-feed`
- `generate-explore-feed`
- `track-interaction`
- `cleanup-expired-content`
- `send-notification`
- `create-room`
- `issue-livekit-token`
- `join-room`
- `leave-room`
- `request-speaker`
- `approve-speaker`
- `join-karaoke-queue`
- `start-karaoke-performance`
- `finish-karaoke-performance`
- `publish-event`
- `create-event-checkout`
- `payment-webhook`
- `issue-event-access`
- `process-media`
- `transcribe-audio`
- `moderate-content`
- `detect-fake-engagement`

---

# 34. Required Data Entities & 36. Implementation Phases

**Phase 1. Social Foundation**  
**Phase 2. Voice Foundation**  
**Phase 3. Stories and Discovery**  
**Phase 4. Live Participation**  
**Phase 5. Karaoke**  
**Phase 6. Events**  
**Phase 7. Product Depth**  
