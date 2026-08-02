import { NavLink } from "react-router-dom";
import { Home, Compass, Plus, MessageSquare, User } from "lucide-react";

interface PrimaryNavigationProps {
  onCreate: () => void;
}

export function PrimaryNavigation({ onCreate }: PrimaryNavigationProps) {
  const getLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
      isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] hover:text-white"
    }`;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-safe pt-2 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)] to-transparent z-40 pointer-events-none">
      <nav className="flex items-center justify-between px-6 h-[64px] rounded-[32px] glass-panel border border-[var(--color-border)] pointer-events-auto shadow-2xl shadow-black/50 mb-4">
        <NavLink to="/" aria-label="Home" className={getLinkClasses}>
          <Home size={24} strokeWidth={2} />
        </NavLink>
        <NavLink to="/explore" aria-label="Explore" className={getLinkClasses}>
          <Compass size={24} strokeWidth={2} />
        </NavLink>

        <button
          onClick={onCreate}
          aria-label="Create"
          className="flex items-center justify-center min-h-[44px] min-w-[44px] w-14 h-14 rounded-full bg-[var(--color-primary)] text-white transition-colors hover:bg-orange-400 relative -top-5"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>

        <NavLink to="/inbox" aria-label="Inbox" className={getLinkClasses}>
          <MessageSquare size={24} strokeWidth={2} />
        </NavLink>
        <NavLink to="/profile" aria-label="Profile" className={getLinkClasses}>
          <User size={24} strokeWidth={2} />
        </NavLink>
      </nav>
    </div>
  );
}
