# Matisa Architecture

Matisa is a hyper-local social platform designed for the Namibian market. It is built as a highly performant, production-ready web application using modern React practices and the Supabase ecosystem.

## Tech Stack

*   **Frontend Framework:** React 19 + Vite (TypeScript)
*   **Routing:** React Router v6
*   **Styling & Design System:** TailwindCSS + Custom CSS Variables (`index.css` & `theme.ts`)
*   **Animations:** Framer Motion
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
*   **State Management:** Zustand + Context API
*   **Data Fetching:** Custom hooks wrapping Supabase JS client
*   **Testing:** Vitest + React Testing Library
*   **PWA Support:** Vite PWA Plugin

## Project Structure

```
matisa/
├── src/
│   ├── components/
│   │   ├── auth/      # Authentication modals and forms
│   │   ├── common/    # Reusable UI components (Avatar, PostCard, EmptyState, Skeleton)
│   │   ├── feed/      # Social feed components (Stories, Comments)
│   │   ├── karaoke/   # LiveKit WebRTC audio room components
│   │   ├── layout/    # Main app layout, Navigation bars
│   │   ├── music/     # Music and playlist related components
│   │   ├── profile/   # Profile-related components
│   │   ├── radar/     # Fullscreen Map/Radar discovery UI
│   │   └── ui/        # Core UI base components (Dialogs, inputs)
│   ├── contexts/      # React Context providers (AuthContext)
│   ├── hooks/         # Custom React hooks for data fetching and business logic
│   ├── lib/           # Utility functions and Supabase client initialization
│   ├── pages/         # Page-level components corresponding to routes
│   ├── stores/        # Zustand global state stores
│   ├── styles/        # Additional stylesheets
│   ├── types/         # Global TypeScript definitions
│   ├── App.tsx        # Application root and routing
│   ├── main.tsx       # Entry point
│   ├── index.css      # Global CSS and Design System tokens
│   └── setupTests.ts  # Vitest test setup
├── database/          # Supabase SQL schema definitions and migrations
├── supabase/          # Supabase configuration and Edge Functions
├── public/            # Static assets
└── vite.config.ts     # Vite configuration (PWA, Code Splitting, Tests)
```

## Design System

Matisa employs a premium "Sleek Dark Mode" aesthetic specifically tailored to feel immersive and hyper-local.

*   **Color Palette:**
    *   **Background:** `#0F0D0B` (Charcoal Black)
    *   **Surface/Cards:** `#1C1814` (Deep Brown)
    *   **Primary Accent:** `#C8521A` (Namibian Sand/Orange)
    *   **Secondary/Info:** `#2D7DD2` (Oceans)
    *   **Text Primary:** `#F5F0EA` (Off-white)
    *   **Text Secondary:** `#8A7F74` (Warm Gray)
*   **Typography:** The application relies on modern sans-serif fonts, with `font-display` classes used for bold, expressive headings.
*   **Animations:** Micro-animations are heavily utilized via Framer Motion. Components like `PostCard` and `StoryBubble` feature subtle hover scaling, tap effects, and slide-in entries to make the interface feel alive and responsive.
*   **Single Source of Truth:** All theme tokens are defined in `index.css` via custom CSS variables (e.g., `--matisa-bg`, `--matisa-primary`).

## Data Fetching & Performance

*   **Real-time Capabilities:** Supabase Realtime is used for live Chat/Messages and notification updates.
*   **Infinite Scrolling:** Cursor-based pagination is implemented using `react-intersection-observer` (e.g., in `Profile.tsx`) to handle large datasets seamlessly without performance degradation.
*   **Code Splitting:** React's `lazy` and `Suspense` are used in `App.tsx` to chunk the application bundle by route, significantly decreasing initial load times.
*   **SEO:** `react-helmet-async` manages dynamic meta tags per page.

## Testing Strategy

*   **Framework:** Vitest + React Testing Library.
*   **Scope:** Unit tests cover utility functions (like `cn` class merging) and isolated UI components. Tests are co-located or placed in `src/utils/` and execute via `npx vitest run`.

## Deployment

1.  **Frontend:** The application is configured to deploy seamlessly to Vercel. Push to the `main` branch to trigger a Vercel build. Ensure all environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.) are set in the Vercel dashboard.
2.  **Backend:** Supabase migrations are managed via the Supabase CLI (`supabase db push`).
3.  **Type Safety:** The build step runs `tsc --noEmit` to guarantee strict type safety before Vercel compiles the production bundle.
