import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, Calendar, Mic, Users, Play } from "lucide-react";
import { VoiceNotePlayer } from "../voice/VoiceNotePlayer";

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

  const currentStory = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
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
  }, [currentIndex, stories.length, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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

  if (!currentStory) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden"
      >
        {/* Background Media */}
        <div className="absolute inset-0 cursor-pointer" onClick={handleTap}>
          {currentStory.mediaType === "image" && currentStory.mediaUrl ? (
            <img src={currentStory.mediaUrl} alt="Story" className="w-full h-full object-cover" />
          ) : currentStory.mediaType === "video" && currentStory.mediaUrl ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a0a00] via-[#1a1a2e] to-[#2d0d5a]">
              {currentStory.mediaType === "voice" && (
                <div className="w-full max-w-[280px] p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9D2E] to-[#FF6B6B] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,157,46,0.3)]">
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
                    {currentStory.content?.title || "Upcoming Event"}
                  </h2>
                  <p className="text-white/60 text-sm mb-6">
                    {currentStory.content?.date || "Tomorrow at 8 PM"}
                  </p>
                  <button className="w-full py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition">
                    RSVP Now
                  </button>
                </div>
              )}
              {currentStory.mediaType === "room" && (
                <div className="w-full max-w-[280px] p-6 rounded-[32px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-blue-500/30 shadow-2xl text-center">
                  <div className="flex -space-x-4 justify-center mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=mike"
                      className="w-12 h-12 rounded-full border-2 border-[#1a1a2e]"
                    />
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=emma"
                      className="w-12 h-12 rounded-full border-2 border-[#1a1a2e]"
                    />
                    <div className="w-12 h-12 rounded-full border-2 border-[#1a1a2e] bg-blue-500 flex items-center justify-center text-white">
                      <Mic size={16} />
                    </div>
                  </div>
                  <h2 className="text-white font-bold text-xl mb-2 leading-tight">
                    {currentStory.content?.title || "Tech Talk Room"}
                  </h2>
                  <p className="text-white/60 text-sm mb-6">
                    {currentStory.content?.listeners || "45"} listening now
                  </p>
                  <button className="w-full py-3 rounded-full bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition">
                    Join Room
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Overlay Gradient for readability */}
          {(currentStory.mediaType === "image" || currentStory.mediaType === "video") && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
          )}
        </div>

        {/* Safe Area Top Content */}
        <div className="relative z-10 pt-safe px-4 mt-4 pointer-events-none">
          {/* Progress Bars */}
          <div className="flex gap-1 mb-4">
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

          {/* Header */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <img
                src={currentStory.userAvatar}
                alt={currentStory.username}
                className="w-10 h-10 rounded-full border border-white/20 object-cover"
              />
              <div className="flex flex-col">
                <span className="font-bold text-[15px]">{currentStory.username}</span>
                <span className="text-[11px] text-white/70">{currentStory.timestamp}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1" />

        {/* Bottom Actions */}
        <div className="relative z-10 p-4 pb-safe pointer-events-auto flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Write message here to send"
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white placeholder:text-white/80 rounded-full py-3.5 px-6 focus:outline-none transition-colors border border-white/10"
              onClick={(e) => e.stopPropagation()} // Prevent story advance on click
            />
          </div>

          <button
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors"
            onClick={(e) => {
              e.stopPropagation(); /* handle like */
            }}
          >
            <Heart className="w-6 h-6 text-white" />
          </button>

          <button
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors"
            onClick={(e) => {
              e.stopPropagation(); /* handle share */
            }}
          >
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
