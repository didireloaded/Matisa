import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Search,
  Plus,
  Heart,
  User,
  Bell,
  MessageSquare,
  X,
  FileText,
  Mic,
  CalendarDays,
  Camera,
  Radio,
} from "lucide-react";
import { HomePage } from "./components/HomePage";
import { ExplorePage } from "./components/ExplorePage";
import { EventsPage } from "./components/EventsPage";
import { KaraokePage } from "./components/KaraokePage";
import { ProfilePage } from "./components/ProfilePage";
import { ActivityPage } from "./components/ActivityPage";
import { MessagesPage } from "./components/MessagesPage";
import { ImageWithFallback } from "./components/ImageWithFallback";
import { ME } from "./components/data";

type Page = "home" | "explore" | "events" | "karaoke" | "activity" | "profile" | "messages";

// ─── Story Viewer ────────────────────────────────────────────────────────────

function StoryViewer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const storyData = [
    {
      url: "https://images.unsplash.com/photo-1606416132922-22ab37c1231e?w=600&h=900&fit=crop",
      user: "Hanna D.",
      time: "2h ago",
      caption: "Windhoek vibes today 🌿",
    },
    {
      url: "https://images.unsplash.com/photo-1488197047962-b48492212cda?w=600&h=900&fit=crop",
      user: "Hanna D.",
      time: "5h ago",
      caption: "Desert sunsets never get old ✨",
    },
  ];
  const [idx, setIdx] = useState(0);
  const story = storyData[idx] || storyData[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={() => setIdx((i) => (i < storyData.length - 1 ? i + 1 : 0))}
    >
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-3 z-10">
        {storyData.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
            {i < idx && <div className="h-full bg-white w-full" />}
            {i === idx && (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5 }}
                className="h-full bg-white"
              />
            )}
          </div>
        ))}
      </div>

      <ImageWithFallback
        src={story.url}
        alt={story.user}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      <div className="relative z-10 flex items-center gap-3 px-4 pt-12">
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#FF9D2E]">
          <ImageWithFallback
            src={ME.avatar}
            alt={story.user}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{story.user}</p>
          <p className="text-white/60 text-xs">{story.time}</p>
        </div>
        <div className="flex-1" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"
        >
          <X size={14} className="text-white" />
        </button>
      </div>

      <div className="absolute bottom-16 left-0 right-0 px-5 z-10">
        <p className="text-white text-base font-medium">{story.caption}</p>
      </div>
    </motion.div>
  );
}

// ─── Radial Create Menu ────────────────────────────────────────────────────

const CREATE_ITEMS = [
  { id: "note", label: "Note", icon: FileText, color: "#FF9D2E", angle: -120 },
  { id: "story", label: "Story", icon: Camera, color: "#A855F7", angle: -60 },
  { id: "room", label: "Room", icon: Mic, color: "#FF6B6B", angle: 0 },
  { id: "event", label: "Event", icon: CalendarDays, color: "#2D7DD2", angle: 60 },
  { id: "live", label: "Live", icon: Radio, color: "#22c55e", angle: 120 },
];

function CreateMenu({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2">
        {CREATE_ITEMS.map((item, i) => {
          const rad = (item.angle - 90) * (Math.PI / 180);
          const r = 88;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, x, y, scale: 1 }}
              exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 22 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
              style={{ left: 0, top: 0 }}
              onClick={() => {
                onClose();
                onSelect(item.id);
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: item.color + "22", border: `1.5px solid ${item.color}55` }}
              >
                <Icon size={20} style={{ color: item.color }} />
              </div>
              <span className="text-white/80 text-[10px] font-semibold">{item.label}</span>
            </motion.button>
          );
        })}

        <motion.button
          initial={{ rotate: 0 }}
          animate={{ rotate: 45 }}
          exit={{ rotate: 0 }}
          onClick={onClose}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full flex items-center justify-center"
          style={{
            left: 0,
            top: 0,
            background: "linear-gradient(135deg, #FF9D2E, #A855F7)",
            boxShadow: "0 4px 20px rgba(255,157,46,0.5)",
          }}
        >
          <Plus size={26} className="text-black" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Create Note Modal ─────────────────────────────────────────────────────

function CreateNoteModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const GRADIENTS = [
    ["#1a1a2e", "#16213e"],
    ["#2d1b00", "#1a0f00"],
    ["#1a0a00", "#2d1500"],
    ["#1a001a", "#0d000d"],
    ["#001a0d", "#000d07"],
  ];
  const [gradIdx, setGradIdx] = useState(0);
  const [from, to] = GRADIENTS[gradIdx];

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <div className="text-center">
          <div className="text-5xl mb-4">🔥</div>
          <p className="text-white text-xl font-bold">Note dropped!</p>
          <p className="text-white/50 text-sm mt-1 mb-6">Live for 24 hours</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#FF9D2E] text-black text-sm font-bold"
          >
            Done
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] border-t border-white/10"
      style={{ background: "#111111" }}
    >
      <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4" />
      <div className="px-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
            New Note
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-white/50" />
          </button>
        </div>

        <div
          className="rounded-2xl p-4 mb-4 min-h-[120px]"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={280}
            className="w-full bg-transparent text-white placeholder:text-white/30 text-base resize-none outline-none leading-relaxed"
            rows={4}
            autoFocus
          />
          <p className="text-white/20 text-xs text-right mt-1">{text.length}/280</p>
        </div>

        <div className="flex gap-2 mb-4">
          {GRADIENTS.map(([f], i) => (
            <button
              key={i}
              onClick={() => setGradIdx(i)}
              className="w-7 h-7 rounded-full transition"
              style={{
                background: `linear-gradient(135deg, ${GRADIENTS[i][0]}, ${GRADIENTS[i][1]})`,
                border: `2px solid ${i === gradIdx ? "#FF9D2E" : "transparent"}`,
              }}
            />
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!text.trim()}
          onClick={() => setSent(true)}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition"
          style={{
            background: text.trim() ? "linear-gradient(135deg, #FF9D2E, #FF6B35)" : "#1a1a1a",
            color: text.trim() ? "#0B0B0B" : "rgba(255,255,255,0.2)",
          }}
        >
          Drop Note
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Top Bar ───────────────────────────────────────────────────────────────

function TopBar({ onMessages, onActivity }: { onMessages: () => void; onActivity: () => void }) {
  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between px-5 border-b border-white/5"
      style={{ background: "rgba(11,11,11,0.75)", backdropFilter: "blur(24px)" }}
    >
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-2 gap-[3px]">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#FF9D2E]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          <div className="w-2.5 h-2.5 rounded-sm bg-white/30" />
        </div>
        <span
          className="text-white text-[18px] ml-2"
          style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
        >
          Matisa
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onActivity}
          className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/8 transition"
        >
          <Bell size={19} className="text-white/70" />
          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#FF9D2E] flex items-center justify-center text-[9px] text-black font-bold">
            3
          </span>
        </button>
        <button
          onClick={onMessages}
          className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center shadow transition hover:bg-white/90"
        >
          <MessageSquare size={16} className="text-black" strokeWidth={2.5} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF9D2E] flex items-center justify-center text-[9px] text-black font-bold">
            1
          </span>
        </button>
      </div>
    </header>
  );
}

// ─── Bottom Nav ────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home", icon: Home },
  { id: "explore", icon: Search },
  { id: "__create__", icon: Plus },
  { id: "activity", icon: Heart },
  { id: "profile", icon: User },
] as const;

function BottomNav({
  page,
  onNav,
  onCreate,
}: {
  page: Page;
  onNav: (p: Page) => void;
  onCreate: () => void;
}) {
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[72px] flex items-center justify-between px-8 z-30 border-t border-white/5"
      style={{ background: "rgba(11,11,11,0.88)", backdropFilter: "blur(40px)" }}
    >
      {NAV_ITEMS.map((item) => {
        if (item.id === "__create__") {
          return (
            <motion.button
              key="create"
              whileTap={{ scale: 0.88 }}
              onClick={onCreate}
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center -mt-6"
              style={{
                background: "linear-gradient(135deg, #FF9D2E, #A855F7)",
                boxShadow: "0 4px 24px rgba(255,157,46,0.4)",
                border: "3px solid #0B0B0B",
              }}
            >
              <Plus size={24} className="text-black" strokeWidth={2.5} />
            </motion.button>
          );
        }
        const isActive = page === item.id;
        const Icon = item.icon;
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.88 }}
            onClick={() => onNav(item.id as Page)}
          >
            <div
              className="w-11 h-11 flex items-center justify-center rounded-full transition"
              style={{ background: isActive ? "rgba(255,157,46,0.1)" : "transparent" }}
            >
              <Icon
                size={24}
                style={{
                  color: isActive ? "#FF9D2E" : "rgba(255,255,255,0.4)",
                  fill: isActive && item.id !== "explore" ? "#FF9D2E" : "none",
                }}
              />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [showCreate, setShowCreate] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [storyUserId, setStoryUserId] = useState<string | null>(null);

  const hideTopbar = page === "messages";

  const handleCreateSelect = (id: string) => {
    if (id === "note") setShowNote(true);
    else if (id === "room" || id === "live") setPage("karaoke");
    else if (id === "event") setPage("events");
  };

  return (
    <div
      className="mx-auto flex min-h-[100dvh] max-w-[430px] flex-col overflow-hidden relative no-scrollbar"
      style={{ background: "#0B0B0B", color: "#F5F0EA", fontFamily: "'DM Sans', sans-serif" }}
    >
      {!hideTopbar && (
        <TopBar onMessages={() => setPage("messages")} onActivity={() => setPage("activity")} />
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: "72px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            {page === "home" && <HomePage onStoryView={(id) => setStoryUserId(id)} />}
            {page === "explore" && <ExplorePage />}
            {page === "events" && <EventsPage />}
            {page === "karaoke" && <KaraokePage />}
            {page === "activity" && <ActivityPage />}
            {page === "profile" && <ProfilePage />}
            {page === "messages" && <MessagesPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav page={page} onNav={setPage} onCreate={() => setShowCreate(true)} />

      <AnimatePresence>
        {showCreate && (
          <CreateMenu onClose={() => setShowCreate(false)} onSelect={handleCreateSelect} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNote && <CreateNoteModal onClose={() => setShowNote(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {storyUserId && <StoryViewer userId={storyUserId} onClose={() => setStoryUserId(null)} />}
      </AnimatePresence>
    </div>
  );
}
