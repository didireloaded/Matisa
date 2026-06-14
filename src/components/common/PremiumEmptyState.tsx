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
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="relative mb-6">
        {/* Glow behind the icon */}
        <div
          className="absolute inset-0 blur-xl opacity-30 rounded-full"
          style={{ backgroundColor: hexColor }}
        />
        <div className="relative w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center">
          <Icon className="w-8 h-8 text-foreground" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[250px] mb-8 leading-relaxed">
        {description}
      </p>

      {action && <div className="mt-2">{renderAction()}</div>}
    </div>
  );
}
