import { motion } from "framer-motion";
import { Users, Music, Mic, ArrowLeft } from "lucide-react";

interface KaraokePreJoinProps {
  roomTitle: string;
  category: string;
  onJoinAsListener: () => void;
  onJoinAsSinger: () => void;
  onBack: () => void;
}

export function KaraokePreJoin({
  roomTitle,
  category,
  onJoinAsListener,
  onJoinAsSinger,
  onBack,
}: KaraokePreJoinProps) {
  return (
    <div className="flex flex-col h-full bg-[#0F0D0B] text-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#A855F7]/20 to-transparent pointer-events-none" />

      <div className="flex flex-col items-center justify-center flex-1 p-6 relative z-10">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 rounded-full bg-[#151515] border-4 border-[#A855F7] mb-8 flex items-center justify-center relative shadow-[0_0_50px_rgba(168,85,247,0.3)]"
        >
          <Music className="w-12 h-12 text-[#A855F7]" />
          <div className="absolute -bottom-2 -right-2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Users size={12} /> 28
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold text-center mb-2">{roomTitle}</h1>
        <p className="text-white/50 mb-12 text-center max-w-xs">
          Join the {category.replace("_", " ")} room. 2 people are in the singing queue right now.
        </p>

        <div className="w-full max-w-sm flex flex-col gap-4">
          <button
            onClick={onJoinAsListener}
            className="w-full py-4 rounded-full border border-white/20 font-bold text-lg hover:bg-white/5 transition flex items-center justify-center gap-2"
          >
            Join as Listener
          </button>

          <button
            onClick={onJoinAsSinger}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#A855F7] to-[#FF6B6B] font-bold text-lg hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2"
          >
            <Mic size={20} />
            Join & Add to Queue
          </button>
        </div>
      </div>
    </div>
  );
}
