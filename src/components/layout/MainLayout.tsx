import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Plus, Heart, Bell, MessageSquare } from "lucide-react";
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-6 bg-transparent">
      {/* Logo equivalent from reference image: a simple 4-dot menu icon */}
      <div className="flex items-center gap-2 text-white">
        <div className="grid grid-cols-2 gap-[3px]">
          <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white/50" />
        </div>
        <span className="text-xl font-bold tracking-wide ml-2">Menu</span>
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
    <div className="fixed bottom-8 left-6 right-6 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-between px-2 z-40 shadow-2xl">
      <button
        onClick={() => navigate("/")}
        className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-colors ${path === "/" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"}`}
      >
        <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
          <div className={`rounded-sm ${path === "/" ? "bg-white" : "bg-white/70"}`} />
          <div className={`rounded-sm ${path === "/" ? "bg-white" : "bg-white/70"}`} />
          <div className={`rounded-sm ${path === "/" ? "bg-white" : "bg-white/70"}`} />
          <div className={`rounded-sm ${path === "/" ? "bg-white" : "bg-white/70"}`} />
        </div>
        {path === "/" && <span className="font-semibold text-sm">Home</span>}
      </button>

      <button
        onClick={() => navigate("/explore")}
        className={`p-3 transition-colors ${path === "/explore" ? "text-white" : "text-white/70 hover:text-white"}`}
      >
        <Search className="w-6 h-6" />
      </button>

      <button
        onClick={onCompose}
        className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>

      <button
        onClick={() => navigate("/activity")}
        className={`p-3 transition-colors ${path === "/activity" ? "text-white" : "text-white/70 hover:text-white"}`}
      >
        <Heart className="w-6 h-6" />
      </button>

      <button
        onClick={() => navigate("/profile")}
        className="p-3 text-white/70 hover:text-white transition"
      >
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
          className={`w-6 h-6 rounded-full object-cover bg-black ${path.startsWith("/profile") ? "ring-2 ring-white ring-offset-2 ring-offset-transparent" : ""}`}
        />
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
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col shadow-2xl shadow-black bg-background text-foreground">
      {!hideTop && <TopBar />}

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
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
