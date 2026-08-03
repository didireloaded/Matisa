import { Menu, Bell, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TopNavigation() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-5 pt-4 pb-3 bg-gradient-to-b from-[#06101D] via-[#06101D]/80 to-transparent backdrop-blur-md">
      {/* Left Menu Button */}
      <button
        onClick={() => navigate("/settings")}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95 border border-white/10"
        aria-label="Menu Settings"
      >
        <div className="flex flex-col gap-1 w-4">
          <span className="h-[2px] w-full bg-white rounded-full" />
          <span className="h-[2px] w-full bg-white rounded-full" />
        </div>
      </button>

      {/* Center Brand Title */}
      <button onClick={() => navigate("/")} className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight text-white font-display">Matisa</span>
      </button>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => navigate("/activity")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95 border border-white/10"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          onClick={() => navigate("/messages")}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95 border border-white/10"
          aria-label="Messages"
        >
          <MessageCircle size={18} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
        </button>
      </div>
    </header>
  );
}
