import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home, Radar, Plus, CalendarDays, User, Bell, MessageSquare, MapPin, Compass, Music2
} from "lucide-react";
import { NOTIFICATIONS, ME_ID } from "../../data/mock";
import { getProfile } from "../../data/mock";

function TopBar() {
  const navigate = useNavigate();
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-[#2E2822] backdrop-blur-lg" style={{ background: "rgba(15,13,11,0.88)" }}>
      <div className="flex items-center gap-2">
        <div className="font-display text-2xl font-bold leading-none tracking-tight" style={{ background: "linear-gradient(90deg,#E8A055,#C8521A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>matisa</div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/notifications")} className="relative flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-[#F5F0EA] hover:bg-[#1C1814] transition">
          <Bell size={20} />
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C8521A] px-1 text-[9px] font-bold text-white">{unread}</span>}
        </button>
      </div>
    </header>
  );
}

function BottomNav({ onCreate }: { onCreate: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const items = [
    { id: "/", icon: Home, label: "Home" },
    { id: "/explore", icon: Compass, label: "Explore" },
    { id: "/music", icon: Music2, label: "Music" },
    { id: "/messages", icon: MessageSquare, label: "Messages" },
    { id: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="sticky bottom-0 z-30 border-t border-[#2E2822] backdrop-blur-lg" style={{ background: "rgba(15,13,11,0.95)" }}>
      <div className="mx-auto flex max-w-md items-end justify-around px-1 py-1">
        {items.map(({ id, icon: Icon, label }) => {
          const active = path === id || (id === "/profile" && path.startsWith("/profile"));
          return (
            <button key={id} onClick={() => navigate(id)} className="flex flex-1 flex-col items-center gap-0.5 py-2 rounded-xl transition" style={{ color: active ? "#E8A055" : "#8A7F74" }}>
              <Icon size={21} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[9px] font-medium">{label}</span>
              {active && <motion.span layoutId="bottomNavIndicator" className="mt-0.5 h-1 w-1 rounded-full bg-[#C8521A]" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MainLayout() {
  const [showCompose, setShowCompose] = useState(false);
  const location = useLocation();
  const hideNav = ["/chat","/stories","/login"].includes(location.pathname);
  const hideTop = ["/chat","/notifications","/stories","/settings","/bookings","/login"].some(p => location.pathname.startsWith(p)) && location.pathname !== "/notifications";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col shadow-2xl shadow-black" style={{ background: "#0F0D0B" }}>
      {!hideTop && <TopBar />}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!hideNav && <BottomNav onCreate={() => setShowCompose(true)} />}
      <AnimatePresence>
        {showCompose && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-40 flex items-end justify-center" 
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          >
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-t-3xl border border-[#2E2822] p-5 shadow-2xl" 
              style={{ background: "#1C1814" }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#2E2822]" />
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setShowCompose(false)} className="text-[#8A7F74]">Cancel</button>
                <div className="font-display text-base font-bold text-[#F5F0EA]">New Post</div>
                <button onClick={() => setShowCompose(false)} className="rounded-full bg-[#C8521A] px-4 py-1.5 text-sm font-semibold text-white">Post</button>
              </div>
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-white font-semibold text-sm" style={{ background: getProfile(ME_ID).gradient }}>N</div>
                <textarea placeholder="What is happening in Namibia?" rows={4} className="flex-1 resize-none bg-transparent text-[15px] text-[#F5F0EA] outline-none placeholder:text-[#8A7F74]" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
