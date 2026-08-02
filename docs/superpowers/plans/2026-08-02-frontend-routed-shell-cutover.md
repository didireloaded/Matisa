# Matisa Routed Shell Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the active URL-less prototype shell with Matisa's existing routed architecture while preserving current uncommitted feature work and making navigation, accessibility, TypeScript, tests, and production build verifiably healthy.

**Architecture:** Use an incremental strangler cutover. Preserve the 2,062-line prototype outside the compiled source tree, make `src/App.tsx` a small routed composition root, and move shell responsibilities into focused route and navigation modules. Reuse the existing providers, pages, hooks, services, repositories, and design tokens.

**Tech Stack:** React 19, React Router 7, TypeScript 5.8, Vite 7, Tailwind CSS 4, TanStack Query, Supabase, Vitest, React Testing Library, Playwright.

## Global Constraints

- Preserve every pre-existing uncommitted change; never reset, discard, or broadly format the dirty checkout.
- Frontend-only: no schema, migration, Edge Function, RLS, secret, or external-provider changes.
- Keep Matisa's near-black background, orange primary accent, restrained purple voice accent, Syne display headings, rounded mobile surfaces, circular avatars/story rings, compact bottom navigation, and dark sheets.
- Every visible action must work, be clearly unavailable, or be hidden.
- Primary navigation is Home, Explore, Create, Inbox, Profile; Activity remains a header destination and Events remain secondary.
- Use `src/lib/supabase.ts` as the only browser Supabase client.
- No production code for behavior changes without first observing the focused test fail for the expected reason.
- Do not remove the Git index lock unless no Git process exists and the user explicitly approves that repository-state repair.

---

## File Structure

- Create `docs/production/FRONTEND_CUTOVER_MAP.md`: records every active prototype behavior and its routed destination or honest deferral.
- Move `src/App.tsx` to `docs/archive/frontend-prototype-2026-08-02.tsx`: preserves the dirty prototype outside TypeScript compilation.
- Create `src/app/routes.tsx`: owns lazy page imports and the complete route tree.
- Create `src/app/routes.test.tsx`: verifies primary/legacy route resolution with controlled page doubles.
- Create `src/App.tsx`: small composition root for providers, router, error boundary, suspense, analytics, and routes.
- Create `src/components/layout/PrimaryNavigation.tsx`: URL-driven four-tab navigation plus central create action.
- Create `src/components/layout/PrimaryNavigation.test.tsx`: verifies labels, active state, navigation, and create behavior.
- Modify `src/components/layout/MainLayout.tsx`: consumes `PrimaryNavigation`, limits create actions, fixes shell semantics, and removes reload-based refresh.
- Modify `src/components/common/CreateRadialMenu.tsx`: exposes only Note, Voice, and Story and adds accessible dialog/button semantics.
- Create `src/components/common/CreateRadialMenu.test.tsx`: proves unverified actions are absent and selection works.
- Create `src/lib/supabase-singleton.test.ts`: proves features share one Supabase client instance.
- Modify `src/features/reactions/index.ts`: import the authoritative client.
- Modify `src/features/voicemail/index.ts`: import the authoritative client.
- Delete `src/utils/supabase.ts` after reference search is empty.
- Modify `index.html`: enable zoom and reference one generated PWA manifest.
- Modify `src/index.css`: restore text selection, focus visibility, safe-area utilities, and reduced motion.
- Modify `vite.config.ts`: remove missing asset references and align theme colors.
- Create `e2e/routed-shell.spec.ts`: verifies deep links, history, viewport accessibility, selection, and missing-asset requests.

---

### Task 1: Preserve Prototype Behavior Before Cutover

**Files:**

- Create: `docs/production/FRONTEND_CUTOVER_MAP.md`
- Move: `src/App.tsx` -> `docs/archive/frontend-prototype-2026-08-02.tsx`

**Interfaces:**

- Consumes: current dirty `src/App.tsx`, `src/features/reactions`, `src/features/voicemail`, and `src/features/events`.
- Produces: a loss-prevention map that later tasks use to decide whether behavior is migrated, deferred, or removed as dishonest.

- [ ] **Step 1: Write the preservation map before moving code**

Create `docs/production/FRONTEND_CUTOVER_MAP.md` with this exact schema and initial verified rows:

