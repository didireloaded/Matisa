import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home, Compass, Plus, CalendarDays, User,
  MessageSquare, Radio, Bell,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CreatePostModal } from '@/components/feed/CreatePostModal';

// ─────────────────────────────────────────────
// TOP BAR
// ─────────────────────────────────────────────

function TopBar() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [unreadMsgs, setUnreadMsgs]   = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!profile) return;

    // Unread notifications count
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', profile.id)
      .eq('is_read', false)
      .then(({ count }) => setUnreadNotifs(count ?? 0));

    // Unread messages (conversations where last_message_at > last_read_at)
    supabase
      .from('conversation_members')
      .select('conversations!inner(last_message_at), last_read_at')
      .eq('user_id', profile.id)
      .then(({ data }) => {
        const unread = (data ?? []).filter((m: any) => {
          if (!m.conversations?.last_message_at) return false;
          return !m.last_read_at || new Date(m.conversations.last_message_at) > new Date(m.last_read_at);
        }).length;
        setUnreadMsgs(unread);
      });

    // Realtime subscription for new notifications
    const ch = supabase
      .channel(`topbar_notifs_${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${profile.id}`,
      }, () => setUnreadNotifs(c => c + 1))
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [profile]);

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 border-b"
      style={{
        background: 'rgba(15,13,11,0.92)',
        backdropFilter: 'blur(16px)',
        borderColor: '#2E2822',
      }}
    >
      {/* Logo */}
      <div
        className="font-display text-[22px] font-bold leading-none tracking-tight select-none"
        style={{
          background: 'linear-gradient(90deg, #E8A055 0%, #C8521A 60%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        matisa
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Radar */}
        <button
          onClick={() => navigate('/radar')}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#8A7F74] hover:text-[#F5F0EA] hover:bg-[#1C1814] transition"
          aria-label="Radar"
        >
          <Radio size={19} strokeWidth={1.8} />
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/activity')}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#8A7F74] hover:text-[#F5F0EA] hover:bg-[#1C1814] transition"
          aria-label="Notifications"
        >
          <Bell size={19} strokeWidth={1.8} />
          {unreadNotifs > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C8521A] px-1 text-[9px] font-bold text-white leading-none">
              {unreadNotifs > 9 ? '9+' : unreadNotifs}
            </span>
          )}
        </button>

        {/* Messages */}
        <button
          onClick={() => navigate('/messages')}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#8A7F74] hover:text-[#F5F0EA] hover:bg-[#1C1814] transition"
          aria-label="Messages"
        >
          <MessageSquare size={19} strokeWidth={1.8} />
          {unreadMsgs > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2D7DD2] px-1 text-[9px] font-bold text-white leading-none">
              {unreadMsgs > 9 ? '9+' : unreadMsgs}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// BOTTOM NAV
// ─────────────────────────────────────────────

const NAV = [
  { path: '/',        icon: Home,         label: 'Home'    },
  { path: '/explore', icon: Compass,      label: 'Explore' },
  { path: null,       icon: Plus,         label: ''        }, // compose trigger
  { path: '/events',  icon: CalendarDays, label: 'Events'  },
  { path: '/profile', icon: User,         label: 'Profile' },
];

function BottomNav({ onCompose }: { onCompose: () => void }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const path      = location.pathname;

  return (
    <nav
      className="sticky bottom-0 z-30 border-t"
      style={{
        background: 'rgba(15,13,11,0.96)',
        backdropFilter: 'blur(16px)',
        borderColor: '#2E2822',
      }}
    >
      <div className="mx-auto flex max-w-md items-end justify-around px-2 pb-safe">
        {NAV.map((item, i) => {
          /* ── Compose button (center) ── */
          if (item.path === null) {
            return (
              <button
                key="compose"
                onClick={onCompose}
                className="relative flex flex-col items-center -translate-y-3"
                aria-label="Create post"
              >
                <div
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-lg transition active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #E8A055 0%, #C8521A 100%)',
                    boxShadow: '0 4px 20px rgba(200,82,26,0.45)',
                  }}
                >
                  <Plus size={24} color="white" strokeWidth={2.5} />
                </div>
              </button>
            );
          }

          const active = path === item.path
            || (item.path === '/profile' && path.startsWith('/profile'))
            || (item.path === '/events'  && path.startsWith('/events'));
          const Icon   = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path!)}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 transition"
              aria-label={item.label}
              style={{ color: active ? '#E8A055' : '#8A7F74' }}
            >
              <Icon size={21} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[9px] font-medium tracking-wide">
                {item.label}
              </span>
              {active && (
                <motion.span
                  layoutId="nav-dot"
                  className="h-1 w-1 rounded-full"
                  style={{ background: '#C8521A' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────

const HIDE_TOP = ['/chat', '/room', '/auth'];
const HIDE_NAV = ['/chat', '/room', '/auth', '/radar'];

export function MainLayout() {
  const [showCompose, setShowCompose] = useState(false);
  const location = useLocation();
  const { session, loading } = useAuth();
  const path = location.pathname;

  if (!loading && !session) return <Navigate to="/auth" replace />;
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#0F0D0B' }}>
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8521A]"
          style={{ borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const hideTop = HIDE_TOP.some(p => path.startsWith(p));
  const hideNav = HIDE_NAV.some(p => path.startsWith(p));

  return (
    <div
      className="mx-auto flex min-h-screen max-w-md flex-col shadow-2xl shadow-black"
      style={{ background: '#0F0D0B' }}
    >
      {!hideTop && <TopBar />}

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!hideNav && <BottomNav onCompose={() => setShowCompose(true)} />}

      {/* Compose modal */}
      {showCompose && (
        <CreatePostModal
          onClose={() => setShowCompose(false)}
          onSuccess={() => setShowCompose(false)}
        />
      )}
    </div>
  );
}
