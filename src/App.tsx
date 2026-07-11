import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Heart,
  Home,
  Loader2,
  LogOut,
  MapPin,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Music2,
  Play,
  Plus,
  Radar,
  Repeat2,
  Search,
  Send,
  Share2,
  Smile,
  Ticket,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { supabase } from "./utils/supabase";

type Screen = "home" | "explore" | "events" | "karaoke" | "activity" | "profile" | "messages";
type AsyncState = "loading" | "ready" | "error";

type Profile = {
  id: string;
  username?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  city?: string | null;
  location?: string | null;
  is_verified?: boolean | null;
  followers_count?: number | null;
  following_count?: number | null;
  posts_count?: number | null;
};

type Note = {
  id: string;
  content?: string | null;
  text?: string | null;
  created_at?: string | null;
  user_id?: string | null;
  profiles?: Profile | Profile[] | null;
};

type EventRow = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  image_url?: string | null;
  start_at?: string | null;
  current_attendees?: number | null;
  capacity?: number | null;
};

const gradients = [
  "linear-gradient(135deg,#1a1a2e,#16213e)",
  "linear-gradient(135deg,#2d1b00,#1a0f00)",
  "linear-gradient(135deg,#1a0a00,#2d1500)",
  "linear-gradient(135deg,#1a001a,#0d000d)",
  "linear-gradient(135deg,#001a0d,#000d07)",
  "linear-gradient(135deg,#1a0500,#0d0200)",
];

const trendingTags = [
  ["#NamibiaRising", "12.4K"],
  ["#WindhoekNights", "8.7K"],
  ["#KatuturaStyle", "5.2K"],
  ["#AfrobeatsNAM", "4.9K"],
  ["#SossusRave2025", "3.1K"],
  ["#NamCulture", "2.8K"],
];

const discoveryImages = [
  "https://images.unsplash.com/photo-1528508670332-4c687dae6295?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1606416132922-22ab37c1231e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1689864727821-e47577e88226?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1488197047962-b48492212cda?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1770283553838-769c5f97d55c?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1731662784037-9b2f21819caa?w=300&h=300&fit=crop",
];

const fallbackProfiles: Profile[] = [
  {
    id: "u_ndina",
    username: "ndina",
    display_name: "Ndina Matisa",
    bio: "Voice rooms, nearby discovery, music, and community stories.",
    city: "Windhoek",
    avatar_url: "",
    followers_count: 12800,
    following_count: 240,
    posts_count: 84,
    is_verified: true,
  },
  {
    id: "u_tangeni",
    username: "tangeni",
    display_name: "Tangeni I.",
    bio: "DJ, event host, and weekend connector.",
    city: "Katutura",
    followers_count: 8400,
    following_count: 510,
    posts_count: 42,
  },
  {
    id: "u_didi",
    username: "didi",
    display_name: "Didi Reloaded",
    bio: "Building social tools for Southern African creators.",
    city: "Windhoek",
    followers_count: 5300,
    following_count: 190,
    posts_count: 66,
  },
];

const fallbackNotes: Note[] = [
  {
    id: "n1",
    content:
      "Who is around Windhoek tonight? Opening a voice room for creators testing event ideas.",
    created_at: new Date().toISOString(),
    profiles: fallbackProfiles[0],
  },
  {
    id: "n2",
    content: "Karaoke queue is warming up. Bring one chorus and one friend.",
    created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    profiles: fallbackProfiles[1],
  },
];

const fallbackEvents: EventRow[] = [
  {
    id: "e1",
    title: "Windhoek Rooftop Sessions",
    description: "Live room first, city gathering after. Music, stories, and creator intros.",
    location: "Windhoek CBD",
    start_at: new Date().toISOString(),
    current_attendees: 145,
    capacity: 220,
  },
  {
    id: "e2",
    title: "Creator Mixer: Nearby",
    description: "Meet people close to you and build your next collaboration.",
    location: "The Village",
    current_attendees: 82,
    capacity: 120,
  },
  {
    id: "e3",
    title: "Matisa Karaoke League",
    description: "Weekly team karaoke with live scoring and social tickets.",
    location: "Warehouse Theatre",
    current_attendees: 64,
    capacity: 90,
  },
];

function profileName(profile?: Profile | null) {
  return profile?.display_name || profile?.full_name || profile?.username || "Matisa creator";
}

function profileInitial(profile?: Profile | null) {
  return profileName(profile).charAt(0).toUpperCase();
}

function normalizeProfile(value?: Profile | Profile[] | null) {
  return Array.isArray(value) ? value[0] : value;
}

function fmt(value?: number | null) {
  if (!value) return "0";
  if (value > 999999) return `${(value / 1000000).toFixed(1)}M`;
  if (value > 999) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}

function timeLabel(value?: string | null) {
  if (!value) return "now";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function Avatar({
  profile,
  size = 42,
  ring = false,
  index = 0,
}: {
  profile?: Profile | null;
  size?: number;
  ring?: boolean;
  index?: number;
}) {
  const gradient = gradients[index % gradients.length];
  const inner = profile?.avatar_url ? (
    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
  ) : (
    <div
      className="flex h-full w-full items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ background: gradient }}
    >
      {profileInitial(profile)}
    </div>
  );

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: ring ? size + 6 : size, height: ring ? size + 6 : size }}
    >
      {ring ? (
        <div className="story-ring h-full w-full rounded-full p-[2.5px]">
          <div className="h-full w-full overflow-hidden rounded-full">{inner}</div>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-full ring-1 ring-black/20"
          style={{ width: size, height: size }}
        >
          {inner}
        </div>
      )}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B0B0B] bg-[#4CAF7D]" />
    </div>
  );
}

