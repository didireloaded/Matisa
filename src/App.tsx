import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Analytics } from '@vercel/analytics/react';
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

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0F0D0B] p-6 text-center text-[#F5F0EA]">
      <h2 className="mb-4 text-2xl font-bold text-red-500">Something went wrong</h2>
      <p className="mb-6 text-sm text-[#8A7F74]">{error.message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="rounded-full bg-[#C8521A] px-6 py-2 font-bold text-white transition hover:bg-[#E8A055]"
      >
        Reload Page
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
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/events" element={<Events />} />
              <Route path="/music" element={<Music />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
            </Route>
            <Route path="/auth" element={<Auth />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/room/:id" element={<KaraokeRoom />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </Providers>
    </ErrorBoundary>
  );
}

export default App;