```markdown
# Matisa Frontend Cutover Map

| Prototype behavior | Current owner | Routed destination | Decision | Verification |
|---|---|---|---|---|
| App shell and local screen state | `src/App.tsx` | `src/App.tsx`, `src/app/routes.tsx`, `src/components/layout/MainLayout.tsx` | Replace with URL routes | Route and E2E tests |
| Note reactions | `src/App.tsx`, `src/features/reactions` | Home post card using `reactionService` | Preserve service; rewire page later | Existing service tests plus Home slice test |
| Voicemail | `src/App.tsx`, `src/features/voicemail` | Inbox/chat slice | Preserve service; hide until routed UI is verified | Existing voicemail tests plus Inbox slice test |
| Event loading/RSVP | `src/App.tsx`, `src/features/events` | `/events` | Preserve service; routed page migration later | Existing event tests |
| Direct profile/note/event queries | `src/App.tsx` | Feature hooks/services | Do not copy | No raw Supabase calls in routed pages touched by a slice |
| Radar screen | `src/App.tsx` | None | Remove from active product | Route absence test |
| Fake karaoke rooms/listeners | `src/App.tsx` | None in this slice | Hide | Create/navigation tests |
| Generated message rows/timestamps | `src/App.tsx` | `/inbox` later | Do not migrate | Inbox honest-empty-state test |
| Fake badges/online dots | `src/App.tsx` | Real notification/presence queries later | Hide until real | Shell test and browser inspection |
```

- [ ] **Step 2: Verify the map covers every imported extracted feature**

Run:

```powershell
rg -n "features/(reactions|voicemail|events)|from \"\./features" src/App.tsx
```

Expected: every matched feature has a row in `FRONTEND_CUTOVER_MAP.md`.

- [ ] **Step 3: Preserve the prototype outside the compiled tree**

Run:

```powershell
New-Item -ItemType Directory -Force docs/archive
git mv src/App.tsx docs/archive/frontend-prototype-2026-08-02.tsx
```

Expected: the entire dirty prototype moves without content loss; do not edit the archived file.

- [ ] **Step 4: Confirm no other file was moved or deleted**

Run:

```powershell
git status --short
git diff --summary -- src/App.tsx docs/archive/frontend-prototype-2026-08-02.tsx
```

Expected: one rename/move pair plus the already-existing user changes.

---

### Task 2: Add the Route Contract Test and Routed Composition Root

**Files:**

- Create: `src/app/routes.test.tsx`
- Create: `src/app/routes.tsx`
- Create: `src/App.tsx`

**Interfaces:**

- Produces: `AppRoutes(): JSX.Element`; `App` renders `BrowserRouter` and `AppRoutes` inside the existing provider stack.
- Route contract: `/`, `/explore`, `/inbox`, `/profile`, `/activity`, `/events`, `/settings`, `/auth`, `/chat/:id`, `/room/:id`; redirects `/discovery` -> `/explore` and `/messages` -> `/inbox`.

- [ ] **Step 1: Write the failing route test**

