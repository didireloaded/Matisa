import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Heart,
  Share2,
  MessageSquare,
  Mic,
  Video,
  Shield,
  DollarSign,
  Radio,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/common/Avatar";

export interface VirtualShow {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  category: string;
  isPaid: boolean;
  ticketPrice?: string;
  viewerCount: number;
  videoUrl?: string;
  scheduleTime: string;
}

interface VirtualShowViewerProps {
  show: VirtualShow;
  isHost?: boolean;
  onClose: () => void;
}

export function VirtualShowViewer({ show, isHost = false, onClose }: VirtualShowViewerProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "guests" | "host-controls">("chat");
  const [comments, setComments] = useState([
    { id: "c1", user: "Michelle V.", text: "This live acoustic show sounds incredible! 🎸" },
    { id: "c2", user: "Lukas S.", text: "Greetings from Swakopmund! 🔥" },
  ]);
  const [inputText, setInputText] = useState("");
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const [viewerCount, setViewerCount] = useState(show.viewerCount || 142);
  const [isLive, setIsLive] = useState(true);

  const handleSendComment = () => {
    if (!inputText.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: Math.random().toString(), user: "You", text: inputText.trim() },
    ]);
    setInputText("");
  };

  const triggerHeart = () => {
    const id = Date.now();
    const x = Math.random() * 60 + 20;
    setFloatingHearts((prev) => [...prev, { id, x }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="fixed inset-0 z-50 bg-[#06101D] text-white flex flex-col overflow-hidden"
      >
        {/* Main Stage Video Container */}
        <div className="relative w-full h-[55%] bg-black flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop"
            alt={show.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06101D] via-transparent to-black/60" />

          {/* Top Stage Overlay Header */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/15">
              <Avatar
                size={34}
                profile={{ id: "host", display_name: show.hostName, avatar_url: show.hostAvatar }}
              />
              <div>
                <h3 className="text-xs font-bold text-white leading-tight">{show.title}</h3>
                <span className="text-[10px] text-white/60">Hosted by {show.hostName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                VIRTUAL SHOW
              </span>

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Floating Hearts Stage Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {floatingHearts.map((h) => (
              <motion.span
                key={h.id}
                initial={{ opacity: 1, y: "100%", scale: 1 }}
                animate={{ opacity: 0, y: "20%", scale: 1.8 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ left: `${h.x}%` }}
                className="absolute text-3xl"
              >
                ❤️
              </motion.span>
            ))}
          </div>

          {/* Bottom Stage Stats Banner */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/80 z-20">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              <Users size={13} className="text-[#24A3C7]" />
              <span>{viewerCount} watching</span>
            </div>

            {show.isPaid && (
              <span className="px-3 py-1 rounded-full bg-[#FF9D2E]/20 text-[#FF9D2E] border border-[#FF9D2E]/30 font-bold text-[11px]">
                Paid Ticket: {show.ticketPrice || "N$ 50"}
              </span>
            )}
          </div>
        </div>

        {/* Lower Interactive Drawer */}
        <div className="flex-1 flex flex-col bg-[#06101D] px-5 pt-3 pb-safe border-t border-white/10">
          {/* Segmented Controls */}
          <div className="flex rounded-full glass-panel p-1 border border-white/10 mb-3">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === "chat" ? "bg-[#24A3C7] text-white" : "text-white/50"
              }`}
            >
              Live Chat
            </button>
            <button
              onClick={() => setActiveTab("guests")}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === "guests" ? "bg-[#24A3C7] text-white" : "text-white/50"
              }`}
            >
              Guests & Performers
            </button>
            {isHost && (
              <button
                onClick={() => setActiveTab("host-controls")}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold transition ${
                  activeTab === "host-controls" ? "bg-[#FF9D2E] text-black" : "text-white/50"
                }`}
              >
                Host Tools
              </button>
            )}
          </div>

          {/* Tab 1: Live Chat */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col justify-between min-h-0 space-y-3">
              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="glass-panel p-2.5 rounded-2xl text-xs space-y-0.5">
                    <span className="font-bold text-[#39B7F2]">{c.user}</span>
                    <p className="text-white/90">{c.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input & Floating Heart Reactions */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                  placeholder="Say something to the show..."
                  className="flex-1 bg-white/10 text-xs text-white placeholder:text-white/40 rounded-full px-4 py-2.5 outline-none border border-white/15"
                />
                <button
                  onClick={triggerHeart}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400 border border-red-500/30 active:scale-125 transition"
                >
                  <Heart size={18} className="fill-red-400" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Guests & Performers */}
          {activeTab === "guests" && (
            <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar py-2">
              <div className="glass-panel p-3 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    size={36}
                    profile={{
                      id: "host",
                      display_name: show.hostName,
                      avatar_url: show.hostAvatar,
                    }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{show.hostName}</h4>
                    <span className="text-[10px] text-[#FF9D2E] font-bold">Main Host</span>
                  </div>
                </div>
                <span className="text-[10px] bg-[#35C67A]/20 text-[#35C67A] px-2.5 py-1 rounded-full font-bold">
                  On Stage
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Host Controls */}
          {activeTab === "host-controls" && (
            <div className="flex-1 space-y-2.5 overflow-y-auto no-scrollbar py-2 text-xs">
              <button
                onClick={() => {
                  setIsLive(!isLive);
                  toast.success(isLive ? "Show paused" : "Show live!");
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#FF9D2E] to-[#24A3C7] text-black font-bold text-center"
              >
                {isLive ? "Pause Broadcast" : "Resume Broadcast"}
              </button>
              <button
                onClick={() => toast.info("Poll created for audience")}
                className="w-full p-3 rounded-2xl glass-panel text-white font-semibold text-center border border-white/10"
              >
                Create Audience Poll
              </button>
              <button
                onClick={() => {
                  toast.success("Virtual Show ended and saved to profile replays");
                  onClose();
                }}
                className="w-full p-3 rounded-2xl bg-red-500/20 text-red-400 font-bold text-center border border-red-500/30"
              >
                End Show for Everyone
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default VirtualShowViewer;
