import { useState } from "react";
import type { Profile } from "@/types";
import { Check, Flame, TrendingUp } from "lucide-react";

const GRADIENTS = [
  "linear-gradient(135deg, var(--primary), var(--accent3))",
  "linear-gradient(135deg, var(--secondary), var(--accent3))",
  "linear-gradient(135deg, var(--accent1), var(--secondary))",
  "linear-gradient(135deg, var(--accent4), var(--accent1))",
  "linear-gradient(135deg, var(--accent2), var(--primary))",
  "linear-gradient(135deg, var(--accent3), var(--secondary))",
  "linear-gradient(135deg, var(--primary), var(--background))",
  "linear-gradient(135deg, var(--secondary), var(--background))",
];

export function pickGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

interface AvatarProps {
  profile: Pick<Profile, "id" | "display_name" | "avatar_url"> | Partial<Profile>;
  size?: number;
  ring?: boolean;
  showStatus?: boolean;
  isOnline?: boolean;
  showBadge?: boolean;
  className?: string;
  badge?: "verified" | "trending" | "rising";
}

export function Avatar({
  profile,
  size = 40,
  ring = false,
  showStatus = false,
  isOnline = false,
  showBadge = false,
  className = "",
  badge,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const grad = pickGradient(profile.id || "");
  const letter = (profile.display_name || "?")[0].toUpperCase();
  const fontSize = Math.floor(size * 0.38);

  const inner =
    profile.avatar_url && !imgError ? (
      <img
        src={profile.avatar_url}
        alt={profile.display_name || "avatar"}
        className="h-full w-full object-cover"
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

  const wrapSize = ring ? size + 6 : size;

  return (
    <div
      className={`relative rounded-full flex-shrink-0 ${className}`}
      style={{ width: wrapSize, height: wrapSize }}
    >
      {ring ? (
        <div className="story-ring h-full w-full rounded-full p-[2.5px]">
          <div className="rounded-full overflow-hidden h-full w-full">{inner}</div>
        </div>
      ) : (
        <div
          className="rounded-full overflow-hidden ring-1 ring-black/20"
          style={{ width: size, height: size }}
        >
          {inner}
        </div>
      )}
      {showStatus && isOnline && (
        <span
          className="absolute rounded-full border-2 border-background bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.6)]"
          style={{
            width: size * 0.25,
            height: size * 0.25,
            bottom: ring ? 2 : 0,
            right: ring ? 2 : 0,
          }}
        />
      )}
      {badge && (
        <div
          className="absolute rounded-full border-2 border-background flex items-center justify-center shadow-md"
          style={{
            width: size * 0.35,
            height: size * 0.35,
            bottom: ring ? 0 : -2,
            right: ring ? 0 : -2,
            backgroundColor:
              badge === "verified" ? "#00E5FF" : badge === "trending" ? "#FF9D2E" : "#A855F7",
          }}
        >
          {badge === "verified" && (
            <Check
              className="text-black"
              style={{ width: size * 0.2, height: size * 0.2 }}
              strokeWidth={3}
            />
          )}
          {badge === "trending" && (
            <Flame
              className="text-black"
              style={{ width: size * 0.2, height: size * 0.2 }}
              strokeWidth={2.5}
            />
          )}
          {badge === "rising" && (
            <TrendingUp
              className="text-black"
              style={{ width: size * 0.2, height: size * 0.2 }}
              strokeWidth={2.5}
            />
          )}
        </div>
      )}
    </div>
  );
}
