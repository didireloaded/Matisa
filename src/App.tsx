import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from './components/providers';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Music } from './pages/Music';
import { Messages } from './pages/Messages';
import { Chat } from './pages/Chat';
import { Activity } from './pages/Activity';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { Community } from './pages/Community';
import { useAuthStore } from './store/authStore';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useEffect } from 'react';

function App() {
  const { session, isLoading, initialize } = useAuthStore();
  const { isInitialized } = usePushNotifications();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          {!session ? (
            <>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </>
          ) : (
            <>
              {/* Main App Layout (with Bottom Nav) */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/music" element={<Music />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              
              {/* Full Screen Overlays (without Bottom Nav) */}
              <Route path="/messages/:id" element={<Chat />} />
              <Route path="/community/:id" element={<Community />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
