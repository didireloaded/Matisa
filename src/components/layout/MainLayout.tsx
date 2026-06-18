import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Plus, Heart, Bell, MessageSquare, Home, User, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { CreateNoteModal } from "@/components/feed/CreateNoteModal";
import { CreateVoiceRoomModal } from "@/components/karaoke/CreateVoiceRoomModal";
import { CreateSongModal } from "@/components/music/CreateSongModal";
import { CreateRadialMenu } from "@/components/common/CreateRadialMenu";
import { CreateStoryModal } from "@/components/stories/CreateStoryModal";
import { CreateVoicePostModal } from "@/components/feed/CreateVoicePostModal";
import { CreateLiveStreamModal } from "@/components/live/CreateLiveStreamModal";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// TOP BAR
// ─────────────────────────────────────────────

function TopBar() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", profile.id)
      .eq("is_read", false)
      .then(({ count }) => setUnreadNotifs(count ?? 0));
  }, [profile]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-5 bg-gradient-to-b from-[var(--color-background)] to-transparent">
      {/* Logo */}
      <div className="flex items-center">
        <span className="text-white text-[22px] font-display font-bold tracking-tight lowercase">
          matisa
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-5">
        <button className="text-white hover:text-[var(--color-primary-light)] transition-colors">
          <Search size={22} strokeWidth={2} />
        </button>
        <button
          onClick={() => navigate("/activity")}
          className="relative text-white hover:text-[var(--color-primary-light)] transition-colors"
        >
          <Bell size={22} strokeWidth={2} />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] border border-[var(--color-background)]" />
          )}
        </button>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// FLOATING BOTTOM NAV
// ─────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home", route: "/", icon: Home },
  { id: "discovery", route: "/discovery", icon: Search },
  { id: "rooms", route: "/rooms", icon: MessageSquare },
  { id: "events", route: "/events", icon: CalendarDays },
  { id: "profile", route: "/profile", icon: User },
] as const;

function BottomNav({ onCompose }: { onCompose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-safe pt-2 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)] to-transparent z-40 pointer-events-none">
      <div className="flex items-center justify-between px-6 h-[64px] rounded-[32px] glass-panel border border-[var(--color-border)] pointer-events-auto shadow-2xl shadow-black/50 mb-4 relative">
        {NAV_ITEMS.map((item, index) => {
          const isActive =
            path === item.route || (item.route !== "/" && path.startsWith(item.route));
          const Icon = item.icon;

          // Insert the center action button
          if (index === 2) {
            return (
              <div key="compose-btn" className="relative -top-5">
                <button
                  onClick={onCompose}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.5)] transition-transform active:scale-90"
                >
                  <Plus size={28} strokeWidth={2.5} />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className="relative p-2 flex flex-col items-center justify-center group focus:outline-none"
            >
              <motion.div whileTap={{ scale: 0.9 }} className="relative z-10">
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)] group-hover:text-white"
                  }`}
                />
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--color-primary)]"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────

const HIDE_TOP = ["/chat", "/room", "/auth"];
const HIDE_NAV = ["/chat", "/room", "/auth"];

export function MainLayout() {
  usePushNotifications();

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showCreateSong, setShowCreateSong] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showCreateVoice, setShowCreateVoice] = useState(false);
  const [showCreateLive, setShowCreateLive] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateOpp, setShowCreateOpp] = useState(false);

  const location = useLocation();
  const { session, loading } = useAuth();
  const path = location.pathname;

  const [pull, setPull] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const mainRef = useRef<HTMLDivElement>(null);

  const isGuest = localStorage.getItem("guestMode") === "true";
  if (!loading && !session && !isGuest) return <Navigate to="/auth" replace />;
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  const hideTop = HIDE_TOP.some((p) => path.startsWith(p));
  const hideNav = HIDE_NAV.some((p) => path.startsWith(p));

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mainRef.current && mainRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current > 0 && !isRefreshing) {
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0) {
        if (e.cancelable) e.preventDefault();
        setPull(Math.min(delta * 0.4, 80));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pull > 60 && !isRefreshing) {
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
        setPull(0);
        window.location.reload();
      }, 1000);
    } else {
      setPull(0);
    }
    touchStartY.current = 0;
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-[var(--color-background)] text-[var(--color-text)] overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      {!hideTop && <TopBar />}

      {/* Pull To Refresh Indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center z-20 pointer-events-none transition-opacity"
        style={{ top: hideTop ? 20 : 80, opacity: pull > 10 || isRefreshing ? 1 : 0 }}
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : pull * 3 }}
          transition={
            isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0 }
          }
          className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent shadow-lg bg-background/50 backdrop-blur flex items-center justify-center"
        >
          {!isRefreshing && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
        </motion.div>
      </div>

      <main
        ref={mainRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-y-auto no-scrollbar relative z-10"
        style={{
          transform: `translateY(${isRefreshing ? 60 : pull}px)`,
          transition: pull === 0 ? "transform 0.3s ease" : "none",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!hideNav && <BottomNav onCompose={() => setShowCreateMenu(true)} />}

      {/* Compose Menu */}
      <CreateRadialMenu
        isOpen={showCreateMenu}
        onClose={() => setShowCreateMenu(false)}
        onSelect={(action) => {
          if (action === "note") setTimeout(() => setShowCreateNote(true), 300);
          else if (action === "room") setTimeout(() => setShowCreateRoom(true), 300);
          else if (action === "story") setTimeout(() => setShowCreateStory(true), 300);
          else if (action === "voice") setTimeout(() => setShowCreateVoice(true), 300);
          else if (action === "live") setTimeout(() => setShowCreateLive(true), 300);
          else if (action === "event") setTimeout(() => setShowCreateEvent(true), 300);
          else if (action === "question")
            setTimeout(() => setShowCreateNote(true), 300); // reuse note for now
          else if (action === "opportunity") setTimeout(() => setShowCreateOpp(true), 300);
        }}
      />

      {/* Actual Create Modals */}
      <CreateNoteModal
        open={showCreateNote}
        onClose={() => setShowCreateNote(false)}
        onSuccess={() => setShowCreateNote(false)}
      />
      <CreateVoiceRoomModal open={showCreateRoom} onClose={() => setShowCreateRoom(false)} />
      <CreateSongModal
        open={showCreateSong}
        onClose={() => setShowCreateSong(false)}
        onSuccess={() => setShowCreateSong(false)}
      />

      {/* New Modals (Placeholders imported or created below) */}
      <CreateStoryModal open={showCreateStory} onClose={() => setShowCreateStory(false)} />
      <CreateVoicePostModal open={showCreateVoice} onClose={() => setShowCreateVoice(false)} />
      <CreateLiveStreamModal open={showCreateLive} onClose={() => setShowCreateLive(false)} />
    </div>
  );
}