Create `src/app/routes.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppRoutes } from "./routes";

vi.mock("@/components/layout/MainLayout", () => ({
  MainLayout: () => <><div>Matisa shell</div><Outlet /></>,
}));
vi.mock("@/pages/Home", () => ({ Home: () => <div>Home page</div> }));
vi.mock("@/pages/Discovery", () => ({ Discovery: () => <div>Explore page</div> }));
vi.mock("@/pages/Messages", () => ({ Messages: () => <div>Inbox page</div> }));
vi.mock("@/pages/Profile", () => ({ Profile: () => <div>Profile page</div> }));
vi.mock("@/pages/Activity", () => ({ Activity: () => <div>Activity page</div> }));
vi.mock("@/pages/Events", () => ({ Events: () => <div>Events page</div> }));
vi.mock("@/pages/Notes", () => ({ Notes: () => <div>Notes page</div> }));
vi.mock("@/pages/Music", () => ({ Music: () => <div>Music page</div> }));
vi.mock("@/pages/Settings", () => ({ Settings: () => <div>Settings page</div> }));
vi.mock("@/pages/Auth", () => ({ Auth: () => <div>Auth page</div> }));
vi.mock("@/pages/Chat", () => ({ Chat: () => <div>Chat page</div> }));
vi.mock("@/components/karaoke/KaraokeRoom", () => ({
  KaraokeRoom: () => <div>Room page</div>,
}));

function renderRoute(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>);
}

describe("AppRoutes", () => {
  it.each([
    ["/", "Home page"],
    ["/explore", "Explore page"],
    ["/inbox", "Inbox page"],
    ["/profile", "Profile page"],
    ["/activity", "Activity page"],
  ])("resolves %s", (path, label) => {
    renderRoute(path);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("redirects the former discovery URL", async () => {
    renderRoute("/discovery");
    expect(await screen.findByText("Explore page")).toBeInTheDocument();
  });

  it("does not expose Radar", () => {
    renderRoute("/radar");
    expect(screen.queryByText(/radar/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the route test and observe RED**

Run:

```powershell
npm run test -- src/app/routes.test.tsx
```

Expected: FAIL because `src/app/routes.tsx` and `AppRoutes` do not exist.

- [ ] **Step 3: Implement `AppRoutes` with lazy route modules**

Create `src/app/routes.tsx` using `lazy`, `Routes`, `Route`, and `Navigate`. Use the page import names already present in the historical routed `App.tsx`. The route tree must be:

```tsx
<Routes>
  <Route element={<MainLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/explore" element={<Discovery />} />
    <Route path="/discovery" element={<Navigate to="/explore" replace />} />
    <Route path="/notes" element={<Notes />} />
    <Route path="/events" element={<Events />} />
    <Route path="/music" element={<Music />} />
    <Route path="/activity" element={<Activity />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/profile/:id" element={<Profile />} />
    <Route path="/inbox" element={<Messages />} />
    <Route path="/messages" element={<Navigate to="/inbox" replace />} />
    <Route path="/settings" element={<Settings />} />
  </Route>
  <Route path="/auth" element={<Auth />} />
  <Route path="/chat/:id" element={<Chat />} />
  <Route path="/room/:id" element={<KaraokeRoom />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

- [ ] **Step 4: Create the small composition root**

Create `src/App.tsx` with the historical provider order, but keep only one `Toaster` (the one already inside `Providers`) and type the error as `Error`:

```tsx
import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { Providers } from "./components/providers";
import { AppRoutes } from "./app/routes";

function PageLoader() {
  return <div role="status" aria-label="Loading Matisa" className="flex min-h-[50dvh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" /></div>;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-background)] p-6 text-center text-white"><h1 className="text-xl font-bold">Matisa could not open this screen</h1><p className="mt-3 text-sm text-[var(--color-text-muted)]">{error.message}</p><button type="button" onClick={resetErrorBoundary} className="mt-6 min-h-11 rounded-full bg-[var(--color-primary)] px-6 font-semibold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Try again</button></main>;
}

export default function App() {
  return <HelmetProvider><ErrorBoundary FallbackComponent={ErrorFallback}><Providers><BrowserRouter><Suspense fallback={<PageLoader />}><AppRoutes /></Suspense></BrowserRouter></Providers><Analytics /></ErrorBoundary></HelmetProvider>;
}
```

- [ ] **Step 5: Run route test and TypeScript**

Run:

```powershell
npm run test -- src/app/routes.test.tsx
npm run typecheck
```

Expected: route test PASS; the eight prototype `App.tsx` errors are absent because the archive is outside `src`.

---

### Task 3: Add Honest URL-Driven Primary Navigation

**Files:**

- Create: `src/components/layout/PrimaryNavigation.test.tsx`
- Create: `src/components/layout/PrimaryNavigation.tsx`
- Modify: `src/components/layout/MainLayout.tsx`

**Interfaces:**

- Produces: `PrimaryNavigation({ onCreate }: { onCreate: () => void })`.
- Uses real links for Home `/`, Explore `/explore`, Inbox `/inbox`, Profile `/profile`; the central Create button invokes `onCreate`.

- [ ] **Step 1: Write the failing navigation test**

Create `src/components/layout/PrimaryNavigation.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PrimaryNavigation } from "./PrimaryNavigation";

describe("PrimaryNavigation", () => {
  it("shows the five honest primary actions", () => {
    render(<MemoryRouter initialEntries={["/explore"]}><PrimaryNavigation onCreate={vi.fn()} /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inbox" })).toHaveAttribute("href", "/inbox");
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
    expect(screen.queryByRole("link", { name: /karaoke|events|music/i })).not.toBeInTheDocument();
  });

  it("opens create from the central action", () => {
    const onCreate = vi.fn();
    render(<MemoryRouter><PrimaryNavigation onCreate={onCreate} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(onCreate).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test and observe RED**

Run:

```powershell
npm run test -- src/components/layout/PrimaryNavigation.test.tsx
```

Expected: FAIL because `PrimaryNavigation` does not exist.

- [ ] **Step 3: Implement navigation with `NavLink`**

Create a focused component using `NavLink`, `Home`, `Compass`, `Plus`, `MessageSquare`, and `User`. Each link/button must have `min-h-11 min-w-11`, a visible `focus-visible` outline, an explicit accessible name, orange active state, neutral inactive state, and `aria-current` supplied by `NavLink`.

- [ ] **Step 4: Replace `BottomNav` inside `MainLayout`**

Delete `NAV_ITEMS`, `NavItem`, and `BottomNav` from `MainLayout.tsx`. Import `PrimaryNavigation` and render:

```tsx
{!hideNav && <PrimaryNavigation onCreate={() => setShowCreateMenu(true)} />}
```

Update the top bar destinations to `/explore` and `/activity`, give both icon buttons `aria-label`, make the Matisa logo a link to `/`, and remove unused imports/states including `showCreateSong` and `showCreateEvent` if they are not rendered by an allowed action.

- [ ] **Step 5: Replace reload-based pull-to-refresh**

Remove the `setTimeout(...window.location.reload())` implementation. For this slice, remove the pull handlers and visual indicator entirely; route pages will receive query-aware refresh in their own vertical slices.

- [ ] **Step 6: Verify GREEN**

Run:

```powershell
npm run test -- src/components/layout/PrimaryNavigation.test.tsx
npx eslint src/components/layout/PrimaryNavigation.tsx src/components/layout/MainLayout.tsx
npm run typecheck
```

Expected: focused test PASS, ESLint exit 0, TypeScript exit 0.

---

### Task 4: Restrict Create to Honest Launch Actions

**Files:**

- Create: `src/components/common/CreateRadialMenu.test.tsx`
- Modify: `src/components/common/CreateRadialMenu.tsx`
- Modify: `src/components/layout/MainLayout.tsx`

**Interfaces:**

- `CreateAction = "note" | "voice" | "story"`.
- `CreateRadialMenuProps.onSelect(action: CreateAction): void`.

- [ ] **Step 1: Write the failing create-menu test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CreateRadialMenu } from "./CreateRadialMenu";

describe("CreateRadialMenu", () => {
  it("shows only verified launch creation types", () => {
    render(<CreateRadialMenu isOpen onClose={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Create note" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create voice post" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create story" })).toBeInTheDocument();
    expect(screen.queryByText(/room|event|ask|live/i)).not.toBeInTheDocument();
  });

  it("reports the selected action and closes", () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<CreateRadialMenu isOpen onClose={onClose} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Create note" }));
    expect(onSelect).toHaveBeenCalledWith("note");
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test and observe RED**

Run:

```powershell
npm run test -- src/components/common/CreateRadialMenu.test.tsx
```

Expected: FAIL because the menu exposes Room, Event, and Ask and has no accessible names.

- [ ] **Step 3: Implement the constrained action type and semantics**

Keep the existing component and motion language, but set the item list to exactly Note (orange), Voice (restrained purple), and Story (neutral/orange). Add `role="dialog"`, `aria-modal="true"`, `aria-label="Create"` to the overlay container; add `aria-label` values `Create note`, `Create voice post`, and `Create story`; add `aria-label="Close create menu"` to the center close button. Remove blue, green, red, and multi-color gradients from this menu.

- [ ] **Step 4: Wire only matching modals in `MainLayout`**

Keep only `showCreateNote`, `showCreateVoice`, and `showCreateStory`. The `onSelect` switch must be exhaustive over `CreateAction`. Remove room, song, live, event, and question handlers/imports from the active shell. This hides functionality rather than claiming it works.

- [ ] **Step 5: Verify GREEN**

Run:

```powershell
npm run test -- src/components/common/CreateRadialMenu.test.tsx
npx eslint src/components/common/CreateRadialMenu.tsx src/components/layout/MainLayout.tsx
npm run typecheck
```

Expected: focused test PASS; no unused code or type errors.

---

### Task 5: Consolidate the Supabase Browser Client

**Files:**

- Create: `src/lib/supabase-singleton.test.ts`
- Modify: `src/features/reactions/index.ts`
- Modify: `src/features/voicemail/index.ts`
- Delete: `src/utils/supabase.ts`

**Interfaces:**

- `supabase` from `src/lib/supabase.ts` is the only client instance.
- Existing `reactionService` and `voicemailService` exports remain unchanged.

- [ ] **Step 1: Write the failing singleton test**

Create `src/lib/supabase-singleton.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn(() => ({ auth: {}, from: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient }));

describe("Supabase browser client", () => {
  beforeEach(() => {
    vi.resetModules();
    createClient.mockClear();
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "public-test-key");
  });

  it("is shared by extracted frontend features", async () => {
    await import("@/lib/supabase");
    await import("@/features/reactions");
    await import("@/features/voicemail");
    expect(createClient).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test and observe RED**

Run:

```powershell
npm run test -- src/lib/supabase-singleton.test.ts
```

Expected: FAIL because `src/utils/supabase.ts` creates a second client.

- [ ] **Step 3: Point features to the authoritative client**

Change both feature index imports to:

```ts
import { supabase } from "@/lib/supabase";
```

- [ ] **Step 4: Prove the duplicate is unused, then delete it**

Run:

```powershell
rg -n "utils/supabase|utils\\supabase" src
```

Expected: no matches. Delete `src/utils/supabase.ts` only after this result.

- [ ] **Step 5: Verify GREEN and existing feature services**

Run:

```powershell
npm run test -- src/lib/supabase-singleton.test.ts src/features/reactions/services/ReactionService.test.ts src/features/voicemail/services/VoicemailService.test.ts
npm run typecheck
```

Expected: singleton test PASS; reaction and voicemail tests remain PASS; TypeScript exit 0.

---

### Task 6: Repair Accessibility and PWA Shell Metadata

**Files:**

- Modify: `index.html`
- Modify: `src/index.css`
- Modify: `vite.config.ts`
- Create: `e2e/routed-shell.spec.ts`

**Interfaces:**

- Browser zoom remains user-controlled.
- Text content is selectable; controls remain touch-friendly.
- Safe-area utilities support top and bottom insets.
- Reduced-motion preference disables nonessential transitions/animations.
- PWA config references only files present under `public/`.

- [ ] **Step 1: Write the failing Playwright checks**

Create `e2e/routed-shell.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("shell preserves browser accessibility controls", async ({ page }) => {
  await page.goto("/");
  const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
  expect(viewport).not.toContain("user-scalable=no");
  expect(viewport).not.toContain("maximum-scale=1.0");
  const userSelect = await page.locator("body").evaluate((node) => getComputedStyle(node).userSelect);
  expect(userSelect).not.toBe("none");
});

test("primary routes support browser history", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore" }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});

test("manifest and declared icons return successfully", async ({ page, request }) => {
  await page.goto("/");
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBeTruthy();
  expect((await request.get(manifestHref!)).ok()).toBe(true);
  for (const icon of ["/pwa-192x192.png"]) expect((await request.get(icon)).ok()).toBe(true);
});
```

- [ ] **Step 2: Run E2E and observe RED**

Run:

```powershell
npm run test:e2e -- e2e/routed-shell.spec.ts
```

Expected: accessibility test FAIL because zoom and selection are disabled; history test FAIL until the routed shell is active.

- [ ] **Step 3: Enable zoom and use the generated manifest only**

Change the viewport in `index.html` to:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Remove the manual `<link rel="manifest" href="/manifest.json">`; Vite PWA injects the generated manifest. Keep the existing valid `/pwa-192x192.png` icon link until an approved official 512px asset is supplied.

- [ ] **Step 4: Restore selection, focus, safe areas, and reduced motion**

In `src/index.css`, remove global `user-select: none` and `-webkit-touch-callout: none`. Use:

```css
@layer base {
  * {
    border-color: var(--color-border);
    -webkit-tap-highlight-color: transparent;
  }

  body {
    user-select: text;
  }

  button,
  [role="button"] {
    user-select: none;
  }

  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Keep `.pb-safe` and `.pt-safe`; add fallback padding with `max()` only if the supported browser matrix confirms it.

- [ ] **Step 5: Remove nonexistent PWA references**

In `vite.config.ts`, remove `includeAssets` entries for `favicon.ico`, `apple-touch-icon.png`, and `mask-icon.svg`, because none exists. Remove the nonexistent 512px icon entry. Set both generated manifest `theme_color` and `background_color` to the established near-black/orange values already used by the shell. Record in `FRONTEND_CUTOVER_MAP.md` that a branded 512px install icon remains a real asset dependency; do not fabricate it.

- [ ] **Step 6: Verify GREEN**

Run:

```powershell
npm run test:e2e -- e2e/routed-shell.spec.ts
npx eslint src/components/layout/MainLayout.tsx src/components/layout/PrimaryNavigation.tsx src/components/common/CreateRadialMenu.tsx
npm run typecheck
npm run build
```

Expected: E2E PASS; ESLint exit 0; TypeScript exit 0; build exit 0; no build warning for missing PWA assets.

---

### Task 7: Full First-Slice Verification and Checkpoint

**Files:**

- Modify: `docs/production/BASELINE_AUDIT.md`
- Modify: `docs/production/MASTER_IMPLEMENTATION_PLAN.md`
- Modify: `docs/production/INTERACTION_INVENTORY.md`

**Interfaces:**

- Produces: factual checkpoint using only VERIFIED WORKING, VERIFIED FAILING, and NOT VERIFIED.

- [ ] **Step 1: Inspect the complete diff**

Run:

```powershell
git status --short
git diff --check
git diff --stat
git diff -- src/App.tsx src/app src/components/layout/MainLayout.tsx src/components/layout/PrimaryNavigation.tsx src/components/common/CreateRadialMenu.tsx src/features/reactions/index.ts src/features/voicemail/index.ts src/lib/supabase.ts index.html src/index.css vite.config.ts e2e/routed-shell.spec.ts
```

Expected: no whitespace errors, no unrelated formatting, no discarded existing user changes.

- [ ] **Step 2: Run full frontend verification**

Run:

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Expected baseline target:

- TypeScript: 0 errors.
- Lint: 0 errors; record any remaining pre-existing warnings exactly.
- Unit tests: all pass; record file/test counts.
- Production build: exit 0; record chunk sizes and PWA output.
- Playwright: all pass; record test count.

- [ ] **Step 3: Browser-verify the visible shell**

At mobile width, verify Home, Explore, Inbox, Profile, Activity, back/forward navigation, Create open/close, keyboard focus, reduced-motion emulation, top/bottom safe-area spacing, and that no Radar, fake badge, fake online dot, fake message, or internal development copy appears in the shell.

- [ ] **Step 4: Update factual production documentation**

Record exact commands/results, route cutover status, known page-level mock dependencies, the missing official 512px PWA icon, and deferred Home/Explore/Inbox/Profile migrations. Do not mark any routed page VERIFIED WORKING unless automated or manual evidence covers its real data behavior.

- [ ] **Step 5: Stage only first-slice files**

Before staging, confirm no Git process is running. If `.git/index.lock` still exists, stop and request explicit repository-state repair approval. Otherwise stage the exact first-slice paths; never use `git add .`.

- [ ] **Step 6: Commit the coherent cutover**

```powershell
git commit -m "refactor(frontend): activate routed Matisa shell"
```

Expected: one commit containing only the routed-shell slice and its tests/docs. If existing mixed changes prevent a safe commit, leave the slice uncommitted and report the exact conflict.

---

## Plan Self-Review

- Spec coverage: routed shell, navigation, interaction honesty, client consolidation, accessibility, PWA metadata, preservation, and verification are each assigned to a task.
- Scope: this plan intentionally stops before Home, Explore, Inbox, Profile, and create-feature data rebuilds; each becomes its own vertical-slice plan after this cutover passes.
- Type consistency: `AppRoutes`, `PrimaryNavigation`, and `CreateAction` have one definition and exact consumers.
- Remaining external dependency: an official branded 512px PWA icon is required before installability can be marked complete.
