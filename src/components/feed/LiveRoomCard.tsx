import { motion } from "framer-motion";
import { Mic, Users, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LiveRoomCard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-[20px] overflow-hidden border border-[#FF9D2E]/30 bg-gradient-to-br from-[#FF9D2E]/10 to-transparent relative p-5"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF9D2E] to-[#FF6B6B]" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#FF9D2E]/20 text-[#FF9D2E] text-[10px] font-bold uppercase tracking-widest rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF9D2E] animate-pulse" />
          Live Room
        </div>
        <div className="flex items-center gap-1.5 text-white/50 text-xs font-semibold">
          <Users size={14} /> 28
        </div>
      </div>

      <h3 className="text-white text-xl font-bold mb-2">Late Night R&B Karaoke 🎤</h3>
      <p className="text-white/60 text-sm mb-6">Hosted by @sarah_music • 4 friends inside</p>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-[#151515] overflow-hidden bg-[#222]"
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                alt="user"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/room/rnb-karaoke?category=karaoke")}
          className="ml-auto bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/90 transition flex items-center gap-2"
        >
          <PlayCircle size={16} /> Join
        </button>
      </div>
    </motion.div>
  );
}
