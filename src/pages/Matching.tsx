import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Star, Music, Mic, Award } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";

const DUMMY_PROFILES = [
  {
    id: "1",
    name: "Alex Rivera",
    role: "Producer / Beatmaker",
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800&h=1000&fit=crop",
    bio: "Looking for vocalists for my upcoming synthwave EP. I have a studio in downtown LA.",
    tags: ["Synthwave", "Ableton", "Mixing"],
    distance: "2 miles away",
  },
  {
    id: "2",
    name: "Sarah Chen",
    role: "Vocalist / Songwriter",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop",
    bio: "R&B and Neo-soul singer looking for producers to collaborate with. Let's make magic.",
    tags: ["R&B", "Vocals", "Topline"],
    distance: "5 miles away",
  },
];

export function Matching() {
  const [profiles, setProfiles] = useState(DUMMY_PROFILES);

  const handleSwipe = (direction: "left" | "right") => {
    setProfiles((prev) => prev.slice(1));
  };

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[var(--color-background)] px-5 text-center pb-28">
        <div className="w-20 h-20 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center mb-6">
          <Star className="text-[var(--color-primary)] w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">You're all caught up!</h2>
        <p className="text-[var(--color-text-muted)] mb-8">
          We're searching for more creators in your area.
        </p>
        <Button variant="outline" onClick={() => setProfiles(DUMMY_PROFILES)}>
          Refresh Matches
        </Button>
      </div>
    );
  }

  const currentProfile = profiles[0];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-background)] pb-28 overflow-hidden relative">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <h1 className="text-white text-2xl font-display font-bold tracking-tight text-center">
          Find Collaborators
        </h1>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 pt-16">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentProfile.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative w-full aspect-[3/4] max-h-[600px] rounded-[32px] overflow-hidden shadow-2xl bg-[var(--color-surface-2)]"
          >
            <img
              src={currentProfile.image}
              alt={currentProfile.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-white text-xs font-bold flex items-center gap-1">
                <Star size={12} className="text-[var(--color-primary)]" fill="currentColor" /> Match
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 pt-20">
              <h2 className="text-3xl font-bold text-white mb-1 leading-tight">
                {currentProfile.name}
              </h2>
              <p className="text-[var(--color-primary)] font-bold text-sm mb-3 flex items-center gap-1.5">
                <Mic size={14} /> {currentProfile.role}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {currentProfile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-2">
                "{currentProfile.bio}"
              </p>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                📍 {currentProfile.distance}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 mt-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe("left")}
            className="w-16 h-16 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] flex items-center justify-center hover:bg-[var(--color-surface-3)] hover:text-white transition shadow-lg border border-[var(--color-border)]"
          >
            <X size={28} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500/20 transition shadow-lg border border-blue-500/20"
          >
            <MessageCircle size={24} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe("right")}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF416C] to-[#8E2DE2] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,65,108,0.4)]"
          >
            <Heart size={28} fill="currentColor" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Matching;
