import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  Share2,
  Calendar,
  Mic,
  Volume2,
  VolumeX,
  Send,
  Flag,
  Sparkles,
} from "lucide-react";
import { VoiceNotePlayer } from "../voice/VoiceNotePlayer";
import { toast } from "sonner";

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  mediaUrl?: string;
  mediaType: "image" | "video" | "voice" | "event" | "room";
  content?: any;
  timestamp: string;
}

interface StoriesViewerProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
}

export function StoriesViewer({ stories, initialIndex = 0, onClose }: StoriesViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [floatingReactions, setFloatingReactions] = useState<
    { id: number; emoji: string; x: number }[]
  >([]);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (isPaused) return;
    setProgress(0);
    const duration = 5000; // 5s per story
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            clearInterval(timer);
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, stories.length, onClose, isPaused]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsLiked(false);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsLiked(false);
    }
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const width = e.currentTarget.offsetWidth;
    const x = e.nativeEvent.offsetX;
    if (x < width / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const triggerReaction = (emoji: string) => {
    const id = Date.now();
    const x = Math.random() * 60 + 20; // 20% to 80% screen width
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1500);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    toast.success(`Story reply sent to @${currentStory.username}!`);
    setReplyText("");
  };

  if (!currentStory) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden select-none"
      >
        {/* Story Background Container with Tap & Press to Pause */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={handleTap}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {currentStory.mediaType === "image" && currentStory.mediaUrl ? (
            <img src={currentStory.mediaUrl} alt="Story" className="w-full h-full object-cover" />
          ) : currentStory.mediaType === "video" && currentStory.mediaUrl ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#06101D] via-[#0D1F38] to-[#1F0A2E]">
              {currentStory.mediaType === "voice" && (
                <div className="w-full max-w-[280px] p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9D2E] to-[#24A3C7] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(36,163,199,0.4)]">
                    <Mic size={28} className="text-white" />
                  </div>
                  <VoiceNotePlayer
                    audioUrl={
                      currentStory.content?.audioUrl ||
                      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                    }
                    durationSeconds={currentStory.content?.duration || 15}
                    variant="note"
                    showReactions={false}
                  />
                </div>
              )}
              {currentStory.mediaType === "event" && (
                <div className="w-full max-w-[280px] p-6 rounded-[32px] bg-gradient-to-br from-[#1A181C] to-[#2A241D] border border-[#FF9D2E]/30 shadow-2xl text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF9D2E]/20 text-[#FF9D2E] flex items-center justify-center mx-auto mb-4">
                    <Calendar size={24} />
                  </div>
                  <h2 className="text-white font-bold text-xl mb-2 leading-tight">
                    {currentStory.content?.title || "Namibian Creators Event"}
                  </h2>
                  <p className="text-white/60 text-sm mb-6">
                    {currentStory.content?.date || "Sat, 9 Aug • 18:00"}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success("RSVP Confirmed!");
                    }}
                    className="w-full py-3 rounded-full bg-[#FF9D2E] text-black font-bold text-sm shadow-lg active:scale-95 transition"
                  >
                    RSVP Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />
        </div>

        {/* Floating Reactions overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
          {floatingReactions.map((r) => (
            <motion.span
              key={r.id}
              initial={{ opacity: 1, y: "80vh", scale: 1 }}
              animate={{ opacity: 0, y: "20vh", scale: 1.8 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              style={{ left: `${r.x}%` }}
              className="absolute text-3xl select-none"
            >
              {r.emoji}
            </motion.span>
          ))}
        </div>

        {/* Top Header & Progress Bars */}
        <div className="relative z-20 pt-safe px-4 mt-4 pointer-events-none space-y-3">
          {/* Progress Segment Bars */}
          <div className="flex gap-1">
            {stories.map((_, idx) => (
              <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{
                    width:
                      idx === currentIndex ? `${progress}%` : idx < currentIndex ? "100%" : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Profile Header */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <img
                src={currentStory.userAvatar}
                alt={currentStory.username}
                className="w-10 h-10 rounded-full border-2 border-[#24A3C7] object-cover shadow-md"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white leading-tight">
                  {currentStory.username}
                </span>
                <span className="text-[10px] text-white/70">{currentStory.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition"
                aria-label="Toggle mute"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info("Story reported to moderation crew");
                }}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white backdrop-blur-md transition"
                aria-label="Report story"
              >
                <Flag size={16} />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Floating Quick Reaction Pills */}
        <div className="relative z-20 px-4 mb-2 flex items-center justify-center gap-3 pointer-events-auto">
          {["❤️", "🔥", "🙌", "😂", "👏"].map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation();
                triggerReaction(emoji);
              }}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-base border border-white/15 transition active:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Bottom Reply Input & Direct Message Send */}
        <div className="relative z-20 p-4 pb-safe pointer-events-auto flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
              placeholder={`Send message to @${currentStory.username}...`}
              className="w-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white placeholder:text-white/60 rounded-full py-3 pl-4 pr-10 text-xs focus:outline-none focus:border-[#24A3C7] transition border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
            {replyText.trim() && (
              <button
                onClick={handleSendReply}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#24A3C7] text-white shadow-md active:scale-95 transition"
              >
                <Send size={13} />
              </button>
            )}
          </div>

          <button
            className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md border transition active:scale-95 ${
              isLiked
                ? "bg-red-500 text-white border-red-500"
                : "bg-white/15 hover:bg-white/25 text-white border-white/20"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
              if (!isLiked) triggerReaction("❤️");
            }}
            aria-label="Like Story"
          >
            <Heart size={20} className={isLiked ? "fill-white" : ""} />
          </button>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 active:scale-95 transition"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(window.location.href);
              toast.success("Story link copied!");
            }}
            aria-label="Share Story"
          >
            <Share2 size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default StoriesViewer;
