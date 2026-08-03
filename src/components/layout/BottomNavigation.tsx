import { useState, useEffect } from "react";
import { Home, Search, Plus, Mic, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

interface BottomNavigationProps {
  onOpenCreate?: () => void;
}

export function BottomNavigation({ onOpenCreate }: BottomNavigationProps) {
  const location = useLocation();
  const path = location.pathname;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 60 && currentScrollY > lastScrollY) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomeActive = path === "/";
  const isExploreActive = path === "/explore" || path.startsWith("/explore");
  const isRoomsActive = path === "/rooms" || path.startsWith("/rooms");
  const isProfileActive = path === "/profile" || path.startsWith("/profile");

  return (
    <nav
      className={`fixed bottom-4 left-1/2 z-50 flex items-center justify-between transition-all duration-300 ease-in-out -translate-x-1/2 glass-panel-elevated shadow-2xl border border-white/20 backdrop-blur-2xl bg-[#06101D]/90 rounded-full ${
        isScrolled
          ? "w-[80%] max-w-[320px] px-3 py-1 scale-95 opacity-90 hover:opacity-100"
          : "w-[94%] max-w-[395px] px-2 py-1.5"
      }`}
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
        {isHomeActive && !isScrolled && <span className="text-xs font-bold">Home</span>}
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
        {isExploreActive && !isScrolled && <span className="text-xs font-bold">Explore</span>}
      </Link>

      {/* 3. Center Create Trigger (Contained completely inside dock) */}
      <button
        onClick={onOpenCreate}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF9D2E] via-[#24A3C7] to-[#6139F2] text-white shadow-[0_0_12px_rgba(36,163,199,0.6)] border border-white/40 active:scale-90 transition hover:opacity-90 mx-0.5"
        aria-label="Create"
      >
        <Plus size={19} strokeWidth={2.5} />
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
        {isRoomsActive && !isScrolled && <span className="text-xs font-bold">Rooms</span>}
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
        {isProfileActive && !isScrolled && <span className="text-xs font-bold">Profile</span>}
      </Link>
    </nav>
  );
}

export default BottomNavigation;
