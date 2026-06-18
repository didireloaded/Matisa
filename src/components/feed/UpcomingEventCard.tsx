import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UpcomingEventCard() {
  const navigate = useNavigate();
  const [isRsvpd, setIsRsvpd] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-[20px] overflow-hidden border border-[#A855F7]/30 bg-gradient-to-br from-[#A855F7]/10 to-transparent relative p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#A855F7]/20 text-[#A855F7] text-[10px] font-bold uppercase tracking-widest rounded-full">
          Upcoming Event
        </div>
        <div className="flex items-center gap-1.5 text-white/50 text-xs font-semibold">
          <Calendar size={14} /> Tomorrow, 8 PM
        </div>
      </div>

      <h3 className="text-white text-xl font-bold mb-2">Acoustic Covers Night 🎸</h3>
      <p className="text-white/60 text-sm mb-6">
        Join @david for a chill evening of acoustic vibes. Bring your guitar!
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-white/40">
          <Users size={14} /> {isRsvpd ? 43 : 42} going
        </div>
        <button
          onClick={() => setIsRsvpd(!isRsvpd)}
          className={`ml-auto px-5 py-2.5 rounded-full font-bold text-sm transition ${
            isRsvpd ? "bg-[#A855F7] text-white" : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {isRsvpd ? "Going ✅" : "RSVP"}
        </button>
      </div>
    </motion.div>
  );
}
