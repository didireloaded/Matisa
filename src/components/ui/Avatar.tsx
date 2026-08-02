import { forwardRef, useState } from "react";
import type { Profile } from "@/types";
import { Check, Flame, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const GRADIENTS = [
  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
  "linear-gradient(135deg, var(--color-secondary), var(--color-primary))",
  "linear-gradient(135deg, var(--color-success), var(--color-secondary))",
  "linear-gradient(135deg, var(--color-warning), var(--color-primary))",
  "linear-gradient(135deg, var(--color-error), var(--color-primary))",
  "linear-gradient(135deg, var(--color-primary), var(--color-background))",
  "linear-gradient(135deg, var(--color-secondary), var(--color-background))",
];

export function pickGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export interface AvatarProps {
  profile?: Pick<Profile, "id" | "display_name" | "avatar_url"> | Partial<Profile> | any;
  size?: number | "sm" | "md" | "lg" | "xl" | "2xl";
  ring?: boolean;
  isOnline?: boolean; // Only true when real presence exists
  badge?: "verified" | "trending" | "rising";
  className?: string;
  onClick?: () => void;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    { profile, size = "md", ring = false, isOnline = false, badge, className = "", onClick },
    ref,
  ) => {
    const [imgError, setImgError] = useState(false);

    // Map string sizes to pixel values for consistency with the new logic
    const sizeMap: Record<string, number> = {
      sm: 32,
      md: 48,
      lg: 64,
      xl: 80,
      "2xl": 112,
    };

    const numericSize = typeof size === "number" ? size : sizeMap[size] || 48;

    const grad = pickGradient(profile?.id || "default");
    const displayName = profile?.display_name || "?";
    const letter = displayName[0].toUpperCase();
    const fontSize = Math.floor(numericSize * 0.38);

    const inner =
      profile?.avatar_url && !imgError ? (
        <img
          src={profile.avatar_url}
          alt={displayName}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-semibold text-white select-none"
          style={{ background: grad, fontSize }}
        >
          {letter}
        </div>
      );

    const wrapSize = ring ? numericSize + 6 : numericSize;

    return (
      <div
        ref={ref}
        className={`relative inline-block rounded-full flex-shrink-0 ${className} ${onClick ? "cursor-pointer" : ""}`}
        style={{ width: wrapSize, height: wrapSize }}
        onClick={onClick}
      >
        <motion.div whileTap={onClick ? { scale: 0.95 } : {}} className="w-full h-full">
          {ring ? (
            <div className="story-ring h-full w-full rounded-full p-[2.5px]">
              <div className="rounded-full overflow-hidden h-full w-full bg-[var(--color-surface-2)]">
                {inner}
              </div>
            </div>
          ) : (
            <div
              className="rounded-full overflow-hidden border-[1.5px] border-[var(--color-surface)] bg-[var(--color-surface-2)]"
              style={{ width: numericSize, height: numericSize }}
            >
              {inner}
            </div>
          )}
        </motion.div>

        {isOnline && (
          <span
            className="absolute rounded-full border-2 border-[var(--color-background)] bg-[var(--color-success)] shadow-[0_0_8px_rgba(16,185,129,0.6)]"
            style={{
              width: numericSize * 0.25,
              height: numericSize * 0.25,
              bottom: ring ? 2 : 0,
              right: ring ? 2 : 0,
            }}
          />
        )}

        {badge && (
          <div
            className="absolute rounded-full border-2 border-[var(--color-background)] flex items-center justify-center shadow-md"
            style={{
              width: numericSize * 0.35,
              height: numericSize * 0.35,
              bottom: ring ? 0 : -2,
              right: ring ? 0 : -2,
              backgroundColor:
                badge === "verified"
                  ? "var(--color-secondary)"
                  : badge === "trending"
                    ? "var(--color-primary)"
                    : "var(--color-warning)",
            }}
          >
            {badge === "verified" && (
              <Check
                className="text-white"
                style={{ width: numericSize * 0.2, height: numericSize * 0.2 }}
                strokeWidth={3}
              />
            )}
            {badge === "trending" && (
              <Flame
                className="text-white"
                style={{ width: numericSize * 0.2, height: numericSize * 0.2 }}
                strokeWidth={2.5}
              />
            )}
            {badge === "rising" && (
              <TrendingUp
                className="text-white"
                style={{ width: numericSize * 0.2, height: numericSize * 0.2 }}
                strokeWidth={2.5}
              />
            )}
          </div>
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";
