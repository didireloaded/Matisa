
# MATISA UI IMPLEMENTATION GUIDE
## How to Match the Behance Reference 100% While Keeping It Matisa

---

## THE CORE PROBLEM

The Behance reference is a **TikTok-style short-form video streaming app**.
Matisa is a **hyper-local social platform** with voice rooms, notes, events, and messaging.

You want the **visual language** of the reference (glassmorphism, dark mode, teal accents, rounded corners, full-bleed media) but applied to **Matisa's features** (not TikTok's features).

This is 100% doable. Here's how.

---

## PART 1: DECONSTRUCT THE REFERENCE UI

### Visual DNA of the Reference Screens

| Element | What It Looks Like | How to Replicate |
|---------|-------------------|------------------|
| **Background** | Pure black `#000000` with subtle gradient overlays | `bg-black` or `bg-[#000000]` |
| **Glassmorphism Cards** | Frosted glass with `backdrop-blur-md`, semi-transparent white border, subtle inner glow | `backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl` |
| **Primary Accent** | Teal/Cyan `#00D9C0` to `#00B4D8` gradient | `bg-gradient-to-r from-[#00D9C0] to-[#00B4D8]` |
| **Secondary Accent** | Pink/Magenta `#E94560` to `#FF6B6B` | `bg-gradient-to-r from-[#E94560] to-[#FF6B6B]` |
| **Text** | White `#FFFFFF` with subtle text shadow | `text-white drop-shadow-md` |
| **Secondary Text** | Gray `#888888` to `#AAAAAA` | `text-gray-400` |
| **Rounded Corners** | Heavy rounding — cards `rounded-2xl`, buttons `rounded-full`, avatars `rounded-full` | Consistent `rounded-2xl` for cards, `rounded-full` for buttons/avatars |
| **Bottom Nav** | Floating pill shape with glassmorphism, centered create button | `fixed bottom-4 left-4 right-4 h-16 backdrop-blur-xl bg-black/40 rounded-full border border-white/10` |
| **Engagement Stack** | Right-side vertical stack of circular buttons with icons | `absolute right-4 bottom-20 flex flex-col gap-4` |
| **Video Overlay** | Full-bleed video with gradient scrim at bottom for text readability | `absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent` |
| **Status Bars** | iOS-style status bar, custom header with back button and title | `safe-area-inset-top` padding |
| **Typography** | Clean sans-serif (Inter or SF Pro), bold headings, regular body | `font-sans font-bold` for headings |

---

## PART 2: THE "MATISA-IFY" STRATEGY

### Rule: Same Visual Language, Different Content

The reference shows **videos**. Matisa shows **people, notes, rooms, events**.
Keep the **container** (glassmorphism, dark mode, teal accents). Replace the **content** inside.

---

### SCREEN-BY-SCREEN TRANSLATION

#### 1. HOME FEED (Reference: Vertical Video Feed → Matisa: Unified Social Feed)

**Reference Structure:**
```
[Full-bleed video]
[Gradient overlay at bottom]
[Left: User avatar + username + caption]
[Right: Like, Comment, Share, Profile pic stack]
[Bottom: Music ticker + comment input]
```

**Matisa Structure (Same Visual Language):**
```
[Full-bleed gradient background card]
[Glassmorphism overlay]
[Left: Content — Note text / Room info / Event card]
[Right: Action buttons — Like, Reply, Share, Save]
[Bottom: Author info + location tag + timestamp]
```

**Implementation:**

