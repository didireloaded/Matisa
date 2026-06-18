import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Profile } from "../../types";

interface VoiceNotePlayerProps {
  id?: string;
  author?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string | null;
  };
  audioUrl: string;
  durationSeconds: number;
  waveform?: number[];
  reactions?: { id: string; emoji: string; x: number; userId: string }[];
  onReact?: (emoji: string) => void;
  variant?: "note" | "chat" | "intro";
  showReactions?: boolean;
  listeningCount?: number;
}

export function VoiceNotePlayer({
  author,
  audioUrl,
  durationSeconds,
  waveform = Array(30).fill(20),
  reactions = [],
  onReact,
  variant = "note",
  showReactions = true,
  listeningCount = 0,
}: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeReactions, setActiveReactions] = useState<
    { id: number; emoji: string; x: number }[]
  >([]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    setProgress((current / durationSeconds) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const addReaction = (emoji: string) => {
    if (onReact) onReact(emoji);
    const newReaction = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
    setActiveReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2000);
  };

  return (
    <div
      className={`relative ${variant === "chat" ? "bg-[var(--primary)] text-white" : "bg-[#1A1A1A]"} rounded-3xl p-4 flex items-center gap-4 border border-white/5 shadow-lg w-full overflow-hidden`}
    >
      {/* Floating Reactions overlay */}
      {showReactions && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <AnimatePresence>
            {activeReactions.map((reaction) => (
              <motion.div
                key={reaction.id}
                initial={{ y: 50, opacity: 1, x: `${reaction.x}%`, scale: 0.5 }}
                animate={{ y: -50, opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute bottom-0 text-2xl drop-shadow-lg"
              >
                {reaction.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {author && variant === "note" && (
        <img
          src={
            author.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username || author.id}`
          }
          alt={author.username || author.display_name || "User"}
          className="w-12 h-12 rounded-full object-cover bg-white/10"
        />
      )}

      <button
        onClick={togglePlayback}
        className={`w-10 h-10 shrink-0 rounded-full ${variant === "chat" ? "bg-white text-[var(--primary)]" : "bg-[var(--primary)] text-white"} flex items-center justify-center hover:scale-105 transition-transform shadow-md z-20`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" fill="currentColor" />
        ) : (
          <Play className="w-5 h-5 pl-0.5" fill="currentColor" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1 z-20">
        <div className="flex items-center justify-between">
          {author && variant === "note" ? (
            <span className="text-sm font-bold text-white">
              {author.username || author.display_name || "User"}
            </span>
          ) : (
            <span className="text-sm font-bold opacity-80">
              {variant === "intro" ? "Voice Intro" : "Voice Note"}
            </span>
          )}
          <div className="flex items-center gap-2">
            {listeningCount > 0 && (
              <span className="text-xs opacity-70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                {listeningCount} listening
              </span>
            )}
            <span className="text-xs opacity-50">{durationSeconds}s</span>
          </div>
        </div>

        {/* Waveform Player */}
        <div className="relative h-6 w-full flex items-center gap-0.5">
          {waveform.map((height, i) => {
            const isPlayed = (i / waveform.length) * 100 <= progress;
            return (
              <div
                key={i}
                className="w-1 flex-1 rounded-full overflow-hidden"
                style={{
                  height: `${Math.max(20, height)}%`,
                  backgroundColor:
                    variant === "chat" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className={`w-full h-full ${variant === "chat" ? "bg-white" : "bg-[var(--primary)]"} transition-all duration-75`}
                  style={{
                    opacity: isPlayed ? 1 : 0,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Reactions */}
      {showReactions && variant !== "intro" && variant !== "chat" && (
        <div className="flex flex-col gap-1 z-20">
          <button
            onClick={() => addReaction("🔥")}
            className="text-lg hover:scale-125 transition-transform"
          >
            🔥
          </button>
          <button
            onClick={() => addReaction("❤️")}
            className="text-lg hover:scale-125 transition-transform"
          >
            ❤️
          </button>
        </div>
      )}

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
    </div>
  );
}
