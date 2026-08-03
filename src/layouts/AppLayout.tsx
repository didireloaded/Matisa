// src/layouts/AppLayout.tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import BottomNav from '../components/BottomNav';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Safe area top for iOS */}
      <div className="h-safe-top" />

      {/* Back button for non-home screens */}
      {!isHome && (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Page content */}
      <main>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
