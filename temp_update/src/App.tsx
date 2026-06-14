import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Providers } from './components/providers';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Events } from './pages/Events';
import { Music } from './pages/Music';
import { Activity } from './pages/Activity';
import { Profile } from './pages/Profile';
import { Messages } from './pages/Messages';
import { Chat } from './pages/Chat';
import { KaraokeRoom } from './components/karaoke/KaraokeRoom';
import { Auth } from './pages/Auth';

// Radar — full screen, no top/bottom nav (handled in MainLayout via HIDE_NAV)
// Import lazily since it has heavy canvas deps
import { lazy, Suspense } from 'react';
const RadarPage = lazy(() =>
  import('./components/radar/RadarCanvas').then(m => ({ default: m.RadarCanvas }))
);

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0F0D0B] p-6 text-center">
      <p className="mb-2 text-lg font-bold text-red-400">Something went wrong</p>
      <p className="mb-6 text-sm text-[#8A7F74] max-w-xs">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-full bg-[#C8521A] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#E8A055]"
      >
        Reload
      </button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Providers>
        <BrowserRouter>
          <Routes>
            {/* Auth — standalone (no layout) */}
            <Route path="/auth" element={<Auth />} />

            {/* Full-screen routes (no top/bottom nav) */}
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/room/:id" element={<KaraokeRoom />} />
            <Route
              path="/radar"
              element={
                <Suspense fallback={
                  <div className="flex h-screen items-center justify-center bg-[#0F0D0B]">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8521A]"
                         style={{ borderTopColor: 'transparent' }} />
                  </div>
                }>
                  <RadarPage />
                </Suspense>
              }
            />

            {/* Main app — with layout (top bar + bottom nav) */}
            <Route element={<MainLayout />}>
              <Route path="/"         element={<Home />}     />
              <Route path="/explore"  element={<Explore />}  />
              <Route path="/events"   element={<Events />}   />
              <Route path="/activity" element={<Activity />} />
              <Route path="/profile"  element={<Profile />}  />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              {/* Music still accessible via /music — discoverable from Explore or profile */}
              <Route path="/music"    element={<Music />}    />
            </Route>
          </Routes>
        </BrowserRouter>
      </Providers>
    </ErrorBoundary>
  );
}

export default App;