function Verified() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="#2D7DD2" aria-hidden="true">
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function TopBar({
  setActive,
  user,
  onSignOut,
}: {
  setActive: (screen: Screen) => void;
  user: User | null;
  onSignOut: () => void;
}) {
  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 px-5"
      style={{ background: "rgba(11,11,11,0.75)", backdropFilter: "blur(24px)" }}
    >
      <button onClick={() => setActive("home")} className="flex items-center gap-2 text-left">
        <div className="grid grid-cols-2 gap-[3px]">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#FF9D2E]" />
          <div className="h-2.5 w-2.5 rounded-sm bg-white" />
          <div className="h-2.5 w-2.5 rounded-sm bg-white" />
          <div className="h-2.5 w-2.5 rounded-sm bg-white/30" />
        </div>
        <span
          className="ml-2 text-[18px] text-white"
          style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
        >
          Matisa
        </span>
      </button>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActive("messages")}
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/8"
          aria-label="Messages"
        >
          <MessageCircle size={19} className="text-white/70" />
        </button>
        <button
          onClick={() => setActive("activity")}
          className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/8"
          aria-label="Activity"
        >
          <Bell size={19} className="text-white/70" />
          <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF9D2E] text-[9px] font-bold text-black">
            3
          </span>
        </button>
        <button
          onClick={user ? onSignOut : () => setActive("profile")}
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition hover:bg-white/90"
          aria-label={user ? "Sign out" : "Profile"}
        >
          {user ? (
            <LogOut size={16} className="text-black" strokeWidth={2.5} />
          ) : (
            <UserRound size={16} className="text-black" strokeWidth={2.5} />
          )}
          {!user && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF9D2E] text-[9px] font-bold text-black">
              1
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

