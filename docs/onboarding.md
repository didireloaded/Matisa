# Developer Onboarding

Welcome to the Matisa codebase. Before writing any code, please familiarize yourself with the new product vision: **"People are the content."**

## Prerequisites

- Node.js 18+ (or Bun)
- Supabase CLI installed locally
- Git

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Retrieve the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase dashboard and add them to `.env.local`.

## Local Development

```bash
npm install
npm run dev
```

## Core Rules of the Codebase

1. **Strict TypeScript:** Do not use `any`. Define your interfaces in `src/types/index.ts`. Run `npx tsc --noEmit` before committing.
2. **No Maps or Radar:** Matisa has completely pivoted away from map-based discovery. Do not import `react-map-gl` or related libraries.
3. **Database First:** If you are adding a feature, write the SQL migration in `supabase/migrations/` first, push it via Supabase CLI, and then generate the TypeScript types using the Supabase CLI.
4. **Use Existing UI Primitives:** Do not write custom CSS or inline styles if a Tailwind utility exists. Use the `index.css` variables for colors.
5. **Invisible AI:** Any LLM/AI integration must be abstracted through `src/services/ai/`. We do not expose AI-branded UI elements (e.g., no "Chat with Matisa AI" buttons). The AI is an invisible engine.

## Committing Code

We use Husky and lint-staged. Your code will be automatically linted upon committing. Ensure `npm run build` succeeds locally before pushing.
