# Matisa Architecture

Matisa is a hyper-local social platform designed exclusively for the Namibian market. Moving beyond legacy map-centric discovery (Radar), the platform is now built on the core principle: **"People are the content. Content is the interface."** 

It is a highly performant, production-ready web application built using modern React practices and the Supabase ecosystem, layered with an Invisible AI Intelligence engine.

## Tech Stack

*   **Frontend Framework:** React 19 + Vite (TypeScript)
*   **Routing:** React Router v6
*   **Styling & Design System:** TailwindCSS + Custom CSS Variables (`index.css` & `theme.ts`)
*   **Animations:** Framer Motion
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
*   **State Management:** Zustand + Context API
*   **Data Fetching:** Custom hooks wrapping Supabase JS client
*   **Live Audio/Video:** LiveKit (WebRTC) for Karaoke Rooms
*   **Testing:** Vitest + React Testing Library
*   **PWA Support:** Vite PWA Plugin

## Project Structure

```
matisa/
├── docs/              # Comprehensive Documentation
├── src/
│   ├── components/
│   │   ├── auth/      # Authentication modals and forms
│   │   ├── common/    # Reusable UI components
│   │   ├── feed/      # Social feed, Notes, and rich media posts
│   │   ├── karaoke/   # LiveKit WebRTC audio room components
│   │   ├── layout/    # Main app layout, Navigation bars
│   │   ├── live/      # Live streaming
│   │   ├── music/     # Music and playlist related components
│   │   ├── profile/   # Profile-related components
│   │   ├── stories/   # Stories view and creation
│   │   └── ui/        # Core UI base components (Dialogs, inputs)
│   ├── contexts/      # React Context providers (AuthContext)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions (Supabase client)
│   ├── pages/         # Page-level components corresponding to routes
│   ├── services/      # Abstraction layers (e.g., ai/ for Invisible AI)
│   ├── stores/        # Zustand global state stores
│   ├── types/         # Global TypeScript definitions
│   ├── App.tsx        # Application root and routing
│   ├── main.tsx       # Entry point
│   ├── index.css      # Global CSS and Design System tokens
│   └── setupTests.ts  # Vitest test setup
├── supabase/          # Supabase configuration, SQL Migrations, Edge Functions
```

## Core Product Pillars

1.  **People Discovery:** Replaced legacy radar maps with algorithm-driven people and social discovery.
2.  **Stories & Notes:** Ephemeral content (Stories) and text-first updates (Notes).
3.  **Karaoke Rooms:** Real-time WebRTC audio rooms.
4.  **Events:** Hyper-local event discovery and RSVPs.
5.  **Messaging:** Real-time 1:1 and group chat.
6.  **Creator Profiles:** Enhanced profiles for local creators.
7.  **Invisible AI Layer:** Provider-agnostic LLM orchestration for content moderation, feed ranking, and matchmaking.

## Design System

Matisa employs a premium "Sleek Dark Mode" aesthetic tailored to feel immersive and hyper-local.

*   **Color Palette:** Charcoal Black (`#0F0D0B`), Deep Brown (`#1C1814`), Namibian Sand/Orange (`#C8521A`), Oceans (`#2D7DD2`).
*   **Typography:** Modern sans-serif (`Geist`, `DM Sans`) and bold display fonts (`Syne`).
*   **Animations:** Micro-animations via Framer Motion for scaling, slide-ins, and tap effects.

## Data Fetching & Performance

*   **Real-time:** Supabase Realtime for Chat, Notifications, and Karaoke presence.
*   **Infinite Scrolling:** Cursor-based pagination.
*   **Code Splitting:** React `lazy` and `Suspense` chunking by route.

## Deployment

1.  **Frontend:** Deployed seamlessly to Vercel. Push to the `main` branch to trigger a build.
2.  **Backend:** Supabase migrations managed via the Supabase CLI (`supabase db push`).
3.  **Type Safety:** The build step runs `tsc --noEmit` to guarantee strict type safety.
