
# MATISA: 3RD PARTY SERVICES & INTEGRATIONS
## Everything You Need for a Native Mobile App Experience

---

## OVERVIEW

To make Matisa feel like a real native mobile app (not a website in a wrapper), you need services that handle the things browsers can't do well:
- Push notifications
- Background audio
- Voice streaming
- Camera access
- Location tracking
- Offline mode
- Biometric auth

Here's the complete stack, organized by priority.

---

## TIER 1: ESSENTIAL (Ship Without These = Broken App)

### 1. SUPABASE (Already Using) — Backend Platform
**What it does:** Database, Auth, Storage, Realtime, Edge Functions
**Cost:** Free tier: 500MB DB, 1GB storage, 2M edge function invocations
**Why you need it:** This is your entire backend. You're already using it.
**Setup:** Already done ✅

**Critical Configurations:**
- Enable Phone Auth provider (Settings → Auth → Providers → Phone)
- Configure SMS provider (Africa's Talking recommended for Namibia)
- Enable Realtime for: voice_rooms, room_participants, messages, notifications
- Set up Storage buckets with proper RLS policies
- Configure CORS for your domain

---

### 2. LIVEKIT — Voice & Audio Streaming
**What it does:** WebRTC-based real-time audio for voice rooms and karaoke
**Cost:** Free tier: 50 concurrent participants, then $0.0018/participant-minute
**Why you need it:** Browsers can't do peer-to-peer audio at scale. LiveKit handles the SFU (Selective Forwarding Unit) so 100 people can be in a room without melting your server.
**Alternative:** Agora (more expensive, better docs), Daily.co (simpler)

**Integration:**
```typescript
// LiveKit client setup
import { Room } from 'livekit-client';

const room = new Room({
  adaptiveStream: true,
  dynacast: true,
  audioCaptureDefaults: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
});

// Connect using token from your edge function
const token = await fetch('/functions/v1/room-join', { 
  method: 'POST', 
  body: JSON.stringify({ room_id }) 
}).then(r => r.json());

await room.connect('wss://your-livekit-server.com', token.token);
await room.localParticipant.setMicrophoneEnabled(true);
```

**Why not build it yourself:** WebRTC signaling, NAT traversal, audio mixing, and bandwidth adaptation are incredibly complex. LiveKit solves all of this.

---

### 3. FIREBASE CLOUD MESSAGING (FCM) — Push Notifications
**What it does:** Sends push notifications to iOS and Android devices
**Cost:** Free (unlimited notifications)
**Why you need it:** Users need to know when someone messages them, invites them to a room, or likes their note — even when the app is closed.
**Alternative:** OneSignal (easier setup, cross-platform), Supabase (limited push support)

**Integration Flow:**
```
1. User installs app → FCM generates device token
2. Token sent to Supabase (stored in user_settings.device_tokens)
3. Event happens (new message, room invite) → Edge function triggers
4. Edge function calls FCM API with device token
5. User receives push notification
```

**Critical Notifications to Implement:**
- New direct message
- Room invitation
- Friend request
- Note reply/mention
- Event reminder (1 day, 1 hour before)
- "Your friend started a room"
- "Someone liked your note"

**Code Example:**
```typescript
// Edge function: send-push-notification
import { messaging } from 'firebase-admin';

export async function sendPushNotification(token: string, title: string, body: string, data: object) {
  await messaging().send({
    token,
    notification: { title, body },
    data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
    android: { 
      priority: 'high',
      notification: { channelId: 'matisa_main', sound: 'default' }
    },
    apns: { 
      payload: { aps: { sound: 'default', badge: 1 } }
    },
  });
}
```

---

### 4. AFRICA'S TALKING — SMS OTP for Authentication
**What it does:** Sends SMS messages (OTP codes) to Namibian phone numbers
**Cost:** ~$0.005 per SMS in Namibia
**Why you need it:** Phone OTP is the primary signup method for African markets. Email adoption is lower.
**Alternative:** Twilio (more expensive in Africa, better global coverage), MessageBird

**Why Africa's Talking specifically:**
- Best delivery rates in Africa
- Local carrier relationships
- Supports Namibian networks (MTC, Telecom Namibia, Paratus)
- Cheaper than Twilio for African numbers

**Integration:**
```typescript
// Edge function: send-otp
import AfricasTalking from 'africastalking';

const at = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

export async function sendOTP(phone: string, code: string) {
  await at.SMS.send({
    to: phone,
    message: `Your Matisa verification code is: ${code}. Valid for 10 minutes.`,
    from: 'Matisa',
  });
}
```

---

### 5. CAPACITOR — Wrap Web App as Native Mobile App
**What it does:** Takes your React web app and wraps it as a native iOS/Android app
**Cost:** Free (open source)
**Why you need it:** You need to be in the App Store and Play Store. Capacitor gives you native APIs (camera, push notifications, geolocation, haptics) while keeping your React codebase.
**Alternative:** Cordova (older, less maintained), React Native (would require rewriting UI), Flutter (would require rewriting everything)

**Why Capacitor is right for Matisa:**
- You already built a React web app
- Capacitor lets you keep 95% of your code
- You get native APIs through plugins
- Faster iteration than React Native
- One codebase for web + iOS + Android

**Setup:**
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

npx cap init Matisa com.matisa.app --web-dir dist
npx cap add ios
npx cap add android

# Essential plugins
npm install @capacitor/push-notifications
npm install @capacitor/geolocation
npm install @capacitor/camera
npm install @capacitor/filesystem
npm install @capacitor/preferences
npm install @capacitor/share
npm install @capacitor/haptics
npm install @capacitor/status-bar
npm install @capacitor/splash-screen
npm install @capacitor/app
npm install @capacitor/keyboard
npm install @capacitor/local-notifications
npm install @capacitor/network
npm install @capacitor/screen-orientation
npm install @capacitor/browser
npm install @capacitor/clipboard
npm install @capacitor/toast
```

**Critical Capacitor Plugins for Matisa:**

| Plugin | Why You Need It |
|--------|----------------|
| `@capacitor/push-notifications` | FCM push notifications on native |
| `@capacitor/geolocation` | GPS for "nearby people/events" |
| `@capacitor/camera` | Take photos for stories/avatars |
| `@capacitor/filesystem` | Save voice notes locally before upload |
| `@capacitor/preferences` | Store auth tokens, settings locally |
| `@capacitor/share` | Share notes/events to other apps |
| `@capacitor/haptics` | Vibration feedback on interactions |
| `@capacitor/status-bar` | Control status bar color (match dark mode) |
| `@capacitor/splash-screen` | Branded splash screen on launch |
| `@capacitor/app` | Handle app state (background/foreground) |
| `@capacitor/keyboard` | Handle keyboard appearance (adjust UI) |
| `@capacitor/local-notifications` | Schedule event reminders |
| `@capacitor/network` | Detect offline/online state |
| `@capacitor/screen-orientation` | Lock to portrait mode |

**Build & Deploy:**
```bash
# Build web app
npm run build

# Sync to native projects
npx cap sync

# Open in Xcode for iOS
npx cap open ios

# Open in Android Studio for Android
npx cap open android

# Build release versions in Xcode/Android Studio
# Upload to App Store Connect / Google Play Console
```

---

## TIER 2: HIGHLY RECOMMENDED (Ship Without = Feels Amateur)

### 6. OPENAI API — Voice Transcription & Content Moderation
**What it does:** Whisper transcribes voice notes to text. Moderation API flags harmful content.
**Cost:** Whisper: $0.006/minute. Moderation: free.
**Why you need it:**
- Voice-to-text makes voice notes accessible (deaf users, quiet environments)
- Searchability: users can search through transcribed voice content
- Content moderation keeps the platform safe

**Integration:**
```typescript
// Edge function: transcribe-voice
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeVoice(audioUrl: string) {
  const response = await fetch(audioUrl);
  const blob = await response.blob();

  const transcription = await openai.audio.transcriptions.create({
    file: blob,
    model: 'whisper-1',
    language: 'en',
  });

  return transcription.text;
}

// Edge function: moderate-content
export async function moderateContent(text: string) {
  const moderation = await openai.moderations.create({ input: text });
  return {
    isSafe: !moderation.results[0].flagged,
    flags: moderation.results[0].categories,
  };
}
```

**Note:** OpenAI doesn't officially support Oshiwambo/Afrikaans transcription yet. For local languages, consider:
- Google Cloud Speech-to-Text (supports Afrikaans)
- Building a custom model (future)
- Fallback to manual transcription for now

---

### 7. CLOUDINARY — Media Processing & Optimization
**What it does:** Automatically compresses, resizes, and optimizes images and videos
**Cost:** Free tier: 25GB storage, 25GB bandwidth. Then ~$25/month for 100GB.
**Why you need it:**
- Users upload huge photos from their phones
- You need multiple sizes (thumbnail, feed, full)
- Automatic WebP conversion saves 30-50% bandwidth
- Face detection for avatar cropping
- Video transcoding for stories

**Why not just Supabase Storage:**
- Supabase Storage is raw storage — no processing
- Cloudinary handles the entire media pipeline
- You can still use Supabase Storage as a backup

**Integration:**
```typescript
// Upload with transformation
const formData = new FormData();
formData.append('file', imageFile);
formData.append('upload_preset', 'matisa_uploads');

const response = await fetch('https://api.cloudinary.com/v1_1/your-cloud/image/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
// data.secure_url = optimized image URL
// data.eager[0].secure_url = thumbnail URL
```

**Transformations You Need:**
```
// Avatar: 200x200, face detection, circular crop
https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_thumb,g_face,r_max/avatar.jpg

// Feed image: 800x1200, auto-quality
https://res.cloudinary.com/demo/image/upload/w_800,h_1200,c_fill,q_auto/feed.jpg

// Story: 1080x1920, 9:16 aspect
https://res.cloudinary.com/demo/image/upload/w_1080,h_1920,c_fill/story.jpg

// Thumbnail: 300x300, low quality for data saver
https://res.cloudinary.com/demo/image/upload/w_300,h_300,c_fill,q_30/thumb.jpg
```

**Alternative:** Uploadcare (simpler), Imgix (more expensive, more powerful)

---

### 8. SENTRY — Error Tracking & Crash Reporting
**What it does:** Captures JavaScript errors, crashes, and performance issues
**Cost:** Free tier: 5,000 errors/month, 1 user. Then $26/month.
**Why you need it:** When your app crashes in production, you need to know WHY. Sentry shows you the exact line of code, the user's actions leading up to the crash, and how many users are affected.

**Integration:**
```typescript
// main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Alternative:** LogRocket (session replay + error tracking), Bugsnag

---

### 9. POSTHOG — Product Analytics
**What it does:** Tracks user behavior: which screens they visit, where they drop off, what they click
**Cost:** Free tier: 1M events/month. Generous.
**Why you need it:** You need to know if users are actually using voice rooms, or if they open the app and immediately close it. PostHog gives you funnels, retention curves, and heatmaps.

**Events to Track:**
```typescript
posthog.capture('note_created', { type: 'voice', has_image: false });
posthog.capture('room_joined', { room_type: 'karaoke', listener_count: 45 });
posthog.capture('event_rsvp', { event_type: 'concert', price: 100 });
posthog.capture('profile_viewed', { source: 'feed', mutual_friends: 3 });
posthog.capture('voice_note_played', { duration: 45, completion_rate: 0.8 });
```

**Alternative:** Mixpanel (more expensive, better UI), Amplitude (enterprise-focused)

---

### 10. MAPLIBRE GL (Already in deps) — Maps & Location
**What it does:** Open-source maps for showing event locations, nearby people
**Cost:** Free (self-hosted or use MapTiler free tier)
**Why you need it:** Users need to see WHERE events are happening and WHERE people are located.

**Note:** You already have MapLibre in your package.json. Just configure it:
```typescript
import maplibregl from 'maplibre-gl';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/streets/style.json?key=YOUR_KEY',
  center: [17.0658, -22.5609], // Windhoek
  zoom: 12,
});

// Add user markers
profiles.forEach(profile => {
  new maplibregl.Marker({ color: '#00D9C0' })
    .setLngLat([profile.longitude, profile.latitude])
    .setPopup(new maplibregl.Popup().setText(profile.display_name))
    .addTo(map);
});
```

**Alternative:** Google Maps (expensive, better data), Mapbox (expensive, better styling)

---

## TIER 3: NICE TO HAVE (Add After Launch)

### 11. ONESIGNAL — Advanced Push Notifications
**What it does:** Cross-platform push notifications with segmentation, A/B testing, and in-app messaging
**Cost:** Free tier: unlimited notifications, 10K subscribers
**Why you might want it:** More powerful than raw FCM. You can send targeted notifications like "People in Windhoek who like music — new room starting now!"

**When to add:** When you have 1,000+ users and need sophisticated notification campaigns.

---

### 12. BRANCH.IO — Deep Linking
**What it does:** When someone shares a note or event link, tapping it opens the app directly to that content (not the homepage)
**Cost:** Free tier: up to 10K MAU
**Why you need it:** "Check out this event!" links should open the event details, not the app store.

**Example:**
```
matisa.app/event/abc123 → Opens app to event page
matisa.app/room/xyz789 → Opens app and joins room
matisa.app/note/def456 → Opens app to note
```

**Alternative:** Firebase Dynamic Links (being deprecated), native Universal Links / App Links

---

### 13. STRIPE — Payments for Events
**What it does:** Process payments for paid events
**Cost:** 2.9% + $0.30 per transaction
**Why you might want it:** If you allow event organizers to charge for tickets.

**When to add:** After you have 50+ events per month and users ask for paid ticketing.

**Alternative:** PayPal, local Namibian payment gateways

---

### 14. UPSTASH REDIS — Caching & Rate Limiting
**What it does:** In-memory cache for hot data (trending content, user sessions)
**Cost:** Free tier: 10K requests/day
**Why you might want it:** When your feed queries get slow with 10K+ users, Redis caches the results.

**When to add:** When you hit performance issues. Not needed for beta.

---

### 15. LOGROCKET — Session Replay
**What it does:** Records user sessions so you can watch exactly what they did before a bug
**Cost:** Free tier: 1,000 sessions/month
**Why you might want it:** "User says the app crashed" → watch the replay to see exactly what happened.

**When to add:** When you're debugging tricky UX issues.

---

## THE COMPLETE STACK VISUALIZED

```
┌─────────────────────────────────────────────────────────────┐
│                    USER DEVICE (iOS/Android)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Capacitor  │  │  LiveKit    │  │  FCM Push Notifs    │  │
│  │  (Native    │  │  (Voice     │  │  (Background        │  │
│  │   Wrapper)  │  │   Rooms)    │  │   Alerts)           │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                    │              │
│  ┌──────┴────────────────┴────────────────────┴──────────┐  │
│  │              REACT APP (Your Matisa UI)                │  │
│  │  • Glassmorphism components                            │  │
│  │  • Voice waveform visualization                        │  │
│  │  • Dark mode + light mode                              │  │
│  │  • Feed cards, profile, messaging                      │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SUPABASE (Backend Platform)             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐  │   │
│  │  │ PostgreSQL│ │  Auth    │ │  Storage (Media)    │  │   │
│  │  │ (Schema)  │ │ (Phone   │ │  (Avatars, Voice,   │  │   │
│  │  │           │ │  OTP)    │ │   Stories)          │  │   │
│  │  └──────────┘ └──────────┘ └─────────────────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐  │   │
│  │  │ Realtime │ │  Edge    │ │  Row Level Security │  │   │
│  │  │ (Live    │ │  Functions│ │  (Privacy)          │  │   │
│  │  │  Updates)│ │  (API)    │ │                     │  │   │
│  │  └──────────┘ └──────────┘ └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────┼─────────────────────────────┐ │
│  │      3RD PARTY SERVICES │                             │ │
│  │  ┌────────────┐ ┌────────────┐ ┌─────────────────┐   │ │
│  │  │ LiveKit    │ │ Africa's   │ │ Cloudinary      │   │ │
│  │  │ (WebRTC    │ │ Talking    │ │ (Media          │   │ │
│  │  │  Audio)    │ │ (SMS OTP)  │ │  Processing)    │   │ │
│  │  └────────────┘ └────────────┘ └─────────────────┘   │ │
│  │  ┌────────────┐ ┌────────────┐ ┌─────────────────┐   │ │
│  │  │ OpenAI     │ │ Sentry     │ │ PostHog         │   │ │
│  │  │ (Whisper   │ │ (Error     │ │ (Analytics)     │   │ │
│  │  │  + Moderate│ │  Tracking) │ │                 │   │ │
│  │  └────────────┘ └────────────┘ └─────────────────┘   │ │
│  │  ┌────────────┐ ┌────────────┐                        │ │
│  │  │ MapLibre   │ │ FCM        │                        │ │
│  │  │ (Maps)     │ │ (Push)     │                        │ │
│  │  └────────────┘ └────────────┘                        │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

---

## MONTHLY COST ESTIMATE (Beta Phase: ~500 Users)

| Service | Cost/Month | Notes |
|---------|-----------|-------|
| Supabase (Pro) | $25 | 8GB DB, 100GB storage, 2M edge invocations |
| LiveKit (Cloud) | $0-10 | 50 concurrent free, then pay-per-use |
| Africa's Talking | $5-15 | ~1,000-3,000 SMS/month |
| Cloudinary | $0 | Free tier covers beta |
| OpenAI API | $5-20 | Whisper transcription + moderation |
| Sentry | $0 | Free tier covers beta |
| PostHog | $0 | Free tier covers beta |
| FCM | $0 | Always free |
| MapTiler | $0 | Free tier covers beta |
| App Store | $99/year | Apple Developer Program |
| Play Store | $25 one-time | Google Developer Account |
| **TOTAL** | **~$35-75/month** | Very affordable for beta |

---

## SETUP CHECKLIST

### Week 1: Foundation
- [ ] Apply database schema to Supabase
- [ ] Seed mock data
- [ ] Configure Supabase Auth (Phone OTP)
- [ ] Set up Africa's Talking account
- [ ] Add Capacitor to project
- [ ] Install all Capacitor plugins

### Week 2: Core Features
- [ ] Integrate LiveKit for voice rooms
- [ ] Set up FCM for push notifications
- [ ] Configure Cloudinary for media
- [ ] Integrate OpenAI Whisper
- [ ] Set up Sentry for error tracking

### Week 3: Polish
- [ ] Configure MapLibre for location
- [ ] Set up PostHog analytics
- [ ] Test on real iOS/Android devices
- [ ] Optimize for data saver mode
- [ ] Add light mode

### Week 4: Launch Prep
- [ ] Build release versions (iOS + Android)
- [ ] Submit to App Store (review takes 1-7 days)
- [ ] Submit to Play Store (review takes 1-3 days)
- [ ] Set up beta testing (TestFlight + Play Console Internal Testing)
- [ ] Invite 50 beta users in Windhoek

---

## THE ONE THING THAT MATTERS MOST

Out of all these services, **Capacitor + LiveKit + FCM** are the difference between "a website that looks like an app" and "a real native app."

- **Capacitor** gets you into the App Store and gives you native APIs
- **LiveKit** makes voice rooms actually work (not just a UI mockup)
- **FCM** makes the app feel alive even when it's closed

Everything else is optimization. Those three are transformation.
