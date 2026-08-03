import { Home, Search, Plus, Mic, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

interface BottomNavigationProps {
  onOpenCreate?: () => void;
  compact?: boolean;
}

export function BottomNavigation({ onOpenCreate, compact = false }: BottomNavigationProps) {
  const location = useLocation();
  const path = location.pathname;

  const isHomeActive = path === "/";
  const isExploreActive = path === "/explore" || path.startsWith("/explore");
  const isRoomsActive = path === "/rooms" || path.startsWith("/rooms");
  const isProfileActive = path === "/profile" || path.startsWith("/profile");

  return (
    <nav
      className={`fixed left-1/2 z-50 grid grid-cols-5 items-center -translate-x-1/2 overflow-hidden rounded-full border border-white/20 bg-[#06101D]/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-out ${
        compact
          ? "bottom-3 h-12 w-[76%] max-w-[310px] px-1.5 opacity-95"
          : "bottom-4 h-14 w-[94%] max-w-[395px] px-2"
      }`}
      style={{
        marginBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* 1. Home */}
      <Link
        to="/"
        className="flex items-center justify-center gap-1 py-1.5 rounded-full transition active:scale-95 text-white/50 hover:text-white"
        aria-label="Home"
      >
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
            isHomeActive
              ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
              : "text-white/50"
          }`}
        >
          <Home size={18} />
          {isHomeActive && !compact && <span className="text-xs font-bold">Home</span>}
        </div>
      </Link>

      {/* 2. Explore */}
      <Link
        to="/explore"
        className="flex items-center justify-center gap-1 py-1.5 rounded-full transition active:scale-95 text-white/50 hover:text-white"
        aria-label="Explore"
      >
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
            isExploreActive
              ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
              : "text-white/50"
          }`}
        >
          <Search size={18} />
          {isExploreActive && !compact && <span className="text-xs font-bold">Explore</span>}
        </div>
      </Link>

      {/* 3. Center Create Trigger (100% contained inside dock) */}
      <button
        onClick={onOpenCreate}
        className={`mx-auto flex shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF9D2E] via-[#24A3C7] to-[#6139F2] text-white shadow-[0_0_12px_rgba(36,163,199,0.55)] border border-white/40 active:scale-90 transition-all duration-300 hover:opacity-90 ${
          compact ? "h-8 w-8" : "h-9 w-9"
        }`}
        aria-label="Create"
      >
        <Plus size={compact ? 17 : 19} strokeWidth={2.5} />
      </button>

      {/* 4. Rooms */}
      <Link
        to="/rooms"
        className="flex items-center justify-center gap-1 py-1.5 rounded-full transition active:scale-95 text-white/50 hover:text-white"
        aria-label="Rooms"
      >
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
            isRoomsActive
              ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
              : "text-white/50"
          }`}
        >
          <Mic size={18} />
          {isRoomsActive && !compact && <span className="text-xs font-bold">Rooms</span>}
        </div>
      </Link>

      {/* 5. Profile */}
      <Link
        to="/profile"
        className="flex items-center justify-center gap-1 py-1.5 rounded-full transition active:scale-95 text-white/50 hover:text-white"
        aria-label="Profile"
      >
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
            isProfileActive
              ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
              : "text-white/50"
          }`}
        >
          <User size={18} />
          {isProfileActive && !compact && <span className="text-xs font-bold">Profile</span>}
        </div>
      </Link>
    </nav>
  );
}

export default BottomNavigation;
