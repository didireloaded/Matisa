import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from '../auth/AuthModal';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Bell, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MainLayout() {
  const { user, loading } = useAuth();
  const { isInitialized, requestPermission } = usePushNotifications();
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  useEffect(() => {
    // Only show if we're initialized, user is logged in, and permission hasn't been granted/denied yet
    if (isInitialized && user && 'Notification' in window && Notification.permission === 'default') {
      // Small delay so it's not instantly annoying
      const timer = setTimeout(() => setShowPushPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, user]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Push Notification Prompt */}
      {showPushPrompt && (
        <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between shadow-md z-50">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 shrink-0" />
            <div className="text-sm font-medium">
              Turn on notifications so you don't miss updates from your community.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => {
                requestPermission();
                setShowPushPrompt(false);
              }}
              className="bg-white text-primary px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/90 transition-colors"
            >
              Enable
            </button>
            <button 
              onClick={() => setShowPushPrompt(false)}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <BottomNav />
      {!loading && !user && <AuthModal isOpen={true} onClose={() => {}} />}
    </div>
  );
}
