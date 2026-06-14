import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Plus, Heart, Bell, MessageSquare, Home, User } from "lucide-react";
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-6 bg-background/60 backdrop-blur-3xl border-b border-white/5">
      {/* Logo equivalent from reference image: a simple 4-dot menu icon */}
      <div className="flex items-center gap-2 text-white">
        <div className="grid grid-cols-2 gap-[3px]">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white/50" />
        </div>
        <span className="text-xl font-display font-extrabold tracking-tight ml-2">Matisa</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          onClick={() => navigate("/activity")}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
        >
          <Bell size={20} strokeWidth={2} />
          {unreadNotifs > 0 && (
            <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C8521A] px-1 text-[9px] font-bold text-white leading-none shadow-md">
              {unreadNotifs > 9 ? "9+" : unreadNotifs}
            </span>
          )}
        </button>

        {/* Messages */}
        <button
          onClick={() => navigate("/messages")}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition shadow-lg"
        >
          <MessageSquare size={18} strokeWidth={2.5} fill="currentColor" />
          {unreadMsgs > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C8521A] px-1 text-[9px] font-bold text-white leading-none shadow-md">
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

function BottomNav({ onCompose }: { onCompose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[84px] bg-background/80 backdrop-blur-[40px] border-t border-white/5 flex items-start justify-between px-8 pt-3 pb-[env(safe-area-inset-bottom,20px)] z-40">
      <button
        onClick={() => navigate("/")}
        className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 active:opacity-70 ${path === "/" ? "text-primary" : "text-white/50 hover:text-white"}`}
      >
        <div className={`p-1.5 rounded-full ${path === "/" ? "bg-primary/10" : ""}`}>
          <Home size={26} className={path === "/" ? "fill-primary" : ""} />
        </div>
      </button>

      <button
        onClick={() => navigate("/explore")}
        className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 active:opacity-70 ${path === "/explore" ? "text-primary" : "text-white/50 hover:text-white"}`}
      >
        <div className={`p-1.5 rounded-full ${path === "/explore" ? "bg-primary/10" : ""}`}>
          <Search size={26} className={path === "/explore" ? "text-primary stroke-[2.5]" : ""} />
        </div>
      </button>

      {/* Center Create Button */}
      <button
        onClick={onCompose}
        className="w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-black shadow-[0_4px_20px_rgba(255,157,46,0.4)] transition-all active:scale-90 active:shadow-none -mt-5 border-[4px] border-background"
      >
        <Plus size={28} />
      </button>

      <button
        onClick={() => navigate("/activity")}
        className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 active:opacity-70 relative ${path === "/activity" ? "text-primary" : "text-white/50 hover:text-white"}`}
      >
        <div className={`p-1.5 rounded-full ${path === "/activity" ? "bg-primary/10" : ""}`}>
          <Heart size={26} className={path === "/activity" ? "fill-primary" : ""} />
        </div>
      </button>

      <button
        onClick={() => navigate("/profile")}
        className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 active:opacity-70 ${path.startsWith("/profile") ? "text-primary" : "text-white/50 hover:text-white"}`}
      >
        <div className={`p-1.5 rounded-full ${path.startsWith("/profile") ? "bg-primary/10" : ""}`}>
          <User
            size={26}
            className={path.startsWith("/profile") ? "fill-primary text-primary" : ""}
          />
        </div>
      </button>
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

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col shadow-2xl shadow-black bg-background text-foreground pt-safe pb-safe">
      {!hideTop && <TopBar />}

      <main className="flex-1 overflow-y-auto no-scrollbar">
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
