# MATISA — ROUTE FIX & COMPONENT PACK

## What This Fixes

1. **Broken routes** (`/chat`, `/notifications`, `/note/:id`, `/event/:id`) now render proper pages instead of falling through to Home
2. **Unstyled bottom nav** replaced with glassmorphism pill matching the reference UI
3. **Missing back buttons** added to all non-home screens
4. **404 page** added for unmatched routes
5. **Markdown rendering** — all components use proper JSX with Tailwind, no raw markdown text
6. **No pulsing animations** — static red dot with glow shadow for live indicators

---

## Files Included

| File | Where to Put | Purpose |
|------|-------------|---------|
| `App.tsx` | `src/App.tsx` | Fixed router with all routes defined |
| `AppLayout.tsx` | `src/layouts/AppLayout.tsx` | Layout wrapper with back button + bottom nav |
| `BottomNav.tsx` | `src/components/BottomNav.tsx` | Glassmorphism floating pill nav |
| `NoteDetail.tsx` | `src/pages/NoteDetail.tsx` | Note detail page with replies |
| `EventDetail.tsx` | `src/pages/EventDetail.tsx` | Event detail with RSVP buttons |
| `Inbox.tsx` | `src/pages/Inbox.tsx` | Messages list with conversation cards |
| `ChatRoom.tsx` | `src/pages/ChatRoom.tsx` | Chat room with gradient bubbles |
| `Notifications.tsx` | `src/pages/Notifications.tsx` | Activity feed with type icons |
| `NotFound.tsx` | `src/pages/NotFound.tsx` | 404 page with home button |
| `ExploreRooms.tsx` | `src/pages/ExploreRooms.tsx` | Live rooms list |
| `ExploreEvents.tsx` | `src/pages/ExploreEvents.tsx` | Events grid |
| `ExplorePeople.tsx` | `src/pages/ExplorePeople.tsx` | People discovery cards |
| `vercel.json` | `vercel.json` (project root) | SPA routing fix for Vercel |

---

## Installation Steps

### Step 1: Replace Your Router

**Backup your current `src/App.tsx` first.**

Copy the new `App.tsx` to `src/App.tsx`.

Make sure you have `react-router-dom` installed:
```bash
npm install react-router-dom
```

### Step 2: Create Missing Folders

```bash
mkdir -p src/layouts
mkdir -p src/components
mkdir -p src/pages
```

### Step 3: Copy All Files

Copy each file to its destination:
```bash
# Layout
cp AppLayout.tsx src/layouts/AppLayout.tsx

# Components
cp BottomNav.tsx src/components/BottomNav.tsx

# Pages
cp NoteDetail.tsx src/pages/NoteDetail.tsx
cp EventDetail.tsx src/pages/EventDetail.tsx
cp Inbox.tsx src/pages/Inbox.tsx
cp ChatRoom.tsx src/pages/ChatRoom.tsx
cp Notifications.tsx src/pages/Notifications.tsx
cp NotFound.tsx src/pages/NotFound.tsx
cp ExploreRooms.tsx src/pages/ExploreRooms.tsx
cp ExploreEvents.tsx src/pages/ExploreEvents.tsx
cp ExplorePeople.tsx src/pages/ExplorePeople.tsx
```

### Step 4: Add vercel.json

Copy `vercel.json` to your project root (same level as `package.json`).

This fixes the "refresh 404" bug where reloading `/explore` shows a Vercel 404.

### Step 5: Install Lucide Icons

```bash
npm install lucide-react
```

All components use Lucide icons (consistent style, no mixing).

### Step 6: Update Your Existing Pages

Your existing `Home.tsx`, `Explore.tsx`, `Rooms.tsx`, `Profile.tsx`, `Auth.tsx`, `Onboarding.tsx`, `Settings.tsx` should still work. But check that they:

