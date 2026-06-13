import { useState } from 'react';
import type { Profile } from "@/types";
import { pickGradient } from "./Tokens";

interface AvatarProps {
  profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>;
  size?: number;
  ring?: boolean;
  showOnline?: boolean;
}

export function Avatar({ profile, size = 40, ring = false, showOnline = false }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const grad = pickGradient(profile.id);
  const letter = (profile.display_name || '?')[0].toUpperCase();
  const fontSize = Math.floor(size * 0.38);

  const inner = profile.avatar_url && !imgError ? (
    <img
      src={profile.avatar_url}
      alt={profile.display_name}
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
    <div className="relative flex-shrink-0" style={{ width: wrapSize, height: wrapSize }}>
      {ring ? (
        <div className="story-ring h-full w-full rounded-full p-[2.5px]">
          <div className="rounded-full overflow-hidden h-full w-full">{inner}</div>
        </div>
      ) : (
        <div className="rounded-full overflow-hidden ring-1 ring-black/20" style={{ width: size, height: size }}>
          {inner}
        </div>
      )}
      {showOnline && (
        <span
          className="absolute rounded-full border-2 border-[#0F0D0B] bg-[#4CAF7D]"
          style={{ width: 10, height: 10, bottom: ring ? 2 : 0, right: ring ? 2 : 0 }}
        />
      )}
    </div>
  );
}