```tsx
// MatisaFeedCard.tsx
export function MatisaFeedCard({ item }: { item: FeedItem }) {
  return (
    <div className="relative w-full h-[85vh] bg-black overflow-hidden rounded-none">
      {/* Background: Gradient or Media */}
      {item.type === 'note' && item.gradient_background ? (
        <div 
          className="absolute inset-0" 
          style={{ background: item.gradient_background }}
        />
      ) : item.type === 'room' && item.room_image_url ? (
        <img 
          src={item.room_image_url} 
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
        />
      ) : item.type === 'event' && item.cover_image_url ? (
        <img 
          src={item.cover_image_url} 
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f0f]" />
      )}

      {/* Darkening overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Content Area (Left side, bottom) */}
      <div className="absolute bottom-24 left-4 right-20 z-10">
        {/* Author Row */}
        <div className="flex items-center gap-2 mb-3">
          <img 
            src={item.author.avatar_url} 
            className="w-10 h-10 rounded-full border-2 border-white/20"
            alt=""
          />
          <div>
            <p className="text-white font-semibold text-sm">{item.author.display_name}</p>
            <p className="text-gray-400 text-xs">@{item.author.username}</p>
          </div>
          <button className="ml-auto px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-medium">
            Follow
          </button>
        </div>

        {/* Content */}
        {item.type === 'note' && (
          <p className="text-white text-base leading-relaxed mb-2">
            {item.content}
          </p>
        )}
        {item.type === 'room' && (
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-medium">LIVE</span>
              <span className="text-gray-400 text-xs">{item.listener_count} listening</span>
            </div>
            <p className="text-white text-lg font-bold">{item.title}</p>
            <p className="text-gray-300 text-sm">{item.description}</p>
          </div>
        )}
        {item.type === 'event' && (
          <div className="mb-2">
            <p className="text-white text-lg font-bold">{item.title}</p>
            <p className="text-gray-300 text-sm">{item.location_name}</p>
            <p className="text-teal-400 text-sm">{formatDate(item.start_at)}</p>
          </div>
        )}

        {/* Location Tag */}
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <MapPin className="w-3 h-3" />
          <span>{item.location_city}</span>
          <span>•</span>
          <span>{formatTimeAgo(item.created_at)}</span>
        </div>
      </div>

      {/* Action Stack (Right side) — EXACTLY like reference */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-10">
        {/* Like */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">{item.like_count}</span>
        </button>

        {/* Reply/Comment */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">{item.reply_count}</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">{item.share_count}</span>
        </button>

        {/* Save/Bookmark */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Author Avatar (spinning disc like reference) */}
        <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden animate-spin-slow">
          <img src={item.author.avatar_url} className="w-full h-full object-cover" alt="" />
        </div>
      </div>

      {/* Bottom Comment Input */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400 text-sm flex-1">Add a comment...</span>
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-gray-400" />
            <Send className="w-5 h-5 text-teal-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Key:** Same full-bleed card, same right-side action stack, same glassmorphism, same bottom input — but the **content** is a note/room/event instead of a video.

---

#### 2. BOTTOM NAVIGATION (Reference: Floating Glass Pill → Matisa: Same)

**Reference:** Floating pill at bottom with 5 icons, center button is larger and highlighted.

**Matisa:** Same exact design. Just different icons.

```tsx
// BottomNav.tsx
export function BottomNav() {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: null, label: 'Create', path: '/create', isCenter: true },
    { icon: Mic, label: 'Rooms', path: '/rooms' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div className="h-16 backdrop-blur-xl bg-black/40 rounded-full border border-white/10 flex items-center justify-around px-2 shadow-2xl shadow-black/50">
        {navItems.map((item) => (
          item.isCenter ? (
            <button 
              key={item.label}
              className="w-14 h-14 -mt-6 rounded-full bg-gradient-to-r from-[#00D9C0] to-[#00B4D8] flex items-center justify-center shadow-lg shadow-teal-500/30 border-2 border-white/20"
            >
              <Plus className="w-7 h-7 text-white" />
            </button>
          ) : (
            <button key={item.label} className="flex flex-col items-center gap-1 p-2">
              <item.icon className="w-6 h-6 text-gray-400" />
              <span className="text-[10px] text-gray-500">{item.label}</span>
            </button>
          )
        ))}
      </div>
    </nav>
  );
}
```

---

#### 3. PROFILE SCREEN (Reference: Grid + Header → Matisa: Same Structure)

**Reference:** Cover image, avatar, stats row, action buttons, content grid.

**Matisa:** Identical layout. Just change "Videos" tab to "Posts" (combining notes + voice + stories).

```tsx
// ProfileScreen.tsx
export function ProfileScreen({ profile }: { profile: Profile }) {
  return (
    <div className="min-h-screen bg-black">
      {/* Cover Image */}
      <div className="relative h-48">
        <img src={profile.cover_url} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Avatar (overlapping cover) */}
      <div className="relative -mt-16 px-4">
        <div className="relative">
          <img 
            src={profile.avatar_url} 
            className="w-32 h-32 rounded-full border-4 border-black object-cover"
            alt=""
          />
          {profile.is_verified && (
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-black" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 mt-3">
        <h1 className="text-white text-xl font-bold">{profile.display_name}</h1>
        <p className="text-gray-400 text-sm">@{profile.username}</p>
        <p className="text-gray-300 text-sm mt-2">{profile.bio}</p>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-400 text-xs mt-2">
          <MapPin className="w-3 h-3" />
          <span>{profile.location_city}, {profile.location_country}</span>
        </div>

        {/* Voice Intro Button */}
        {profile.voice_intro_url && (
          <button className="mt-3 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
            <Play className="w-4 h-4 text-teal-400" />
            <span className="text-white text-sm">Play Voice Intro</span>
            <span className="text-gray-400 text-xs">{profile.voice_intro_duration}s</span>
          </button>
        )}

        {/* Stats */}
        <div className="flex items-center justify-around mt-4 py-3 border-y border-white/10">
          <div className="text-center">
            <p className="text-white font-bold">{profile.follower_count}</p>
            <p className="text-gray-400 text-xs">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold">{profile.following_count}</p>
            <p className="text-gray-400 text-xs">Following</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold">{profile.note_count}</p>
            <p className="text-gray-400 text-xs">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold">{profile.master_score}</p>
            <p className="text-gray-400 text-xs">Score</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button className="flex-1 py-2.5 bg-gradient-to-r from-[#00D9C0] to-[#00B4D8] rounded-full text-black font-semibold text-sm">
            Follow
          </button>
          <button className="flex-1 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white font-semibold text-sm">
            Message
          </button>
          <button className="w-10 h-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center">
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mt-6 border-b border-white/10">
        {['Posts', 'Events', 'Saved'].map((tab) => (
          <button 
            key={tab}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === tab ? 'text-white border-b-2 border-teal-400' : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-1 p-1">
        {posts.map((post) => (
          <div key={post.id} className="aspect-square bg-gray-900 rounded-lg overflow-hidden relative">
            {post.type === 'note' ? (
              <div 
                className="w-full h-full flex items-center justify-center p-2"
                style={{ background: post.gradient_background }}
              >
                <p className="text-white text-xs line-clamp-4">{post.content}</p>
              </div>
            ) : post.type === 'voice' ? (
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
                <Mic className="w-8 h-8 text-white/50" />
              </div>
            ) : (
              <img src={post.media_url} className="w-full h-full object-cover" alt="" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

#### 4. DISCOVER/EXPLORE (Reference: Category Pills + Grid → Matisa: Same)

```tsx
// ExploreScreen.tsx
export function ExploreScreen() {
  const categories = ['All', 'Rooms', 'Events', 'People', 'Notes', 'Music'];

  return (
    <div className="min-h-screen bg-black pt-14">
      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400 text-sm flex-1">Search Matisa...</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button 
            key={cat}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              activeCategory === cat 
                ? 'bg-gradient-to-r from-[#00D9C0] to-[#00B4D8] text-black' 
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {items.map((item) => (
          <div key={item.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            <img src={item.image_url} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white font-semibold text-sm">{item.title}</p>
              <p className="text-gray-300 text-xs">{item.subtitle}</p>
            </div>
            {item.type === 'room' && item.is_live && (
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded-full">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-white text-[10px] font-bold">LIVE</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

#### 5. MESSAGING (Reference: Gradient Bubbles → Matisa: Same)

Your chat screen (17) already matches the reference beautifully. Keep it exactly as is.

```tsx
// The gradient message bubbles from your screenshot:
// Sender: gradient from pink to purple
// Receiver: dark gray with subtle border
// Voice notes: waveform with play button
// Reactions: emoji below messages
```

Just ensure:
- Sender bubbles use `bg-gradient-to-br from-[#E94560] to-[#9D4EDD]`
- Receiver bubbles use `bg-white/5 backdrop-blur-md border border-white/10`
- Voice notes show waveform visualization
- Timestamps are subtle gray text

---

#### 6. CREATE SHEET (Reference: Bottom Sheet → Matisa: Same)

```tsx
// CreateSheet.tsx
export function CreateSheet({ isOpen, onClose }: Props) {
  const options = [
    { icon: Mic, label: 'Record Voice', color: 'from-teal-400 to-cyan-400' },
    { icon: FileText, label: 'Write Note', color: 'from-blue-400 to-indigo-400' },
    { icon: Radio, label: 'Start Room', color: 'from-purple-400 to-pink-400' },
    { icon: Calendar, label: 'Create Event', color: 'from-orange-400 to-red-400' },
    { icon: Image, label: 'Add Story', color: 'from-green-400 to-emerald-400' },
  ];

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <div className="bg-black/95 backdrop-blur-xl rounded-t-3xl p-6">
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
        <h2 className="text-white text-lg font-bold mb-6">Create</h2>
        <div className="grid grid-cols-3 gap-4">
          {options.map((opt) => (
            <button key={opt.label} className="flex flex-col items-center gap-2">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${opt.color} flex items-center justify-center shadow-lg`}>
                <opt.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-gray-300 text-xs">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
```

---

## PART 3: GLOBAL STYLES & TOKENS

### Tailwind Config Extensions

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        matisa: {
          black: '#000000',
          dark: '#0a0a0a',
          card: '#111111',
          teal: '#00D9C0',
          cyan: '#00B4D8',
          pink: '#E94560',
          magenta: '#FF6B6B',
        }
      },
      backgroundImage: {
        'gradient-teal': 'linear-gradient(135deg, #00D9C0 0%, #00B4D8 100%)',
        'gradient-pink': 'linear-gradient(135deg, #E94560 0%, #FF6B6B 100%)',
        'gradient-dark': 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-teal': '0 0 20px rgba(0, 217, 192, 0.3)',
        'glow-pink': '0 0 20px rgba(233, 69, 96, 0.3)',
      }
    }
  }
}
```

### Global CSS

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-black text-white antialiased;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  /* Hide scrollbar but keep functionality */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Glassmorphism utility */
  .glass {
    @apply bg-white/5 backdrop-blur-md border border-white/10;
  }

  .glass-strong {
    @apply bg-white/10 backdrop-blur-xl border border-white/20;
  }
}

@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-gradient-to-r from-matisa-teal to-matisa-cyan rounded-full text-black font-semibold shadow-glow-teal;
  }

  .btn-secondary {
    @apply px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white font-semibold;
  }

  .card-glass {
    @apply bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl;
  }

  .input-glass {
    @apply bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-3 text-white placeholder-gray-500;
  }
}
```

---

## PART 4: CRITICAL UI RULES

### DO:
- ✅ Use `bg-black` as the base background everywhere
- ✅ Use `backdrop-blur-md` + `bg-white/5` + `border-white/10` for ALL cards
- ✅ Use the teal gradient (`#00D9C0` → `#00B4D8`) for primary actions
- ✅ Use the pink gradient (`#E94560` → `#FF6B6B`) for secondary/emphasis
- ✅ Round EVERYTHING — cards `rounded-2xl`, buttons `rounded-full`, avatars `rounded-full`
- ✅ Add gradient scrims (`bg-gradient-to-t from-black/80`) behind text on images
- ✅ Use subtle text shadows for readability: `drop-shadow-md`
- ✅ Keep text hierarchy: white for primary, gray-400 for secondary, gray-500 for tertiary
- ✅ Use the floating pill bottom nav with glassmorphism
- ✅ Make the center create button larger with glow shadow

### DON'T:
- ❌ Use solid white backgrounds (breaks the dark aesthetic)
- ❌ Use sharp corners (breaks the soft, modern feel)
- ❌ Use default browser scrollbars (customize or hide)
- ❌ Place text directly on bright images without a scrim
- ❌ Use more than 2 accent colors (teal + pink only)
- ❌ Make buttons flat — always use gradients or glassmorphism
- ❌ Use system default fonts — stick to Inter or SF Pro
- ❌ Forget safe area insets for iOS notch/home indicator

---

## PART 5: THE "MATISA" BRAND INJECTION

To keep it feeling like Matisa (not a generic TikTok clone), inject these brand moments:

### 1. The Voice Waveform
Everywhere there's audio, show a **custom waveform** instead of a generic progress bar:
```tsx
<VoiceWaveform 
  audioUrl={voiceUrl} 
  color="from-teal-400 to-cyan-400"
  height={40}
/>
```

### 2. The "Namibia" Location Badge
Every piece of content shows a subtle location tag:
```tsx
<div className="flex items-center gap-1 px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full">
  <MapPin className="w-3 h-3 text-teal-400" />
  <span className="text-teal-400 text-[10px]">Windhoek</span>
</div>
```

### 3. The Master Score Badge
On profiles, show the composite score as a subtle ring:
```tsx
<div className="relative w-10 h-10">
  <svg className="w-full h-full -rotate-90">
    <circle cx="20" cy="20" r="18" stroke="white/10" strokeWidth="2" fill="none" />
    <circle cx="20" cy="20" r="18" stroke="url(#gradient)" strokeWidth="2" fill="none" 
      strokeDasharray={`${score * 1.13} 113`} />
  </svg>
  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
    {score}
  </span>
</div>
```

### 4. The "Live" Pulse
For live rooms, use a distinctive animation:
```tsx
<div className="flex items-center gap-1.5">
  <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
  </span>
  <span className="text-red-400 text-xs font-bold tracking-wider">LIVE</span>
</div>
```

### 5. The Matisa Logo/Wordmark
Use a custom logo (not generic icons) in:
- Splash screen
- Auth screens
- Empty states
- Share previews

---

## SUMMARY: THE FORMULA

```
REFERENCE UI CONTAINER
+ MATISA CONTENT
+ MATISA BRAND MOMENTS
= 100% MATCHED LOOK, 100% MATISA FEEL
```

The reference gives you:
- Color palette (black + teal + pink)
- Component shapes (rounded, glassmorphism)
- Layout patterns (full-bleed cards, right-side stacks, floating nav)
- Typography hierarchy (white bold, gray regular)

You inject:
- Matisa features (notes, rooms, events, not videos)
- Matisa brand (voice waveforms, location badges, master scores)
- Matisa personality (casual, local, human)

That's how you get 100% visual match while keeping it Matisa.
