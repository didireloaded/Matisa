# Folder Structure

The repository is organized to scale across features without bloating any single directory.

## Root Directories

### `src/`
The primary React application source code.
- **`components/`**: UI building blocks categorized by feature.
- **`contexts/`**: React Contexts (e.g., `AuthContext`, `ThemeProvider`).
- **`hooks/`**: Custom React hooks (`usePushNotifications`, `useLocation`, `useSupabaseQuery`).
- **`lib/`**: Singletons and generic utilities (e.g., `supabase.ts`, `firebase.ts` for FCM, `utils.ts` for Tailwind merging).
- **`pages/`**: Top-level route components (`Home.tsx`, `Messages.tsx`, `Profile.tsx`).
- **`services/`**: Abstraction layers. The `ai/` folder lives here to orchestrate LLM providers. Database service wrappers live here.
- **`stores/`**: Zustand global state files.
- **`styles/`**: Extra CSS outside of tailwind utilities.
- **`types/`**: TypeScript interfaces and types.

### `supabase/`
Backend configuration and code.
- **`migrations/`**: Sequential SQL files defining the schema.
- **`functions/`**: Deno Edge Functions for serverless backend logic (`smartSearch`, `detectFakeAccounts`).

### `docs/`
All product and architectural documentation.

## Deprecated Folders

The following folders have been completely removed during the architecture sync:
- `src/components/radar/`
- `src/components/discovery/` (Map-specific)
