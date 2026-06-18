import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import { Providers } from "./components/providers";
import { MainLayout } from "./components/layout/MainLayout";
import { Loader2 } from "lucide-react";

// Lazy load pages for code splitting (Performance Phase 4)
const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const Notes = lazy(() => import("./pages/Notes").then((m) => ({ default: m.Notes })));
const Discovery = lazy(() => import("./pages/Discovery").then((m) => ({ default: m.Discovery })));
const Events = lazy(() => import("./pages/Events").then((m) => ({ default: m.Events })));
const Music = lazy(() => import("./pages/Music").then((m) => ({ default: m.Music })));
const Activity = lazy(() => import("./pages/Activity").then((m) => ({ default: m.Activity })));
const Profile = lazy(() => import("./pages/Profile").then((m) => ({ default: m.Profile })));
const Messages = lazy(() => import("./pages/Messages").then((m) => ({ default: m.Messages })));
const Chat = lazy(() => import("./pages/Chat").then((m) => ({ default: m.Chat })));
const KaraokeRoom = lazy(() =>
  import("./components/karaoke/KaraokeRoom").then((m) => ({ default: m.KaraokeRoom })),
);
const Auth = lazy(() => import("./pages/Auth").then((m) => ({ default: m.Auth })));
const Matching = lazy(() => import("./pages/Matching").then((m) => ({ default: m.Matching })));
const Creators = lazy(() => import("./pages/Creators").then((m) => ({ default: m.Creators })));
const Settings = lazy(() => import("./pages/Settings").then((m) => ({ default: m.Settings })));
const Opportunities = lazy(() =>
  import("./pages/Opportunities").then((m) => ({ default: m.Opportunities })),
);

function PageLoader() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#C8521A]" />
    </div>
  );
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: any;
  resetErrorBoundary?: () => void;
}) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0F0D0B] p-6 text-center text-[#F5F0EA]">
      <h2 className="mb-4 text-2xl font-bold text-red-500">Something went wrong</h2>
      <p className="mb-6 text-sm text-[#8A7F74]">{error.message}</p>
      <button
        onClick={resetErrorBoundary || (() => window.location.reload())}
        className="rounded-full bg-[#C8521A] px-6 py-2 font-bold text-white transition hover:bg-[#E8A055]"
      >
        Reload Page
      </button>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Providers>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/discovery" element={<Discovery />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/music" element={<Music />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/matching" element={<Matching />} />
                  <Route path="/creators" element={<Creators />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/opportunities" element={<Opportunities />} />
                </Route>
                <Route path="/auth" element={<Auth />} />
                <Route path="/chat/:id" element={<Chat />} />
                <Route path="/room/:id" element={<KaraokeRoom />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Analytics />
        </Providers>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
