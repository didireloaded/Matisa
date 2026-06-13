import { type ReactNode } from "react";
import { BadgeCheck, MapPin, Music2, Play, Mic, Image, Video } from "lucide-react";
import { getProfile, type Profile } from "@/data";

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({
  profile,
  size = 40,
  ring = false,
  online = false,
}: {
  profile: Profile;
  size?: number;
  ring?: boolean;
  online?: boolean;
}) {
  const inner = (
    <div
      className="flex h-full w-full items-center justify-center rounded-full text-white font-semibold select-none"
      style={{ background: profile.gradient, fontSize: size * 0.38 }}
    >
      {profile.displayName.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div className="relative flex-shrink-0" style={{ width: ring ? size + 6 : size, height: ring ? size + 6 : size }}>
      {ring ? (
        <div className="story-ring rounded-full h-full w-full p-[2.5px]">
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
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-[#0F0D0B] bg-[#4CAF7D]"
          style={{ width: 10, height: 10, bottom: ring ? 2 : 0, right: ring ? 2 : 0 }}
        />
      )}
    </div>
  );
}

export function AvatarById({ id, size = 40, ring = false }: { id: string; size?: number; ring?: boolean }) {
  const p = getProfile(id);
  return <Avatar profile={p} size={size} ring={ring} online={p.online} />;
}

// ─── Verified badge ───────────────────────────────────────────────────────────
export function Verified({ size = 14 }: { size?: number }) {
  return <BadgeCheck size={size} color="#2D7DD2" fill="#2D7DD2" strokeWidth={0} />;
}

// ─── Region / category pill ───────────────────────────────────────────────────
export function Chip({
  children,
  active = false,
  tone = "default",
  onClick,
  small = false,
}: {
  children: ReactNode;
  active?: boolean;
  tone?: "default" | "primary" | "success" | "sand" | "sky";
  onClick?: () => void;
  small?: boolean;
}) {
  const base =
    "inline-flex items-center gap-1 rounded-full border font-medium transition-all whitespace-nowrap select-none";
  const size = small ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]";

  const tones: Record<string, string> = {
    default: active
      ? "border-[#C8521A] bg-[#C8521A] text-white"
      : "border-[#2E2822] bg-[#1C1814] text-[#8A7F74] hover:border-[#C8521A]/40 hover:text-[#F5F0EA]",
    primary: "border-[#C8521A]/30 bg-[#C8521A]/10 text-[#E8A055]",
    success: "border-[#4CAF7D]/30 bg-[#4CAF7D]/10 text-[#4CAF7D]",
    sand:    "border-[#E8A055]/30 bg-[#E8A055]/10 text-[#E8A055]",
    sky:     "border-[#2D7DD2]/30 bg-[#2D7DD2]/10 text-[#2D7DD2]",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${size} ${tones[tone]}`}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {children}
    </button>
  );
}

// ─── Media grid ──────────────────────────────────────────────────────────────
const MEDIA_GRADIENTS = [
  "linear-gradient(135deg,#C8521A,#6B2D1A)",
  "linear-gradient(135deg,#2D7DD2,#1A3A60)",
  "linear-gradient(135deg,#E8A055,#8B5A1A)",
  "linear-gradient(135deg,#4CAF7D,#1A5C3A)",
];

export function MediaGrid({ count, kind = "image" }: { count: number; kind?: "image" | "video" }) {
  const items = Array.from({ length: Math.min(count, 4) });
  const gridClass =
    count === 1 ? "grid-cols-1" :
    count === 2 ? "grid-cols-2" :
    count === 3 ? "grid-cols-2" : "grid-cols-2";

  return (
    <div className={`mt-3 grid gap-0.5 overflow-hidden rounded-2xl border border-[#2E2822] ${gridClass}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className={`relative aspect-[4/3] ${count === 3 && i === 0 ? "row-span-2 aspect-auto" : ""}`}
          style={{ background: MEDIA_GRADIENTS[i % MEDIA_GRADIENTS.length] }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />
          {kind === "video" && i === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                <Play size={16} fill="white" color="white" />
              </div>
            </div>
          )}
          {count === 4 && i === 3 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="font-display text-2xl font-bold text-white">+1</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Voice / audio bar ───────────────────────────────────────────────────────
export function VoiceBar({ seconds, sent = false }: { seconds: number; sent?: boolean }) {
  const bars = Array.from({ length: 32 });
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 ${
        sent ? "bg-[#C8521A]/20 border border-[#C8521A]/25" : "bg-[#221D18] border border-[#2E2822]"
      }`}
    >
      <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C8521A] text-white">
        <Play size={12} fill="white" color="white" />
      </button>
      <div className="flex flex-1 items-center gap-[2px]">
        {bars.map((_, i) => {
          const h = 4 + Math.abs(Math.sin(i * 1.4 + 0.3)) * 18;
          const active = i < bars.length * 0.35;
          return (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: 2,
                height: h,
                background: active ? "#C8521A" : sent ? "rgba(200,82,26,0.3)" : "#2E2822",
              }}
            />
          );
        })}
      </div>
      <span className="flex-shrink-0 text-[10px] font-medium text-[#8A7F74]">
        0:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

// ─── Reel card ───────────────────────────────────────────────────────────────
export function ReelCard({ gradient, profile }: { gradient: string; profile: Profile }) {
  return (
    <div
      className="relative w-44 flex-shrink-0 overflow-hidden rounded-2xl border border-[#2E2822]"
      style={{ aspectRatio: "9/16", background: gradient }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          <Play size={18} fill="white" color="white" />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center gap-1.5">
          <Avatar profile={profile} size={22} />
          <span className="text-[11px] font-semibold text-white">@{profile.username}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Song card ───────────────────────────────────────────────────────────────
export function SongCard({ title, artist }: { title: string; artist: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#2E2822] bg-[#221D18] p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C8521A] to-[#2D7DD2] text-white">
        <Music2 size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-[#F5F0EA]">{title}</div>
        <div className="truncate text-xs text-[#8A7F74]">{artist}</div>
      </div>
      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C8521A] text-white">
        <Play size={12} fill="white" color="white" />
      </button>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="font-display text-lg font-bold text-[#F5F0EA]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-[#8A7F74]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Stat badge row ───────────────────────────────────────────────────────────
export function StatRow({ followers, following, posts }: { followers: number; following: number; posts: number }) {
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  return (
    <div className="flex gap-6 text-sm">
      {[["Posts", fmt(posts)], ["Followers", fmt(followers)], ["Following", fmt(following)]].map(([label, val]) => (
        <div key={label}>
          <span className="font-bold text-[#F5F0EA]">{val}</span>{" "}
          <span className="text-[#8A7F74]">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#2E2822] bg-[#1C1814] text-[#8A7F74]">
        {icon}
      </div>
      <div className="font-display text-base font-bold text-[#F5F0EA]">{title}</div>
      <p className="mt-1 max-w-xs text-sm text-[#8A7F74]">{sub}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Media type icon row ─────────────────────────────────────────────────────
export function AttachBar({ onImage, onVideo, onMic, onLocation }: {
  onImage?: () => void;
  onVideo?: () => void;
  onMic?: () => void;
  onLocation?: () => void;
}) {
  const btns = [
    { icon: <Image size={18} />, fn: onImage },
    { icon: <Video size={18} />, fn: onVideo },
    { icon: <Mic size={18} />, fn: onMic },
    { icon: <MapPin size={18} />, fn: onLocation },
  ];
  return (
    <div className="flex items-center gap-1">
      {btns.map((b, i) => (
        <button
          key={i}
          onClick={b.fn}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#E8A055] transition hover:bg-[#221D18]"
        >
          {b.icon}
        </button>
      ))}
    </div>
  );
}
