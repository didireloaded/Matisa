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
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!profile) return;

    // Unread notifications count
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", profile.id)
      .eq("is_read", false)
      .then(({ count }) => setUnreadNotifs(count ?? 0));

    // Unread messages
    supabase
      .from("conversation_members")
      .select("conversations!inner(last_message_at), last_read_at")
      .eq("user_id", profile.id)
      .then(({ data }) => {
        const unread = (data ?? []).filter((m: any) => {
          if (!m.conversations?.last_message_at) return false;
          return (
            !m.last_read_at || new Date(m.conversations.last_message_at) > new Date(m.last_read_at)
          );
        }).length;
        setUnreadMsgs(unread);
      });

    // Realtime subscription for new notifications
    const ch = supabase
      .channel(`topbar_notifs_${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${profile.id}`,
        },
        () => setUnreadNotifs((c) => c + 1),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [profile]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-5 border-b border-white/5"
      style={{ background: "rgba(11,11,11,0.75)", backdropFilter: "blur(24px)" }}>
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-2 gap-[3px]">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#A0AEC0]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white/30" />
        </div>
        <span className="text-white text-[18px] ml-2 font-display font-extrabold tracking-tight" style={{ fontWeight: 800 }}>
          Matisa
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          onClick={() => navigate("/activity")}
          className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/8 transition"
        >
          <Bell size={19} className="text-white/70" />
          {unreadNotifs > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#A0AEC0] flex items-center justify-center text-[9px] text-black font-bold shadow-md">
              {unreadNotifs > 9 ? "9+" : unreadNotifs}
            </span>
          )}
        </button>

        {/* Messages */}
        <button
          onClick={() => navigate("/messages")}
          className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center shadow transition hover:bg-white/90"
        >
          <MessageSquare size={16} className="text-black" strokeWidth={2.5} />
          {unreadMsgs > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#A0AEC0] flex items-center justify-center text-[9px] text-black font-bold shadow-md">
              {unreadMsgs > 9 ? "9+" : unreadMsgs}
            </span>
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
  { id: "explore", route: "/explore", icon: Search },
  { id: "__create__", route: "", icon: Plus },
  { id: "events", route: "/events", icon: CalendarDays },
  { id: "profile", route: "/profile", icon: User },
] as const;

function BottomNav({ onCompose }: { onCompose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[72px] flex items-center justify-between px-8 z-30 border-t border-white/5"
      style={{ background: "rgba(11,11,11,0.88)", backdropFilter: "blur(40px)" }}
    >
      {NAV_ITEMS.map((item) => {
        if (item.id === "__create__") {
          return (
            <motion.button
              key="create"
              whileTap={{ scale: 0.88 }}
              onClick={onCompose}
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center -mt-6"
              style={{
                background: "linear-gradient(135deg, #2D3748, #4A5568)",
                boxShadow: "0 4px 24px rgba(45,55,70,0.4)",
                border: "3px solid #0B0B0B",
              }}
            >
              <Plus size={24} className="text-white" strokeWidth={2.5} />
            </motion.button>
          );
        }
        const isActive = path === item.route || (item.route !== "/" && path.startsWith(item.route));
        const Icon = item.icon;
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(item.route)}
          >
            <div
              className="w-11 h-11 flex items-center justify-center rounded-full transition"
              style={{ background: isActive ? "rgba(45,55,70,0.1)" : "transparent" }}
            >
              <Icon
                size={24}
                style={{
                  color: isActive ? "#A0AEC0" : "rgba(255,255,255,0.4)",
                  fill: isActive && item.id !== "explore" ? "#A0AEC0" : "none",
                }}
              />
            </div>
          </motion.button>
        );
      })}
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
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/50 border-t-white" />
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
        // Stop default scrolling to prevent rubber-banding on some browsers
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
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col shadow-2xl shadow-black bg-background text-foreground pt-safe pb-safe overflow-hidden relative transform">
      {!hideTop && <TopBar />}

      {/* Pull To Refresh Indicator */}
      <div 
        className="absolute left-0 right-0 flex justify-center items-center z-20 pointer-events-none transition-opacity"
        style={{ top: hideTop ? 20 : 80, opacity: pull > 10 || isRefreshing ? 1 : 0 }}
      >
        <motion.div 
          animate={{ rotate: isRefreshing ? 360 : (pull * 3) }}
          transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0 }}
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
        style={{ transform: `translateY(${isRefreshing ? 60 : pull}px)`, transition: pull === 0 ? "transform 0.3s ease" : "none" }}
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
