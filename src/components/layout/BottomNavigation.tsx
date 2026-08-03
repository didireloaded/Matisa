import { Home, Search, Plus, Mic, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface BottomNavigationProps {
  onOpenCreate?: () => void;
}

export function BottomNavigation({ onOpenCreate }: BottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-50 flex w-[92%] max-w-[385px] -translate-x-1/2 items-center justify-between px-3 py-2 rounded-full glass-panel-elevated shadow-2xl border border-white/20 backdrop-blur-2xl"
      style={{
        marginBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* 1. Home */}
      <button
        onClick={() => navigate("/")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition active:scale-95 ${
          path === "/"
            ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
            : "text-white/50 hover:text-white"
        }`}
        aria-label="Home"
      >
        <Home size={19} />
        {path === "/" && <span>Home</span>}
      </button>

      {/* 2. Explore */}
      <button
        onClick={() => navigate("/explore")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition active:scale-95 ${
          path === "/explore" || path.startsWith("/explore")
            ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
            : "text-white/50 hover:text-white"
        }`}
        aria-label="Explore"
      >
        <Search size={19} />
        {(path === "/explore" || path.startsWith("/explore")) && <span>Explore</span>}
      </button>

      {/* 3. Center Elevated Create Trigger */}
      <button
        onClick={onOpenCreate}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF9D2E] via-[#24A3C7] to-[#6139F2] text-white shadow-[0_0_16px_rgba(36,163,199,0.6)] border border-white/40 active:scale-90 transition hover:opacity-90 -mt-3"
        aria-label="Create"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* 4. Rooms */}
      <button
        onClick={() => navigate("/rooms")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition active:scale-95 ${
          path === "/rooms" || path.startsWith("/rooms")
            ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
            : "text-white/50 hover:text-white"
        }`}
        aria-label="Rooms"
      >
        <Mic size={19} />
        {(path === "/rooms" || path.startsWith("/rooms")) && <span>Rooms</span>}
      </button>

      {/* 5. Profile */}
      <button
        onClick={() => navigate("/profile")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition active:scale-95 ${
          path === "/profile" || path.startsWith("/profile")
            ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
            : "text-white/50 hover:text-white"
        }`}
        aria-label="Profile"
      >
        <User size={19} />
        {(path === "/profile" || path.startsWith("/profile")) && <span>Profile</span>}
      </button>
    </nav>
  );
}