function BottomNav({
  active,
  setActive,
  onCreate,
}: {
  active: Screen;
  setActive: (screen: Screen) => void;
  onCreate: () => void;
}) {
  const items = [
    { id: "home" as const, icon: Home, label: "Home" },
    { id: "explore" as const, icon: Compass, label: "Explore" },
    { id: "__create__" as const, icon: Plus, label: "Create" },
    { id: "karaoke" as const, icon: Mic, label: "Karaoke" },
    { id: "profile" as const, icon: UserRound, label: "Profile" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-30 flex h-[72px] w-full max-w-[430px] -translate-x-1/2 items-center justify-between border-t border-white/5 px-8"
      style={{ background: "rgba(11,11,11,0.88)", backdropFilter: "blur(40px)" }}
    >
      <div className="flex w-full items-center justify-between">
        {items.map(({ id, icon: Icon, label }) => {
          if (id === "__create__") {
            return (
              <button
                key={id}
                onClick={onCreate}
                className="-mt-6 flex h-[50px] w-[50px] items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(135deg, #FF9D2E, #A855F7)",
                  boxShadow: "0 4px 24px rgba(255,157,46,0.4)",
                  border: "3px solid #0B0B0B",
                }}
                aria-label={label}
              >
                <Icon size={24} className="text-black" strokeWidth={2.5} />
              </button>
            );
          }
          const selected = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="rounded-full transition active:scale-90"
              aria-label={label}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: selected ? "rgba(255,157,46,0.1)" : "transparent" }}
              >
                <Icon
                  size={24}
                  style={{
                    color: selected ? "#FF9D2E" : "rgba(255,255,255,0.4)",
                    fill: selected && id !== "explore" ? "#FF9D2E" : "none",
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function FeedTabs({
  tab,
  onTab,
}: {
  tab: "foryou" | "following";
  onTab: (tab: "foryou" | "following") => void;
}) {
  return (
    <div
      className="sticky top-[61px] z-20 flex border-b border-[rgba(255,255,255,0.06)] backdrop-blur-lg"
      style={{ background: "rgba(15,13,11,0.92)" }}
    >
      {(["foryou", "following"] as const).map((item) => {
        const selected = tab === item;
        return (
          <button
            key={item}
            onClick={() => onTab(item)}
            className="relative flex-1 py-3 text-sm font-semibold transition"
            style={{ color: selected ? "#F5F0EA" : "rgba(255,255,255,0.42)" }}
          >
            {item === "foryou" ? "For You" : "Following"}
            {selected && (
              <span className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-10 rounded-full bg-[#FF9D2E]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function StoriesRow({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="border-b border-[rgba(255,255,255,0.06)] py-3">
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
        <button className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5">
          <div className="relative">
            <Avatar profile={profiles[0]} size={56} ring />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0B0B0B] bg-[#FF9D2E] text-white">
              <Plus size={12} strokeWidth={2.5} />
            </span>
          </div>
          <span className="max-w-full truncate text-[10px] text-[#F5F0EA]">Your story</span>
        </button>
        {profiles.slice(1, 8).map((profile, index) => (
          <button
            key={profile.id}
            className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5"
          >
            <Avatar profile={profile} size={56} ring index={index + 1} />
            <span className="max-w-full truncate text-[10px] text-[#F5F0EA]">
              {profileName(profile).split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PostCard({ note, index }: { note: Note; index: number }) {
  const author =
    normalizeProfile(note.profiles) || fallbackProfiles[index % fallbackProfiles.length];
  const [liked, setLiked] = useState(index % 2 === 0);
  const [saved, setSaved] = useState(false);
  const reactions = [
    {
      icon: Heart,
      label: fmt(128 + index * 41 + (liked ? 1 : 0)),
      active: liked,
      color: "#FF9D2E",
      onClick: () => setLiked((value) => !value),
    },
    { icon: Flame, label: `${24 + index * 7}`, active: index % 3 === 0, color: "#FF6B35" },
    { icon: Smile, label: `${18 + index * 5}`, active: false, color: "#A855F7" },
    { icon: MessageCircle, label: `${12 + index}`, active: false, color: "#2D7DD2" },
  ];

  return (
    <article className="px-4 py-3">
      <div className="overflow-hidden rounded-[22px] border border-white/5 bg-[#151515] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar profile={author} size={44} index={index} />
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-sm text-white">
                  <span className="truncate font-semibold">{profileName(author)}</span>
                  {author?.is_verified && <Verified />}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/40">
                  <span>@{author?.username || "matisa"}</span>
                  <span></span>
                  <span>{timeLabel(note.created_at)}</span>
                </div>
              </div>
            </div>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/35 hover:bg-white/5 hover:text-white/70"
              aria-label="More options"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-white">
            {note.content || note.text || "New note on Matisa."}
          </p>

          <div
            className="mt-4 overflow-hidden rounded-[20px] border border-white/5"
            style={{ background: gradients[index % gradients.length] }}
          >
            <div className="relative min-h-[126px] p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,157,46,0.28),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(168,85,247,0.24),transparent_30%)]" />
              <div className="relative flex h-full min-h-[94px] flex-col justify-between">
                <span className="w-fit rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  Nearby note
                </span>
                <div className="mt-7 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] text-white/50">
                      {author?.city || author?.location || "Windhoek"}
                    </div>
                    <div className="mt-1 text-lg font-bold leading-tight text-white">
                      Matisa pulse
                    </div>
                  </div>
                  <div className="flex items-center gap-[2px]">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-[3px] rounded-full bg-white"
                        style={{
                          height: 8 + Math.abs(Math.sin(i * 1.25 + index)) * 24,
                          opacity: 0.35 + (i % 4) * 0.12,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            {reactions.map(({ icon: Icon, label, active, color, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/45 transition hover:text-white"
                style={{ color: active ? color : undefined }}
              >
                <Icon size={16} fill={active ? color : "none"} />
                <span>{label}</span>
              </button>
            ))}
            <button
              onClick={() => setSaved((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-white/45 transition hover:text-white"
              aria-label="Save note"
            >
              <Bookmark
                size={16}
                fill={saved ? "#FF9D2E" : "none"}
                color={saved ? "#FF9D2E" : "currentColor"}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
function ComposeSheet({
  open,
  onClose,
  onSubmit,
  onKaraoke,
  user,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  onKaraoke: (title: string) => void;
  user: User | null;
}) {
  const [mode, setMode] = useState<"note" | "karaoke">("note");
  const [value, setValue] = useState("");
  const [roomTitle, setRoomTitle] = useState("Windhoek Open Mic");
  if (!open) return null;

  async function submit() {
    if (mode === "karaoke") {
      onKaraoke(roomTitle.trim() || "Matisa Karaoke Room");
      setRoomTitle("Windhoek Open Mic");
      onClose();
      return;
    }
    if (!value.trim()) return;
    await onSubmit(value.trim());
    setValue("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center animate-fade-in"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md animate-slide-up rounded-t-3xl border border-white/5 p-5 shadow-2xl"
        style={{ background: "#111111" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/10" />
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onClose} className="text-white/45">
            Cancel
          </button>
          <div className="font-display text-base font-bold text-white">Create</div>
          <button
            onClick={submit}
            className="rounded-full bg-[#FF9D2E] px-4 py-1.5 text-sm font-semibold text-black"
          >
            {mode === "note" ? "Send" : "Start"}
          </button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-black/30 p-1">
          <button
            onClick={() => setMode("note")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${mode === "note" ? "bg-[#FF9D2E] text-black" : "text-white/45"}`}
          >
            <Send size={14} />
            Send note
          </button>
          <button
            onClick={() => setMode("karaoke")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${mode === "karaoke" ? "bg-[#A855F7] text-white" : "text-white/45"}`}
          >
            <Mic size={14} />
            Karaoke
          </button>
        </div>
        {mode === "note" ? (
          <div className="flex gap-3">
            <Avatar profile={fallbackProfiles[0]} size={40} />
            <div className="min-w-0 flex-1">
              <textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={
                  user
                    ? "Send a note to people nearby..."
                    : "Sign in from Profile before sending notes."
                }
                rows={5}
                className="w-full resize-none bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/35">
                <span>Notes appear in the Matisa feed</span>
                <span>{value.length}/280</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="rounded-[22px] border border-white/5 p-4"
              style={{ background: "linear-gradient(135deg,#2d1b00,#1a001a)" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  Karaoke room
                </span>
                <Music2 size={18} className="text-[#FF9D2E]" />
              </div>
              <input
                value={roomTitle}
                onChange={(event) => setRoomTitle(event.target.value)}
                className="w-full bg-transparent text-xl font-bold text-white outline-none placeholder:text-white/35"
                placeholder="Room name"
              />
              <p className="mt-2 text-xs text-white/55">
                Open a live room, invite nearby voices, and build a queue.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-white/50">
              <div className="rounded-2xl bg-white/[0.04] p-3">
                <Mic className="mx-auto mb-1 text-[#A855F7]" size={16} />
                Host
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-3">
                <Users className="mx-auto mb-1 text-[#FF9D2E]" size={16} />
                Queue
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-3">
                <Flame className="mx-auto mb-1 text-[#FF6B35]" size={16} />
                Live
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HomeScreen({
  profiles,
  notes,
  tab,
  setTab,
  state,
  message,
  onCreateNote,
  onOpenKaraoke,
}: {
  profiles: Profile[];
  notes: Note[];
  tab: "foryou" | "following";
  setTab: (tab: "foryou" | "following") => void;
  state: AsyncState;
  message: string;
  onCreateNote: () => void;
  onOpenKaraoke: () => void;
}) {
  const feed =
    tab === "following" ? notes.slice(0, Math.max(1, Math.ceil(notes.length / 2))) : notes;
  return (
    <div className="pb-24">
      <StoriesRow profiles={profiles} />
      <div className="grid grid-cols-2 gap-3 px-4 py-3">
        <button
          onClick={onCreateNote}
          className="rounded-[22px] border border-[#FF9D2E]/20 bg-[#FF9D2E]/10 p-4 text-left"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FF9D2E] text-black">
            <Send size={18} />
          </div>
          <div className="text-sm font-bold text-white">Send note</div>
          <div className="mt-1 text-[11px] leading-snug text-white/45">
            Share what is happening nearby.
          </div>
        </button>
        <button
          onClick={onOpenKaraoke}
          className="rounded-[22px] border border-[#A855F7]/25 bg-[#A855F7]/10 p-4 text-left"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#A855F7] text-white">
            <Mic size={18} />
          </div>
          <div className="text-sm font-bold text-white">Karaoke</div>
          <div className="mt-1 text-[11px] leading-snug text-white/45">
            Join live rooms and build the queue.
          </div>
        </button>
      </div>
      <FeedTabs tab={tab} onTab={setTab} />
      <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-2 text-[11px] text-[rgba(255,255,255,0.42)]">
        <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#111111] px-3 py-1.5">
          {state === "loading" && <Loader2 size={12} className="animate-spin text-[#FF9D2E]" />}
          <span
            className={`h-1.5 w-1.5 rounded-full ${state === "ready" ? "bg-[#4CAF7D]" : "bg-[#FF9D2E]"}`}
          />
          {message}
        </span>
      </div>
      {feed.map((note, index) => (
        <PostCard key={note.id} note={note} index={index} />
      ))}
    </div>
  );
}

function ExploreScreen({
  profiles,
  notes,
  events,
  setActive,
}: {
  profiles: Profile[];
  notes: Note[];
  events: EventRow[];
  setActive: (screen: Screen) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const people = q
    ? profiles.filter(
        (p) => profileName(p).toLowerCase().includes(q) || p.username?.toLowerCase().includes(q),
      )
    : profiles;

  return (
    <div className="min-h-full pb-28">
      <div className="sticky top-[56px] z-20 bg-[#0B0B0B]/80 px-4 pb-3 pt-4 backdrop-blur-xl">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people, notes, events..."
            className="w-full rounded-2xl border border-white/5 bg-[#1A1A1A] py-3 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#FF9D2E]/30"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X size={14} className="text-white/40" />
            </button>
          )}
        </div>
      </div>

      {query ? (
        <section className="px-4 pt-2">
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/30">People</p>
          {people.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <Search size={32} className="mb-3 text-white/20" />
              <p className="text-sm text-white/40">No results for "{query}"</p>
            </div>
          ) : (
            people.map((profile, index) => (
              <div
                key={profile.id}
                className="flex items-center gap-3 border-b border-white/5 py-3"
              >
                <Avatar profile={profile} size={44} index={index} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-sm text-white">
                    {profileName(profile)}
                    {profile.is_verified && <Verified />}
                  </div>
                  <div className="text-xs text-white/40">
                    @{profile.username || "matisa"} {" "}
                    {profile.city || profile.location || "Windhoek"}
                  </div>
                </div>
                <button className="rounded-full bg-[#FF9D2E]/10 px-4 py-1.5 text-xs font-semibold text-[#FF9D2E]">
                  Follow
                </button>
              </div>
            ))
          )}
        </section>
      ) : (
        <>
          <section className="px-4 pt-2">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-[#FF9D2E]" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                Trending in Namibia
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {trendingTags.map(([tag, posts]) => (
                <button
                  key={tag}
                  className="rounded-2xl border border-white/5 bg-[#151515] p-3 text-left transition hover:border-[#FF9D2E]/20"
                >
                  <p className="mb-1 text-sm text-white">{tag}</p>
                  <p className="text-xs text-white/40">{posts} notes</p>
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#A855F7]" />
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                  Who to follow
                </span>
              </div>
              <button
                onClick={() => setActive("events")}
                className="text-[11px] font-semibold text-[#FF9D2E]"
              >
                Events
              </button>
            </div>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
              {profiles.slice(1).map((profile, index) => (
                <div
                  key={profile.id}
                  className="flex w-[140px] flex-shrink-0 flex-col items-center gap-2 rounded-2xl border border-white/5 bg-[#151515] p-4"
                >
                  <Avatar profile={profile} size={56} index={index + 1} />
                  <div className="min-w-0 text-center">
                    <p className="truncate text-xs leading-tight text-white">
                      {profileName(profile)}
                    </p>
                    <p className="truncate text-[10px] text-white/40">
                      @{profile.username || "matisa"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <MapPin size={10} />
                    {(profile.city || profile.location || "Windhoek").split(",")[0]}
                  </div>
                  <button className="w-full rounded-full bg-gradient-to-r from-[#FF9D2E] to-[#FF6B35] py-1.5 text-xs font-semibold text-black">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                Discover
              </span>
              <button
                onClick={() => setActive("karaoke")}
                className="text-[11px] font-semibold text-[#A855F7]"
              >
                Live rooms
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {discoveryImages.map((src, index) => (
                <div
                  key={src}
                  className={`overflow-hidden rounded-lg ${index === 0 ? "col-span-2 row-span-2" : ""}`}
                  style={{ aspectRatio: "1" }}
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 pt-6">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays size={14} className="text-[#FF9D2E]" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                Upcoming
              </span>
            </div>
            {events.slice(0, 3).map((event, index) => (
              <button
                key={event.id}
                onClick={() => setActive("events")}
                className="mb-2 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-[#151515] p-3 text-left"
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white"
                  style={{
                    background: event.image_url
                      ? `url(${event.image_url}) center/cover`
                      : gradients[index % gradients.length],
                  }}
                >
                  {!event.image_url && <Ticket size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{event.title}</div>
                  <div className="text-[11px] text-white/40">
                    {event.location || "Windhoek"}  {fmt(event.current_attendees || 0)} going
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/35" />
              </button>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
function ActivityScreen({ profiles, notes }: { profiles: Profile[]; notes: Note[] }) {
  const activity = [
    {
      actor: profiles[1] || fallbackProfiles[1],
      body: "liked your voice note",
      time: "4m",
      type: "like",
    },
    {
      actor: profiles[2] || fallbackProfiles[2],
      body: "joined your room",
      time: "18m",
      type: "room",
    },
    {
      actor: profiles[0] || fallbackProfiles[0],
      body: "replied to a nearby post",
      time: "1h",
      type: "reply",
    },
    {
      actor: profiles[1] || fallbackProfiles[1],
      body: `shared "${notes[0]?.content?.slice(0, 24) || "your post"}..."`,
      time: "2h",
      type: "share",
    },
  ];

  return (
    <div className="min-h-full pb-28">
      <div className="px-4 pb-2 pt-4">
        <h1
          className="mb-1 text-2xl text-white"
          style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
        >
          Activity
        </h1>
        <p className="text-sm text-white/40">Signals from your Matisa circle</p>
      </div>
      <div className="mt-2">
        {activity.map((item, index) => (
          <div
            key={`${item.time}-${index}`}
            className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5"
          >
            <Avatar profile={item.actor} size={44} index={index} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white">
                <span className="font-semibold">{profileName(item.actor)}</span>{" "}
                <span className="text-white/45">{item.body}</span>
              </p>
              <p className="text-xs text-white/30">{item.time} ago</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
              {item.type === "like" ? (
                <Heart size={15} className="text-[#FF9D2E]" fill="#FF9D2E" />
              ) : (
                <Bell size={15} className="text-white/45" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadarScreen({ profiles }: { profiles: Profile[] }) {
  const [radius, setRadius] = useState(5);
  const [selected, setSelected] = useState<Profile | null>(null);
  const nearby = profiles.slice(0, 7);
  return (
    <div className="relative overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 44%, #111111 0%, #0B0B0B 70%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,160,85,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(232,160,85,0.4) 1px,transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
          {[100, 170, 250, 350].map((r) => (
            <div
              key={r}
              className="absolute rounded-full border border-[#FF9D2E]/15"
              style={{ width: r * 2, height: r * 2, left: -r, top: -r }}
            />
          ))}
          <div className="radar-ring absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF9D2E]" />
          <div className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF9D2E] ring-4 ring-[#0B0B0B] shadow-lg shadow-[#FF9D2E]/50" />
          {nearby.map((profile, index) => {
            const angle = ((index * 52 + 30) * Math.PI) / 180;
            const distance = Math.min(120 + index * 34, 330);
            return (
              <button
                key={profile.id}
                onClick={() => setSelected(profile)}
                className="absolute transition hover:scale-110"
                style={{
                  transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px))`,
                }}
              >
                <Avatar profile={profile} size={32} index={index} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="absolute left-0 right-0 top-0 z-10 space-y-2 px-4 pt-3">
        <div className="flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111111]/95 px-3 py-2.5 backdrop-blur">
          <Radar size={16} color="#FF9D2E" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#F5F0EA]">
              {nearby.length} people within {radius}km
            </div>
            <div className="text-[10px] text-[rgba(255,255,255,0.42)]">
              Windhoek Â· Radar active
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1, 5, 20].map((item) => (
              <button
                key={item}
                onClick={() => setRadius(item)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${radius === item ? "bg-[#FF9D2E] text-white" : "text-[rgba(255,255,255,0.42)]"}`}
              >
                {item}km
              </button>
            ))}
          </div>
        </div>
      </div>
      {selected && (
        <div className="absolute inset-x-4 top-28 z-20 animate-slide-up rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111111]/98 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3">
            <Avatar profile={selected} size={48} />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[#F5F0EA]">{profileName(selected)}</div>
              <div className="text-xs text-[rgba(255,255,255,0.42)]">
                @{selected.username || "matisa"} Â· {selected.city || "Windhoek"}
              </div>
              <div className="mt-1 text-[11px] text-[#FF9D2E]">
                {selected.bio || "Open to nearby conversations"}
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-[rgba(255,255,255,0.42)]">
              <X size={18} />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-full border border-[rgba(255,255,255,0.06)] py-2 text-xs font-semibold text-[#F5F0EA]">
              View Profile
            </button>
            <button className="flex-1 rounded-full bg-[#FF9D2E] py-2 text-xs font-semibold text-white">
              Follow
            </button>
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 z-10 rounded-t-3xl border-t border-[rgba(255,255,255,0.06)] bg-[#111111]/98 px-4 pb-4 pt-3 backdrop-blur">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[rgba(255,255,255,0.06)]" />
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.42)]">
          Nearby now
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {nearby.map((profile, index) => (
            <button
              key={profile.id}
              onClick={() => setSelected(profile)}
              className="flex w-14 flex-shrink-0 flex-col items-center gap-1"
            >
              <Avatar profile={profile} size={40} index={index} />
              <span className="line-clamp-1 w-full text-center text-[9px] text-[rgba(255,255,255,0.42)]">
                {profileName(profile).split(" ")[0]}
              </span>
              <span className="text-[8px] text-[#FF9D2E]">{(0.7 + index * 0.8).toFixed(1)}km</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventsScreen({ events, profiles }: { events: EventRow[]; profiles: Profile[] }) {
  const [mine, setMine] = useState(false);
  const [rsvpd, setRsvpd] = useState<Set<string>>(
    new Set([events[0]?.id].filter(Boolean) as string[]),
  );
  const list = mine ? events.filter((event) => rsvpd.has(event.id)) : events;

  return (
    <div className="pb-24">
      <div
        className="sticky top-[61px] z-20 border-b border-[rgba(255,255,255,0.06)] backdrop-blur-lg"
        style={{ background: "rgba(15,13,11,0.90)" }}
      >
        <div className="flex">
          <button
            onClick={() => setMine(false)}
            className={`flex-1 py-3 text-sm font-semibold transition ${!mine ? "text-[#F5F0EA]" : "text-[rgba(255,255,255,0.42)]"}`}
          >
            Discover{!mine && <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-[#FF9D2E]" />}
          </button>
          <button
            onClick={() => setMine(true)}
            className={`flex-1 py-3 text-sm font-semibold transition ${mine ? "text-[#F5F0EA]" : "text-[rgba(255,255,255,0.42)]"}`}
          >
            My Events ({rsvpd.size})
            {mine && <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-[#FF9D2E]" />}
          </button>
        </div>
      </div>
      <div className="space-y-3 p-4">
        {list.map((event, index) => {
          const going = rsvpd.has(event.id);
          return (
            <div
              key={event.id}
              className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111111]"
            >
              <div
                className="relative h-32"
                style={{
                  background: event.image_url
                    ? `url(${event.image_url}) center/cover`
                    : gradients[index % gradients.length],
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#4CAF7D]/25 bg-[#4CAF7D]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#4CAF7D]">
                    Free
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.06)] px-2.5 py-0.5 text-[10px] font-semibold text-[rgba(255,255,255,0.42)]">
                    social
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="font-display text-lg font-bold leading-tight text-white">
                    {event.title}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 text-xs text-[rgba(255,255,255,0.42)]">
                  <MapPin size={11} />
                  <span>{event.location || "Windhoek"}</span>
                  <Clock size={11} />
                  <span>
                    {event.start_at ? new Date(event.start_at).toLocaleDateString() : "Soon"}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[rgba(255,255,255,0.42)]">
                  {event.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {profiles.slice(0, 4).map((profile, avatarIndex) => (
                      <Avatar key={profile.id} profile={profile} size={28} index={avatarIndex} />
                    ))}
                  </div>
                  <span className="text-xs text-[rgba(255,255,255,0.42)]">
                    {fmt(event.current_attendees || 0)} going Â· {fmt(event.capacity || 0)} capacity
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar profile={profiles[index % profiles.length]} size={24} index={index} />
                    <span className="text-xs text-[rgba(255,255,255,0.42)]">
                      by {profileName(profiles[index % profiles.length])}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setRsvpd((previous) => {
                        const next = new Set(previous);
                        if (going) {
                          next.delete(event.id);
                        } else {
                          next.add(event.id);
                        }
                        return next;
                      })
                    }
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${going ? "border border-[#4CAF7D] text-[#4CAF7D]" : "bg-[#FF9D2E] text-white"}`}
                  >
                    {going ? (
                      <span className="flex items-center gap-1">
                        <Check size={12} /> Going
                      </span>
                    ) : (
                      "RSVP"
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KaraokeScreen({ profiles }: { profiles: Profile[] }) {
  const rooms = [
    {
      title: "Windhoek Warmup",
      host: profiles[0] || fallbackProfiles[0],
      listeners: 248,
      mood: "Afrobeats",
      live: true,
    },
    {
      title: "Katutura Chorus",
      host: profiles[1] || fallbackProfiles[1],
      listeners: 96,
      mood: "Karaoke",
      live: true,
    },
    {
      title: "Late Night Stories",
      host: profiles[2] || fallbackProfiles[2],
      listeners: 54,
      mood: "Open mic",
      live: false,
    },
  ];
  return (
    <div className="min-h-full pb-28">
      <div className="px-4 pb-2 pt-4">
        <h1 className="text-2xl font-bold text-white">Karaoke</h1>
        <p className="mt-1 text-sm text-white/40">
          Live rooms and creator stages from the zip flow.
        </p>
      </div>
      <div className="space-y-3 px-4 pt-3">
        {rooms.map((room, index) => (
          <article
            key={room.title}
            className="overflow-hidden rounded-[24px] border border-white/5 bg-[#151515]"
          >
            <div
              className="relative min-h-[150px] p-4"
              style={{ background: gradients[index % gradients.length] }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,157,46,0.25),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.22),transparent_30%)]" />
              <div className="relative flex h-full flex-col justify-between gap-8">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                    {room.live ? "Live now" : "Starting soon"}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white">
                    <Users size={11} />
                    {fmt(room.listeners)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{room.title}</h2>
                  <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
                    <Avatar profile={room.host} size={24} index={index} />
                    Hosted by {profileName(room.host)}  {room.mood}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3">
              <button className="flex-1 rounded-full bg-[#FF9D2E] py-2.5 text-sm font-semibold text-black">
                Join room
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60">
                <Mic size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MessagesScreen({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="min-h-full pb-28">
      <div className="px-4 pb-2 pt-4">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="mt-1 text-sm text-white/40">
          Fast creator conversations with the same Matisa shell.
        </p>
      </div>
      <div className="px-4 pt-2">
        {profiles.slice(0, 6).map((profile, index) => (
          <button
            key={profile.id}
            className="flex w-full items-center gap-3 border-b border-white/5 py-3 text-left"
          >
            <Avatar profile={profile} size={48} index={index} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-white">
                  {profileName(profile)}
                </span>
                <span className="text-[10px] text-white/30">{index + 2}m</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-white/40">
                Lets connect around the next Matisa room.
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
function AuthPanel({
  user,
  status,
  onSubmit,
}: {
  user: User | null;
  status: string;
  onSubmit: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(email);
  }
  if (user) {
    return (
      <div className="mx-4 mt-4 rounded-2xl border border-[#4CAF7D]/25 bg-[#4CAF7D]/10 p-3 text-sm text-[#F5F0EA]">
        Signed in as <span className="text-[#FF9D2E]">{user.email}</span>
      </div>
    );
  }
  return (
    <form
      onSubmit={submit}
      className="mx-4 mt-4 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111111] p-3"
    >
      <div className="text-sm font-semibold text-[#F5F0EA]">Sign in with magic link</div>
      <div className="mt-3 flex gap-2">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="email@matisa.app"
          className="min-w-0 flex-1 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#0B0B0B] px-4 text-sm text-[#F5F0EA] outline-none placeholder:text-[rgba(255,255,255,0.42)]"
        />
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF9D2E] text-white">
          <Send size={16} />
        </button>
      </div>
      {status && <p className="mt-2 text-xs text-[rgba(255,255,255,0.42)]">{status}</p>}
    </form>
  );
}

function ProfileScreen({
  profile,
  user,
  authStatus,
  onAuth,
}: {
  profile: Profile;
  user: User | null;
  authStatus: string;
  onAuth: (email: string) => Promise<void>;
}) {
  const [tab, setTab] = useState("posts");
  const tabs = ["posts", "voice", "music", "events", "saved"];
  return (
    <div className="pb-24">
      <div className="relative h-40" style={{ background: gradients[0] }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] to-transparent" />
      </div>
      <div className="-mt-14 px-4">
        <div className="flex items-end justify-between">
          <div className="rounded-full border-4 border-[#0B0B0B]">
            <Avatar profile={profile} size={80} />
          </div>
          <button className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[#111111] px-4 py-2 text-sm font-semibold text-[#F5F0EA]">
            {user ? "Edit Profile" : "View Mode"}
          </button>
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-[#F5F0EA]">
              {profileName(profile)}
            </h1>
            {profile.is_verified && <Verified />}
          </div>
          <div className="text-sm text-[rgba(255,255,255,0.42)]">
            @{profile.username || "matisa"}
          </div>
          <p className="mt-2 text-sm text-[#F5F0EA]">
            {profile.bio || "Voice-first creator on Matisa."}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[rgba(255,255,255,0.42)]">
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {profile.city || profile.location || "Windhoek"}
            </span>
            <span className="rounded-full border border-[#FF9D2E]/25 bg-[#FF9D2E]/10 px-2 py-0.5 text-[#FF9D2E]">
              Open to collabs
            </span>
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <span className="font-bold text-[#F5F0EA]">{fmt(profile.posts_count || 24)}</span>{" "}
            <span className="text-[rgba(255,255,255,0.42)]">posts</span>
          </div>
          <div>
            <span className="font-bold text-[#F5F0EA]">{fmt(profile.followers_count || 0)}</span>{" "}
            <span className="text-[rgba(255,255,255,0.42)]">followers</span>
          </div>
          <div>
            <span className="font-bold text-[#F5F0EA]">{fmt(profile.following_count || 0)}</span>{" "}
            <span className="text-[rgba(255,255,255,0.42)]">following</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#1A1A1A] p-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF9D2E] text-white">
            <Play size={14} fill="white" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-[#F5F0EA]">Voicemail</div>
            <div className="text-[11px] text-[rgba(255,255,255,0.42)]">
              {user ? "Record a 30-second hello" : "Sign in to record your hello"}
            </div>
          </div>
          <Mic size={16} color="rgba(255,255,255,0.42)" />
        </div>
      </div>
      <AuthPanel user={user} status={authStatus} onSubmit={onAuth} />
      <div className="mt-4 border-y border-[rgba(255,255,255,0.06)]">
        <div className="no-scrollbar flex overflow-x-auto px-2">
          {tabs.map((item) => {
            const selected = tab === item;
            return (
              <button
                key={item}
                onClick={() => setTab(item)}
                className="relative flex-shrink-0 px-4 py-3 text-[11px] font-semibold capitalize transition"
                style={{ color: selected ? "#F5F0EA" : "rgba(255,255,255,0.42)" }}
              >
                {item}
                {selected && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#FF9D2E]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square"
            style={{ background: gradients[index % gradients.length] }}
          >
            {index % 3 === 0 && (
              <div className="flex h-full items-center justify-center">
                <Mic size={20} color="white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [active, setActive] = useState<Screen>("home");
  const [feedTab, setFeedTab] = useState<"foryou" | "following">("foryou");
  const [composeOpen, setComposeOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>(fallbackProfiles);
  const [notes, setNotes] = useState<Note[]>(fallbackNotes);
  const [events, setEvents] = useState<EventRow[]>(fallbackEvents);
  const [state, setState] = useState<AsyncState>("loading");
  const [message, setMessage] = useState("Connecting to Supabase...");
  const [authStatus, setAuthStatus] = useState("");

  async function refreshData() {
    setState("loading");
    const [profilesResult, notesResult, eventsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id,username,display_name,full_name,avatar_url,bio,city,location,is_verified,followers_count,following_count,posts_count",
        )
        .limit(10),
      supabase
        .from("notes")
        .select(
          "id,content,text,created_at,user_id,profiles(id,username,display_name,full_name,avatar_url,bio,city,is_verified)",
        )
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("events")
        .select("id,title,description,location,image_url,start_at,current_attendees,capacity")
        .order("start_at", { ascending: true })
        .limit(10),
    ]);
    const errors = [profilesResult.error, notesResult.error, eventsResult.error].filter(Boolean);
    if (profilesResult.data?.length) setProfiles(profilesResult.data as Profile[]);
    if (notesResult.data?.length) setNotes(notesResult.data as Note[]);
    if (eventsResult.data?.length) setEvents(eventsResult.data as EventRow[]);
    if (errors.length) {
      setState("error");
      setMessage(`Demo data active: ${errors[0]?.message}`);
    } else {
      setState("ready");
      setMessage("Live Supabase data connected");
    }
  }

  async function createNote(content: string) {
    if (!user) {
      setAuthStatus("Sign in before posting.");
      setActive("profile");
      return;
    }
    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: user.id, content })
      .select("id,content,created_at,user_id")
      .single();
    if (error) {
      setMessage(`Post not saved: ${error.message}`);
      return;
    }
    if (data) {
      setNotes((current) => [data as Note, ...current]);
      setMessage("Post published");
      setState("ready");
    }
  }

  async function sendMagicLink(email: string) {
    if (!email.trim()) {
      setAuthStatus("Enter an email first.");
      return;
    }
    setAuthStatus("Sending magic link...");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setAuthStatus(error ? error.message : "Magic link sent. Check your email.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    refreshData();
    return () => subscription.unsubscribe();
  }, []);

  const profile = useMemo(
    () => profiles.find((item) => item.id === user?.id) || profiles[0] || fallbackProfiles[0],
    [profiles, user],
  );
  const screens: Record<Screen, ReactNode> = {
    home: (
      <HomeScreen
        profiles={profiles}
        notes={notes}
        tab={feedTab}
        setTab={setFeedTab}
        state={state}
        message={message}
        onCreateNote={() => setComposeOpen(true)}
        onOpenKaraoke={() => setActive("karaoke")}
      />
    ),
    explore: (
      <ExploreScreen profiles={profiles} notes={notes} events={events} setActive={setActive} />
    ),
    events: <EventsScreen events={events} profiles={profiles} />,
    karaoke: <KaraokeScreen profiles={profiles} />,
    messages: <MessagesScreen profiles={profiles} />,
    activity: <ActivityScreen profiles={profiles} notes={notes} />,
    profile: (
      <ProfileScreen profile={profile} user={user} authStatus={authStatus} onAuth={sendMagicLink} />
    ),
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F0EA]">
      <div
        className="relative mx-auto flex min-h-[100dvh] max-w-[430px] flex-col overflow-hidden shadow-2xl shadow-black"
        style={{ background: "#0B0B0B", fontFamily: "'DM Sans', sans-serif" }}
      >
        <TopBar setActive={setActive} user={user} onSignOut={signOut} />
        <main className="no-scrollbar flex-1 overflow-y-auto" style={{ paddingBottom: "72px" }}>
          {screens[active]}
        </main>
        <BottomNav active={active} setActive={setActive} onCreate={() => setComposeOpen(true)} />
        <ComposeSheet
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          onSubmit={createNote}
          onKaraoke={(title) => {
            setMessage(`${title} room ready`);
            setActive("karaoke");
          }}
          user={user}
        />
      </div>
    </div>
  );
}

export default App;
