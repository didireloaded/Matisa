import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Users,
  Share2,
  ArrowLeft,
  Heart,
  LogOut,
  Radio,
  Music2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/common/Avatar";
import { useVoice } from "@/contexts/VoiceContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { USERS } from "@/data/dummy";

export function KaraokeRoom() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { joinRoom, leaveRoom, isMuted: isContextMuted, toggleMute } = useVoice();
  const [roomData, setRoomData] = useState<any>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: string }[]>([]);

  useEffect(() => {
    if (!roomId) return;
    async function loadRoom() {
      const { data } = await supabase
        .from("voice_rooms")
        .select("*, profiles(*)")
        .eq("id", roomId)
        .single();

      if (data) {
        setRoomData(data);
        joinRoom(roomId as string, data.title);
      }
    }
    loadRoom();
  }, [roomId]);

  const handleLeave = () => {
    leaveRoom();
    navigate(-1);
  };

  const handleSendReaction = () => {
    const id = Math.random().toString(36).substring(2, 9);
    setFloatingHearts((prev) => [...prev, { id }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 2000);
  };

  const host = roomData?.profiles || USERS[0];

  return (
    <div className="flex flex-col h-[100dvh] bg-[#030712] text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[350px] ambient-glow-cyan opacity-80" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] ambient-glow-purple opacity-60" />
      </div>

      {/* Top Bar Navigation */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-12 pb-4 glass-header">
        <div className="flex items-center gap-3.5">
          <button
            onClick={handleLeave}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              {roomData?.title || "Windhoek Karaoke & Audio Lounge"}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                LIVE STAGE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel text-xs text-white/80 font-semibold">
            <Users size={14} className="text-[#39B7F2]" />
            <span>142</span>
          </div>
        </div>
      </div>

      {/* Main Performer Stage */}
      <div className="relative z-10 flex-1 px-5 flex flex-col justify-center items-center">
        {/* Floating Heart Reactions */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
          <AnimatePresence>
            {floatingHearts.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 100, scale: 0.5 }}
                animate={{ opacity: 1, y: -200, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="absolute bottom-20 right-12 text-[#FF9D2E]"
              >
                <Heart size={36} fill="#FF9D2E" className="drop-shadow-lg" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Central Singer Avatar */}
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <div className="h-36 w-36 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#FF9D2E] via-[#24A3C7] to-[#6139F2] shadow-[0_0_40px_rgba(36,163,199,0.4)]">
              <Avatar
                size={136}
                profile={{
                  id: host.id,
                  display_name: host.display_name || host.name || "Performer",
                  avatar_url: host.avatar_url || host.avatar || "",
                }}
                className="w-full h-full"
              />
            </div>

            {/* Mic Indicator Badge */}
            <div className="absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF9D2E] to-[#24A3C7] text-black shadow-xl border-4 border-[#030712]">
              <Mic size={20} strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="mt-4 text-xl font-bold text-white tracking-tight">
            {host.display_name || host.name || "Host Performer"}
          </h2>
          <span className="mt-1 px-3 py-1 rounded-full bg-[#FF9D2E]/15 text-[#FF9D2E] text-xs font-bold border border-[#FF9D2E]/30 uppercase tracking-wider">
            On Mic • Live Singer
          </span>
        </div>

        {/* Lyrics Display Banner */}
        <div className="mt-8 w-full max-w-[340px] rounded-[22px] glass-panel-elevated p-4 text-center border border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#39B7F2]">
            Current Track
          </p>
          <h3 className="text-sm font-bold text-white mt-0.5">Kapana Vibes — Gaza Jam Session</h3>
          <p className="text-xs italic text-white/70 mt-2 font-serif">
            "Under the Windhoek sky, we sing as one..."
          </p>
        </div>
      </div>

      {/* Floating Bottom Audio Controls */}
      <div className="relative z-20 p-5 pb-safe glass-header">
        <div className="mx-auto flex max-w-[360px] items-center justify-between rounded-full glass-panel-elevated px-5 py-3 border border-white/15 shadow-2xl">
          <button
            onClick={toggleMute}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition active:scale-90 ${
              isContextMuted
                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            aria-label="Toggle Mic"
          >
            {isContextMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={handleSendReaction}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF9D2E]/15 text-[#FF9D2E] border border-[#FF9D2E]/40 hover:bg-[#FF9D2E]/25 transition active:scale-90"
            aria-label="Send Love"
          >
            <Heart size={20} fill="#FF9D2E" />
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Stage link copied!");
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-90"
            aria-label="Share Stage"
          >
            <Share2 size={20} />
          </button>

          <button
            onClick={handleLeave}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-90 transition"
            aria-label="Leave Stage"
          >
            <LogOut size={20} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default KaraokeRoom;
