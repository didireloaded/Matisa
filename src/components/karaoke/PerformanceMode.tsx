import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Heart, Sparkles, Star } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { KaraokeService } from "@/services/karaoke";

interface PerformanceModeProps {
  roomId: string;
  singerId: string;
  singerName: string;
  singerAvatar: string;
  songTitle?: string;
  songArtist?: string;
}

export function PerformanceMode({
  roomId,
  singerId,
  singerName,
  singerAvatar,
  songTitle,
  songArtist,
}: PerformanceModeProps) {
  const [fireCount, setFireCount] = useState(0);
  const [flyingReactions, setFlyingReactions] = useState<{ id: number; type: string; x: number }[]>(
    [],
  );

  useEffect(() => {
    // Subscribe to realtime reactions for the room
    const channel = KaraokeService.subscribeToRoom(
      roomId,
      "performance-viewer",
      (emoji) => {
        if (emoji === "🔥") setFireCount((prev) => prev + 1);

        const newReaction = {
          id: Date.now() + Math.random(),
          type: emoji,
          x: Math.random() * 80 + 10, // Random X position 10% to 90%
        };

        setFlyingReactions((prev) => [...prev.slice(-20), newReaction]);
      },
      () => {},
    );

    return () => {
      KaraokeService.unsubscribe(channel);
    };
  }, [roomId]);

  const handleTapReaction = () => {
    setFireCount((prev) => prev + 1);
    KaraokeService.broadcastReaction(roomId, "🔥");

    // Optimistic flying animation
    const newReaction = {
      id: Date.now(),
      type: "🔥",
      x: Math.random() * 80 + 10,
    };
    setFlyingReactions((prev) => [...prev.slice(-20), newReaction]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-black overflow-hidden"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#C8521A]/40 to-black pointer-events-none" />

      {/* Flying Reactions */}
      <AnimatePresence>
        {flyingReactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 1, y: "100vh", x: `${reaction.x}vw`, scale: 0.5 }}
            animate={{ opacity: 0, y: "-20vh", scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute bottom-0 text-4xl pointer-events-none"
          >
            {reaction.type}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative w-32 h-32 mb-6"
        >
          <div className="absolute inset-0 rounded-full bg-[#C8521A] blur-2xl opacity-50 animate-pulse" />
          <Avatar
            profile={{ id: singerId, display_name: singerName, avatar_url: singerAvatar }}
            size={128}
            className="border-4 border-[#C8521A] shadow-2xl relative z-10"
          />
        </motion.div>

        <h1 className="text-4xl font-bold text-white mb-2 text-center">{singerName}</h1>
        {songTitle && (
          <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mb-12">
            <span className="text-[#E8A055] font-bold">Singing:</span>{" "}
            <span className="text-white">{songTitle}</span>{" "}
            <span className="text-white/50 text-sm">by {songArtist}</span>
          </div>
        )}

        <div className="flex items-center gap-4 bg-black/50 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(200,82,26,0.2)]">
          <Flame className="w-8 h-8 text-[#C8521A] fill-[#C8521A]" />
          <div className="flex flex-col">
            <span className="text-xs text-white/50 font-bold uppercase tracking-widest">
              Fire Score
            </span>
            <span className="text-3xl font-mono font-bold text-white">
              {fireCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Tap Area */}
      <div
        onClick={handleTapReaction}
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent cursor-pointer flex items-end justify-center pb-12"
      >
        <div className="flex flex-col items-center animate-bounce text-white/50">
          <span className="text-sm font-bold uppercase tracking-widest mb-2">Tap to Fire</span>
          <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          // We dispatch an event so KaraokeRoom can handle it
          window.dispatchEvent(new CustomEvent("karaoke:end_performance"));
        }}
        className="absolute top-8 right-8 bg-black/50 backdrop-blur-xl text-white px-4 py-2 rounded-full border border-white/10 text-sm font-bold hover:bg-white/10"
      >
        End
      </button>
    </motion.div>
  );
}
