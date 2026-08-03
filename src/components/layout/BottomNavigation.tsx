import { Home, Search, Plus, Mic, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

interface BottomNavigationProps {
  onOpenCreate?: () => void;
}

export function BottomNavigation({ onOpenCreate }: BottomNavigationProps) {
  const location = useLocation();
  const path = location.pathname;

  const isHomeActive = path === "/";
  const isExploreActive = path === "/explore" || path.startsWith("/explore");
  const isRoomsActive = path === "/rooms" || path.startsWith("/rooms");
  const isProfileActive = path === "/profile" || path.startsWith("/profile");

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-50 flex w-[94%] max-w-[395px] -translate-x-1/2 items-center justify-between px-2 py-1.5 rounded-full glass-panel-elevated shadow-2xl border border-white/20 backdrop-blur-2xl bg-[#06101D]/90"
      style={{
        marginBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* 1. Home */}
      <Link
        to="/"
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition active:scale-95 ${
          isHomeActive
            ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
            : "text-white/50 hover:text-white"
        }`}
        aria-label="Home"
      >
        <Home size={18} />
        {isHomeActive && <span className="text-xs font-bold">Home</span>}
      </Link>

      {/* 2. Explore */}
      <Link
        to="/explore"
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition active:scale-95 ${
          isExploreActive
            ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
            : "text-white/50 hover:text-white"
        }`}
        aria-label="Explore"
      >
        <Search size={18} />
        {isExploreActive && <span className="text-xs font-bold">Explore</span>}
      </Link>

      {/* 3. Center Elevated Create Trigger */}
      <button
        onClick={onOpenCreate}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF9D2E] via-[#24A3C7] to-[#6139F2] text-white shadow-[0_0_16px_rgba(36,163,199,0.6)] border border-white/40 active:scale-90 transition hover:opacity-90 -mt-2.5 mx-0.5"
        aria-label="Create"
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>

      {/* 4. Rooms */}
      <Link
        to="/rooms"
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition active:scale-95 ${
          isRoomsActive
            ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
            : "text-white/50 hover:text-white"
        }`}
        aria-label="Rooms"
      >
        <Mic size={18} />
        {isRoomsActive && <span className="text-xs font-bold">Rooms</span>}
      </Link>

      {/* 5. Profile */}
      <Link
        to="/profile"
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition active:scale-95 ${
          isProfileActive
            ? "bg-white/20 text-white font-bold text-xs shadow-md border border-white/30 backdrop-blur-md"
            : "text-white/50 hover:text-white"
        }`}
        aria-label="Profile"
      >
        <User size={18} />
        {isProfileActive && <span className="text-xs font-bold">Profile</span>}
      </Link>
    </nav>
  );
}

export default BottomNavigation;
