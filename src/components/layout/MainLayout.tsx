import { Outlet, useLocation, useNavigate } from "@/lib/router-compat";
import { useState } from "react";
import {
  Home, Radar, Plus, CalendarDays, User, Bell, MessageSquare, MapPin,
} from "lucide-react";
import { NOTIFICATIONS, ME_ID } from "../../data/mock";
import { getProfile } from "../../data/mock";

function TopBar() {
  const navigate = useNavigate();
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-[#2E2822] backdrop-blur-lg" style={{ background: "rgba(15,13,11,0.88)" }}>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,#C8521A,#8B3A1F)" }}>
          <MapPin size={18} color="white" />
        </div>
        <div>
          <div className="font-display text-2xl font-bold leading-none tracking-tight" style={{ background: "linear-gradient(90deg,#E8A055,#C8521A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>matisa</div>
          <div className="flex items-center gap-1 text-[10px] text-[#8A7F74]"><MapPin size={9} /><span>Windhoek, Namibia</span></div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/notifications")} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#2E2822] bg-[#1C1814] text-[#F5F0EA]">
          <Bell size={17} />
          {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C8521A] px-1 text-[9px] font-bold text-white">{unread}</span>}
        </button>
        <button onClick={() => navigate("/messages")} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2E2822] bg-[#1C1814] text-[#F5F0EA]">
          <MessageSquare size={17} />
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
    { id: "/radar", icon: Radar, label: "Radar" },
    { id: "create", icon: Plus, label: "", isCenter: true },
    { id: "/events", icon: CalendarDays, label: "Events" },
    { id: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="sticky bottom-0 z-30 border-t border-[#2E2822] backdrop-blur-lg" style={{ background: "rgba(15,13,11,0.95)" }}>
      <div className="mx-auto flex max-w-md items-end justify-around px-1 py-1">
        {items.map(({ id, icon: Icon, label, isCenter }) => {
          if (isCenter) {
            return (
              <button key={id} onClick={onCreate} className="relative -top-3 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition active:scale-95" style={{ background: "linear-gradient(135deg,#C8521A,#8B3A1F)", boxShadow: "0 8px 32px rgba(200,82,26,0.45)" }}>
                <Plus size={26} strokeWidth={2.2} />
              </button>
            );
          }
          const active = path === id || (id === "/profile" && path.startsWith("/profile"));
          return (
            <button key={id} onClick={() => navigate(id)} className="flex flex-1 flex-col items-center gap-0.5 py-2 rounded-xl transition" style={{ color: active ? "#E8A055" : "#8A7F74" }}>
              <Icon size={21} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[9px] font-medium">{label}</span>
              {active && <span className="mt-0.5 h-1 w-1 rounded-full bg-[#C8521A]" />}
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
  const hideNav = ["/chat","/stories"].includes(location.pathname);
  const hideTop = ["/chat","/notifications","/stories","/settings","/bookings"].some(p => location.pathname.startsWith(p)) && location.pathname !== "/notifications";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col shadow-2xl shadow-black" style={{ background: "#0F0D0B" }}>
      {!hideTop && <TopBar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideNav && <BottomNav onCreate={() => setShowCompose(true)} />}
      {showCompose && (
        <div className="fixed inset-0 z-40 flex items-end justify-center animate-fade-in" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md animate-slide-up rounded-t-3xl border border-[#2E2822] p-5 shadow-2xl" style={{ background: "#1C1814" }}>
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
          </div>
        </div>
      )}
    </div>
  );
}
