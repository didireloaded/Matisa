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
  Music2,
  UserPlus,
  Shield,
  MessageSquare,
  Lock,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/common/Avatar";
import { useVoice } from "@/contexts/VoiceContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { USERS } from "@/data/dummy";

export function KaraokeRoom() {
  const { roomId: rawRoomId, id: rawId } = useParams<{ roomId?: string; id?: string }>();
  const roomId = rawRoomId || rawId || "demo-room";
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { joinRoom, leaveRoom, isMuted: isContextMuted, toggleMute } = useVoice();
  const [roomData, setRoomData] = useState<any>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: string; x: number }[]>([]);
  const [isFollowingSinger, setIsFollowingSinger] = useState(false);
  const [queueList, setQueueList] = useState([
    { id: "q1", name: "Michelle V.", avatar: USERS[1].avatar, song: "Midnight Sunset" },
    { id: "q2", name: "DJ Castro", avatar: USERS[2].avatar, song: "Windhoek Beats" },
  ]);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isHostControlsOpen, setIsHostControlsOpen] = useState(false);
  const [isQueueLocked, setIsQueueLocked] = useState(false);

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
  }, [roomId, joinRoom]);

  const handleLeave = () => {
    leaveRoom();
    navigate(-1);
  };

  const handleSendReaction = () => {
    const id = Math.random().toString(36).substring(2, 9);
    const x = Math.random() * 60 + 20;
    setFloatingHearts((prev) => [...prev, { id, x }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1800);
  };

  const handleJoinQueue = () => {
    if (isQueueLocked) {
      return toast.error("Queue is locked by host");
    }
    toast.success("Joined singer queue!");
    setQueueList((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        name: profile?.display_name || "You",
        avatar: profile?.avatar_url || USERS[0].avatar,
        song: "Namibian Sunrise",
      },
    ]);
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
      <div className="relative z-20 flex items-center justify-between px-5 pt-10 pb-4 glass-header">
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
              {roomData?.title || "Windhoek Karaoke Stage"}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-[#FF9D2E] shadow-[0_0_8px_rgba(255,157,46,0.6)]" />
              <span className="text-[11px] font-bold text-[#FF9D2E] uppercase tracking-wider">
                KARAOKE LIVE STAGE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHostControlsOpen(!isHostControlsOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full glass-panel text-[#FF9D2E] border border-[#FF9D2E]/40 active:scale-95"
            aria-label="Host Tools"
          >
            <Shield size={17} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel text-xs text-white/80 font-semibold">
            <Users size={14} className="text-[#39B7F2]" />
            <span>142</span>
          </div>
        </div>
      </div>

      {/* Main Performer Stage */}
      <div className="relative z-10 flex-1 px-5 py-4 overflow-y-auto no-scrollbar flex flex-col justify-center items-center">
        {/* Floating Heart Reactions */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
          <AnimatePresence>
            {floatingHearts.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 100, scale: 0.5 }}
                animate={{ opacity: 1, y: -220, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                style={{ left: `${h.x}%` }}
                className="absolute bottom-20 text-[#FF9D2E]"
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

          <div className="flex items-center gap-2 mt-4">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {host.display_name || host.name || "Host Performer"}
            </h2>
            <button
              onClick={() => {
                setIsFollowingSinger(!isFollowingSinger);
                toast.success(isFollowingSinger ? "Unfollowed performer" : "Following performer!");
              }}
              className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
            >
              <UserPlus size={15} />
            </button>
          </div>
          <span className="mt-1 px-3 py-1 rounded-full bg-[#FF9D2E]/15 text-[#FF9D2E] text-xs font-bold border border-[#FF9D2E]/30 uppercase tracking-wider">
            On Stage • Live Singer
          </span>
        </div>

        {/* Lyrics Display Banner */}
        <div className="mt-6 w-full max-w-[340px] rounded-[22px] glass-panel-elevated p-4 text-center border border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#39B7F2]">
            Current Song
          </p>
          <h3 className="text-sm font-bold text-white mt-0.5">Kapana Vibes — Gaza Jam Session</h3>
          <p className="text-xs italic text-white/70 mt-2 font-serif">
            "Under the Namibian sky, we sing as one..."
          </p>
        </div>

        {/* Singer Queue Action Row */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleJoinQueue}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF9D2E] to-[#24A3C7] text-black font-bold text-xs shadow-lg active:scale-95 transition"
          >
            <Music2 size={15} />
            <span>Request to Sing</span>
          </button>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-panel text-white text-xs font-bold border border-white/15 active:scale-95 transition"
          >
            <span>Queue ({queueList.length})</span>
          </button>
        </div>
      </div>

      {/* Drawer: Singer Queue */}
      {isQueueOpen && (
        <div className="absolute inset-x-0 bottom-24 z-40 p-4 bg-[#06101D]/95 glass-panel-elevated border-t border-white/20 rounded-t-[28px] max-h-60 overflow-y-auto space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Upcoming Singer Queue
          </h3>
          {queueList.map((q, idx) => (
            <div
              key={q.id}
              className="flex items-center justify-between p-2 rounded-2xl glass-panel text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[#FF9D2E]">#{idx + 1}</span>
                <Avatar
                  size={32}
                  profile={{ id: q.id, display_name: q.name, avatar_url: q.avatar }}
                />
                <div>
                  <h4 className="font-bold text-white leading-tight">{q.name}</h4>
                  <span className="text-[10px] text-white/50">{q.song}</span>
                </div>
              </div>
              {profile && (
                <button
                  onClick={() => {
                    setQueueList((prev) => prev.filter((item) => item.id !== q.id));
                    toast.success("Removed from queue");
                  }}
                  aria-label="Remove from queue"
                  className="text-white/40 hover:text-white text-[10px]"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drawer: Host Controls */}
      {isHostControlsOpen && (
        <div className="absolute inset-x-0 bottom-24 z-40 p-5 bg-[#06101D]/95 glass-panel-elevated border-t border-[#FF9D2E]/40 rounded-t-[28px] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#FF9D2E] uppercase tracking-wider">
              Host Session Controls
            </h3>
            <button onClick={() => setIsHostControlsOpen(false)} aria-label="Close Host Tools">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setIsQueueLocked(!isQueueLocked);
                toast.info(isQueueLocked ? "Queue unlocked" : "Queue locked");
              }}
              className="p-2.5 rounded-xl glass-panel text-white font-bold flex items-center justify-center gap-1.5"
            >
              <Lock size={14} />
              <span>{isQueueLocked ? "Unlock Queue" : "Lock Queue"}</span>
            </button>
            <button
              onClick={() => toast.info("Performance time set to 3 mins")}
              className="p-2.5 rounded-xl glass-panel text-white font-bold"
            >
              Max Time: 3m
            </button>
            <button
              onClick={() => toast.info("Singer muted")}
              className="p-2.5 rounded-xl glass-panel text-white font-bold"
            >
              Mute Singer
            </button>
            <button
              onClick={() => {
                toast.success("Session ended for everyone");
                handleLeave();
              }}
              className="p-2.5 rounded-xl bg-red-500/20 text-red-400 font-bold border border-red-500/30"
            >
              End Room
            </button>
          </div>
        </div>
      )}

      {/* Spectator Cheer & Reaction Bar */}
      <div className="relative z-20 px-5 mb-2 flex items-center justify-center gap-2">
        <button
          onClick={() => {
            handleSendReaction();
            toast.success("👏 You cheered the singer!");
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold border border-white/15 hover:bg-white/20 active:scale-95 transition"
        >
          <span>👏</span>
          <span>Cheer</span>
        </button>

        <button
          onClick={() => {
            handleSendReaction();
            toast.success("🔥 Fire energy sent!");
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FF9D2E]/15 text-[#FF9D2E] text-xs font-bold border border-[#FF9D2E]/30 hover:bg-[#FF9D2E]/25 active:scale-95 transition"
        >
          <span>🔥</span>
          <span>Fire</span>
        </button>

        <button
          onClick={() => {
            handleSendReaction();
            toast.success("🎉 Party vibes!");
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#6139F2]/15 text-[#24A3C7] text-xs font-bold border border-[#6139F2]/30 hover:bg-[#6139F2]/25 active:scale-95 transition"
        >
          <span>🎉</span>
          <span>Vibes</span>
        </button>
      </div>

      {/* Floating Bottom Controls */}
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
