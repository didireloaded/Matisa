import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface PremiumEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode | { label: string; onClick: () => void };
  glowColor?: string; // e.g. 'primary', 'secondary', 'accent1'
}

export function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  action,
  glowColor = "primary",
}: PremiumEmptyStateProps) {
  // Map our semantic tokens to literal colors for the drop shadow glow
  const glowHexMap: Record<string, string> = {
    primary: "#FF9D2E",
    secondary: "#A855F7",
    accent1: "#00E5FF",
    accent2: "#FFD700",
    accent3: "#FF6B6B",
    accent4: "#32CD32",
  };

  const hexColor = glowHexMap[glowColor] || glowHexMap.primary;

  const renderAction = () => {
    if (!action) return null;

    if (typeof action === "object" && "label" in action && "onClick" in action) {
      return (
        <button
          onClick={(action as any).onClick}
          className="px-6 py-3 rounded-full bg-primary text-black font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-[0_0_15px_rgba(255,157,46,0.3)]"
        >
          {(action as any).label}
        </button>
      );
    }

    return action as ReactNode;
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4 border border-white/[0.06]">
        <Icon className="w-7 h-7 text-white/30" />
      </div>

      <h3 className="text-sm font-semibold text-white/70 tracking-tight">{title}</h3>
      <p className="text-xs text-white/40 max-w-[240px] mt-1 leading-relaxed">{description}</p>

      {action && <div className="mt-5">{renderAction()}</div>}
    </div>
  );
}
