# Matisa

**People are the content. Content is the interface.**

Matisa is a hyper-local, high-performance social platform designed exclusively for the Namibian market. Moving away from legacy map-centric features, Matisa focuses on authentic connections through People Discovery, Stories, Notes, Events, and real-time Karaoke Rooms, all powered by an Invisible AI Layer.

## Documentation

For a comprehensive overview of the system, refer to the `docs/` directory:

- [Architecture Overview](ARCHITECTURE.md)
- [Database Schema](docs/database.md)
- [Components Library](docs/components.md)
- [Folder Structure](docs/folders.md)
- [Design System](docs/design_system.md)
- [Developer Onboarding](docs/onboarding.md)
- [Feature Specifications](docs/features.md)

## Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Live Audio:** LiveKit (WebRTC) for Karaoke Rooms
- **AI Intelligence:** Custom LLM orchestration layer

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Setup your `.env.local` with Supabase credentials
4. Run `npm run dev` to start the development server
5. For strict type checking, run `npx tsc --noEmit`