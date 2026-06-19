import { useVoice } from "@/contexts/VoiceContext";
import { Mic, MicOff, Maximize2, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingVoicePlayer() {
  const { activeRoomId, activeRoomTitle, isMuted, toggleMute, leaveRoom } = useVoice();
  const navigate = useNavigate();
  const location = useLocation();

  // Do not show the mini-player if we're actually inside the room
  const isInsideRoom = location.pathname === `/room/${activeRoomId}`;

  if (!activeRoomId || isInsideRoom) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-[90px] left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-2rem)] z-50"
      >
        <div className="bg-[#1a0a2e]/90 backdrop-blur-xl border border-[#8B5CF6]/30 rounded-2xl p-3 flex items-center justify-between shadow-2xl shadow-[#8B5CF6]/20">
          <div className="flex flex-col flex-1 min-w-0 pr-4">
            <span className="text-[#00E5FF] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" /> Live Room
            </span>
            <span className="text-white text-sm font-bold truncate">
              {activeRoomTitle || "Voice Room"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                isMuted ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white"
              }`}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={() => navigate(`/room/${activeRoomId}`)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={leaveRoom}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-500/20 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
