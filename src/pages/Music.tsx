import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Users, Music as MusicIcon, Radio, Plus, Volume2, X } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { KARAOKE_ROOMS, USERS } from "@/data/dummy";
import { useAuth } from "@/contexts/AuthContext";
import { DiscoveryAI } from "@/services/ai";
import { useMemo, useEffect } from "react";

function getUserByUsername(username: string) {
  return USERS.find((u) => u.username === username) || USERS[0];
}

function ActiveRoom({ room, onClose }: { room: typeof KARAOKE_ROOMS[0]; onClose: () => void }) {
  const [joined, setJoined] = useState(false);
  const host = getUserByUsername(room.host);
  const audience = USERS.slice(0, room.listeners > 6 ? 6 : room.listeners);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(180deg, #0f0020 0%, #0B0B0B 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <h2 className="text-white text-lg font-extrabold">{room.name}</h2>
          <p className="text-white/40 text-xs mt-0.5">{room.genre} · {room.listeners} listening</p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
        >
          <X size={16} className="text-white" />
        </button>
      </div>

      {/* Stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Host */}
        <div className="relative mb-8">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40"
            style={{ background: "radial-gradient(circle, #A855F7, transparent)" }}
          />
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#A855F7]">
            <ImageWithFallback src={host.avatar} alt={host.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#A855F7] text-white text-[10px] font-bold whitespace-nowrap">
            HOST
          </div>
        </div>

        {/* Now playing */}
        <div className="bg-white/5 rounded-2xl px-5 py-4 mb-6 text-center border border-white/10 w-full max-w-xs">
          <div className="flex items-center justify-center gap-2 mb-1">
            <MusicIcon size={14} className="text-[#FF9D2E]" />
            <span className="text-white/50 text-xs uppercase tracking-wider">Now Playing</span>
          </div>
          <p className="text-white text-sm" style={{ fontWeight: 600 }}>{room.currentSong}</p>
        </div>

        {/* Audience */}
        <div className="w-full">
          <p className="text-white/30 text-[10px] uppercase tracking-widest text-center mb-3">Audience</p>
          <div className="flex justify-center flex-wrap gap-3">
            {audience.map((u) => (
              <div key={u.id} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                  <ImageWithFallback src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-white/40 text-[9px]">{u.name.split(" ")[0]}</span>
              </div>
            ))}
            {room.listeners > 6 && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-white/50 text-[10px]">+{room.listeners - 6}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-10 flex gap-3">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setJoined(!joined)}
          className="flex-1 py-3.5 rounded-2xl text-sm"
          style={{
            background: joined
              ? "rgba(168,85,247,0.15)"
              : "linear-gradient(135deg, #A855F7, #7C3AED)",
            color: joined ? "#A855F7" : "white",
            fontWeight: 700,
            border: joined ? "1px solid rgba(168,85,247,0.4)" : "none",
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <Mic size={16} />
            {joined ? "Leave Stage" : "Take the Stage"}
          </span>
        </motion.button>
        <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Volume2 size={18} className="text-white/60" />
        </button>
      </div>
    </motion.div>
  );
}

export function Music() {
  const { profile } = useAuth();
  const [activeRoom, setActiveRoom] = useState<typeof KARAOKE_ROOMS[0] | null>(null);
  const [recommendedHostnames, setRecommendedHostnames] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (profile) {
      DiscoveryAI.getRecommendedUsers(profile.id).then(users => {
        if (users) {
          setRecommendedHostnames(new Set(users.map((u: any) => u.username)));
        }
      }).catch(console.error);
    }
  }, [profile]);

  const sortedRooms = useMemo(() => {
    return [...KARAOKE_ROOMS].sort((a, b) => {
      const aRec = recommendedHostnames.has(a.host) ? 1 : 0;
      const bRec = recommendedHostnames.has(b.host) ? 1 : 0;
      if (aRec !== bRec) return bRec - aRec;
      return a.listeners > b.listeners ? -1 : 1;
    });
  }, [recommendedHostnames]);

  return (
    <div className="min-h-full pb-28">
      <div className="px-4 pt-4 pb-2 sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
        <h1 className="text-white text-2xl mb-1 font-extrabold tracking-tight">Karaoke Rooms</h1>
        <p className="text-white/40 text-sm">Live audio — join or start a room</p>
      </div>

      {/* Create room button */}
      <div className="px-4 mb-5 mt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-dashed border-white/20 text-white/50 text-sm hover:border-[#A855F7]/40 hover:text-[#A855F7] transition"
        >
          <Plus size={16} />
          Create a Room
        </motion.button>
      </div>

      {/* Live rooms */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Radio size={12} className="text-[#FF6B6B]" />
          <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold">Live Now</span>
          <div className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-pulse" />
        </div>
      </div>

      <div className="px-4 space-y-3">
        {sortedRooms.map((room, i) => {
          const host = getUserByUsername(room.host);
          const isRecommended = recommendedHostnames.has(room.host);
          
          return (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveRoom(room)}
              className={`w-full bg-[#151515] rounded-[20px] p-4 border text-left transition ${
                isRecommended 
                  ? 'border-[#FF9D2E]/40 shadow-[0_0_20px_rgba(255,157,46,0.1)] hover:border-[#FF9D2E]/60' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <ImageWithFallback src={host.avatar} alt={host.name} className="w-full h-full object-cover" />
                  </div>
                  {room.active && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF6B6B] border-2 border-[#0B0B0B] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white text-sm font-bold">{room.name}</h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] flex-shrink-0 font-bold"
                      style={{
                        background: room.active ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.05)",
                        color: room.active ? "#FF6B6B" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {room.active ? "LIVE" : "IDLE"}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">@{room.host} · {room.genre}</p>
                  <p className="text-white/60 text-xs mt-1 truncate font-bold">♪ {room.currentSong}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-white/40 text-[11px] font-bold">
                      <Users size={11} />
                      {room.listeners}
                    </span>
                    <span className="flex items-center gap-1 text-white/40 text-[11px] font-bold">
                      <Mic size={11} />
                      {room.singers} on stage
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {activeRoom && (
          <ActiveRoom room={activeRoom} onClose={() => setActiveRoom(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
