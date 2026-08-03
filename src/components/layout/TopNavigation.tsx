import { Bell, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TopNavigation() {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-40 grid grid-cols-3 items-center px-5 pb-3 bg-gradient-to-b from-[#06101D] via-[#06101D]/90 to-transparent backdrop-blur-md"
      style={{
        paddingTop: "calc(12px + env(safe-area-inset-top))",
      }}
    >
      {/* 1. Left Spacer (Width matched to right column for absolute center) */}
      <div className="flex items-center justify-start" />

      {/* 2. Absolute Centered Brand Title */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-90 transition active:scale-95"
        >
          <span className="text-xl font-extrabold tracking-tight text-white font-display">
            Matisa
          </span>
        </button>
      </div>

      {/* 3. Right Header Actions */}
      <div className="flex items-center justify-end gap-2.5">
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

export default TopNavigation;