1. **Don't render raw markdown** (`##`, `###`) — use proper JSX headings
2. **Wrap content in `px-4`** so text doesn't touch screen edges
3. **Use the glassmorphism style** consistently (`bg-[#111111]`, `border-white/[0.06]`, `rounded-2xl`)

### Step 7: Build & Deploy

```bash
npm run build

# If using Capacitor
npx cap sync

# Deploy to Vercel
vercel --prod
```

---

## Route Map (After Fix)

| URL | Page | Status |
|-----|------|--------|
| `/` | Home | ✅ Works |
| `/explore` | Explore | ✅ Works |
| `/explore/rooms` | ExploreRooms | ✅ NEW |
| `/explore/events` | ExploreEvents | ✅ NEW |
| `/explore/people` | ExplorePeople | ✅ NEW |
| `/rooms` | Rooms | ✅ Works |
| `/room/:roomId` | RoomDetail | ✅ Works |
| `/karaoke/:roomId` | KaraokeRoom | ✅ Works |
| `/note/:noteId` | NoteDetail | ✅ FIXED |
| `/event/:eventId` | EventDetail | ✅ FIXED |
| `/chat` | Inbox | ✅ FIXED |
| `/chat/:conversationId` | ChatRoom | ✅ FIXED |
| `/notifications` | Notifications | ✅ FIXED |
| `/profile` | Profile | ✅ Works |
| `/profile/:username` | Profile | ✅ Works |
| `/auth` | Auth | ✅ Works |
| `/onboarding` | Onboarding | ✅ Works |
| `/settings` | Settings | ✅ Works |
| `*` | NotFound | ✅ NEW |

---

## Design Rules Enforced

### No AI-Coded Look
- ✅ **No pulsing dots** — static red dot with `shadow-[0_0_8px_rgba(239,68,68,0.6)]`
- ✅ **No random gradients** — max 4 background colors, used intentionally
- ✅ **Glassmorphism only where needed** — nav over content, not on empty backgrounds
- ✅ **Consistent corner radius** — `rounded-2xl` for cards, `rounded-full` for buttons/avatars
- ✅ **No markdown text** — all content is proper JSX with Tailwind classes
- ✅ **Skeleton loading** — no spinners (add skeletons to your async components)
- ✅ **Error states** — every page has a designed empty state

### Color Palette (Strict)
```
Background:     #000000 (pure black)
Surface:        #111111 (cards)
Surface raised: #1a1a1a (elevated cards)
Border:         rgba(255,255,255,0.06)
Text primary:   #ffffff
Text secondary: rgba(255,255,255,0.55)
Text tertiary:  rgba(255,255,255,0.35)
Accent teal:    #00D9C0
Accent pink:    #E94560
```

### Typography
- Headings: `font-bold`, white
- Body: `text-sm`, `leading-relaxed`
- Meta: `text-xs`, white/30 or white/40
- No markdown syntax anywhere

---

## Next Steps

1. **Replace your router** (`src/App.tsx`)
2. **Copy all new components**
3. **Add `vercel.json`**
4. **Deploy**
5. **Test every route** by typing URLs directly:
   - `https://matisa-q9lv.vercel.app/chat`
   - `https://matisa-q9lv.vercel.app/notifications`
   - `https://matisa-q9lv.vercel.app/note/123`
   - `https://matisa-q9lv.vercel.app/event/123`
6. **Verify no page falls through to Home**

---

## Troubleshooting

### "Module not found" errors
Make sure all imports match your actual file structure. If your pages are in `src/screens/` instead of `src/pages/`, update the imports in `App.tsx`.

### "useParams is not defined"
Add the import: `import { useParams } from 'react-router-dom';`

### Styles look wrong
Make sure Tailwind is configured with the custom colors. Add to `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      matisa: {
        black: '#000000',
        surface: '#111111',
        teal: '#00D9C0',
        pink: '#E94560',
      }
    }
  }
}
```

### Images not loading
The placeholder images use Unsplash. Replace with your own Supabase Storage URLs in production.

---

Built for Namibia. Built for people.
