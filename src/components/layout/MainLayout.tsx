import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Navigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { CreateNoteModal } from "@/components/feed/CreateNoteModal";
import { CreateVoiceRoomModal } from "@/components/karaoke/CreateVoiceRoomModal";
import { CreateRadialMenu } from "@/components/common/CreateRadialMenu";
import { CreateStoryModal } from "@/components/stories/CreateStoryModal";
import { CreateVoicePostModal } from "@/components/feed/CreateVoicePostModal";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { FloatingVoicePlayer } from "@/components/voice/FloatingVoicePlayer";
import { AuthRequiredModal } from "@/components/auth/AuthRequiredModal";
import { PrimaryNavigation } from "./PrimaryNavigation";

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
        <Link
          to="/"
          className="text-white text-[22px] font-display font-bold tracking-tight lowercase"
        >
          matisa
        </Link>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => navigate("/explore")}
          aria-label="Search"
          className="text-white hover:text-[var(--color-primary-light)] transition-colors"
        >
          <Search size={22} strokeWidth={2} />
        </button>
        <button
          onClick={() => navigate("/activity")}
          aria-label="Notifications"
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
// MAIN LAYOUT
// ─────────────────────────────────────────────

const HIDE_TOP = ["/chat", "/room", "/auth"];
const HIDE_NAV = ["/chat", "/room", "/auth"];

export function MainLayout() {
  usePushNotifications();

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showCreateVoice, setShowCreateVoice] = useState(false);

  const location = useLocation();
  const { session, loading, showAuthModal, setShowAuthModal } = useAuth();
  const path = location.pathname;

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

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-[var(--color-background)] text-[var(--color-text)] overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      {!hideTop && <TopBar />}

      <main className="flex-1 overflow-y-auto no-scrollbar relative z-10">
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

      {!hideNav && <PrimaryNavigation onCreate={() => setShowCreateMenu(true)} />}

      <FloatingVoicePlayer />

      {/* Compose Menu */}
      <CreateRadialMenu
        isOpen={showCreateMenu}
        onClose={() => setShowCreateMenu(false)}
        onSelect={(action) => {
          if (action === "note") setTimeout(() => setShowCreateNote(true), 300);
          else if (action === "story") setTimeout(() => setShowCreateStory(true), 300);
          else if (action === "voice") setTimeout(() => setShowCreateVoice(true), 300);
        }}
      />

      {/* Actual Create Modals */}
      <CreateNoteModal
        open={showCreateNote}
        onClose={() => setShowCreateNote(false)}
        onSuccess={() => setShowCreateNote(false)}
      />
      <CreateVoiceRoomModal open={showCreateRoom} onClose={() => setShowCreateRoom(false)} />

      {/* New Modals (Placeholders imported or created below) */}
      <CreateStoryModal open={showCreateStory} onClose={() => setShowCreateStory(false)} />
      <CreateVoicePostModal open={showCreateVoice} onClose={() => setShowCreateVoice(false)} />

      <AuthRequiredModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
