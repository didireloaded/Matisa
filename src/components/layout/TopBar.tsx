import { Bell, MessageCircle } from "lucide-react";

interface TopBarProps {
  onOpenMessages: () => void;
  onOpenActivity: () => void;
  onGoHome: () => void;
  unreadMessagesCount?: number;
  unreadActivityCount?: number;
}

export function TopBar({
  onOpenMessages,
  onOpenActivity,
  onGoHome,
  unreadMessagesCount = 0,
  unreadActivityCount = 0,
}: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 glass-header"
      style={{
        paddingTop: "max(14px, env(safe-area-inset-top))",
        paddingBottom: "14px",
      }}
    >
      {/* Brand logo trigger */}
      <button
        onClick={onGoHome}
        className="flex items-center gap-2.5 text-left transition active:scale-95"
        aria-label="Matisa Home"
      >
        <div className="grid grid-cols-2 gap-[3px] p-1 rounded-lg bg-white/5 border border-white/10">
          <div className="h-2.5 w-2.5 rounded-xs bg-[#FF9D2E]" />
          <div className="h-2.5 w-2.5 rounded-xs bg-[#24A3C7]" />
          <div className="h-2.5 w-2.5 rounded-xs bg-white" />
          <div className="h-2.5 w-2.5 rounded-xs bg-[#6139F2]" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white font-display">Matisa</span>
      </button>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenMessages}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] border border-white/10 text-white/80 transition hover:bg-white/10 active:scale-90"
          aria-label="Messages"
        >
          <MessageCircle size={19} />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF9D2E] text-[9px] font-bold text-black shadow-md">
              {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenActivity}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] border border-white/10 text-white/80 transition hover:bg-white/10 active:scale-90"
          aria-label="Activity"
        >
          <Bell size={19} />
          {unreadActivityCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#24A3C7] text-[9px] font-bold text-black shadow-md">
              {unreadActivityCount > 9 ? "9+" : unreadActivityCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
