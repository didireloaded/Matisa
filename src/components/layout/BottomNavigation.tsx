import { Home, Search, Plus, Radio, User } from "lucide-react";
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
      className={`fixed left-1/2 z-50 grid grid-cols-5 items-center -translate-x-1/2 overflow-hidden rounded-full border border-white/20 bg-black/60 shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-out hover:opacity-100 ${
        compact
          ? "bottom-3 h-11 w-[70%] max-w-[280px] px-1 opacity-80 translate-y-1 scale-95"
          : "bottom-4 h-14 w-[92%] max-w-[390px] px-2 opacity-100 translate-y-0 scale-100"
      }`}
      style={{
        marginBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* 1. Home */}
      <Link
        to="/"
        className="flex items-center justify-center py-1.5 rounded-full transition active:scale-95 text-white/50 hover:text-white"
        aria-label="Home"
      >
        <div
          className={`flex items-center justify-center p-2 rounded-full transition ${
            isHomeActive ? "text-[#FF9D2E]" : "text-white/60 hover:text-white"
          }`}
        >
          <Home size={20} strokeWidth={isHomeActive ? 2.5 : 2} />
        </div>
      </Link>

      {/* 2. Explore */}
      <Link
        to="/explore"
        className="flex items-center justify-center py-1.5 rounded-full transition active:scale-95 text-white/50 hover:text-white"
        aria-label="Explore"
      >
        <div
          className={`flex items-center justify-center p-2 rounded-full transition ${
            isExploreActive ? "text-[#FF9D2E]" : "text-white/60 hover:text-white"
          }`}
        >
          <Search size={20} strokeWidth={isExploreActive ? 2.5 : 2} />
        </div>
      </Link>

      {/* 3. Center Create Trigger (Raised circular white pill) */}
      <button
        onClick={onOpenCreate}
        className={`mx-auto flex shrink-0 items-center justify-center rounded-full bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.4)] border border-white/80 active:scale-90 transition-all duration-300 hover:scale-105 ${
          compact ? "h-8 w-8" : "h-10 w-10"
        }`}
        aria-label="Create"
      >
        <Plus size={compact ? 18 : 22} strokeWidth={3} className="text-black" />
      </button>

      {/* 4. Rooms */}
      <Link
        to="/rooms"
        className="flex items-center justify-center py-1.5 rounded-full transition active:scale-95 text-white/50 hover:text-white"
        aria-label="Rooms"
      >
        <div
          className={`flex items-center justify-center p-2 rounded-full transition ${
            isRoomsActive ? "text-[#FF9D2E]" : "text-white/60 hover:text-white"
          }`}
        >
          <Radio size={20} strokeWidth={isRoomsActive ? 2.5 : 2} />
        </div>
      </Link>

      {/* 5. Profile */}
      <Link
        to="/profile"
        className="flex items-center justify-center py-1.5 rounded-full transition active:scale-95 text-white/50 hover:text-white"
        aria-label="Profile"
      >
        <div
          className={`flex items-center justify-center p-2 rounded-full transition ${
            isProfileActive ? "text-[#FF9D2E]" : "text-white/60 hover:text-white"
          }`}
        >
          <User size={20} strokeWidth={isProfileActive ? 2.5 : 2} />
        </div>
      </Link>
    </nav>
  );
}

export default BottomNavigation;
