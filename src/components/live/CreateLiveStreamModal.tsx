import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Video, Settings, Play, Users } from "lucide-react";

interface CreateLiveStreamModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateLiveStreamModal({ open, onClose }: CreateLiveStreamModalProps) {
  const [title, setTitle] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "followers">("public");

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-50 bg-[#0F0D0B] flex flex-col"
      >
        <div className="flex-1 relative">
          {/* Mock Camera View Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')]" />
          </div>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
            <button
              onClick={onClose}
              className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <button className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white">
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* Setup UI */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-12 flex flex-col items-center">
            <div className="w-full max-w-sm space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-md">
                  Go Live
                </h2>
                <p className="text-white/60 text-sm">Broadcast to your followers in real-time.</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="What's your stream about?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl px-5 py-4 text-white placeholder:text-white/40 outline-none focus:border-[#C8521A] transition-colors font-medium text-lg text-center"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setPrivacy("public")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${
                      privacy === "public"
                        ? "bg-[#C8521A] text-white"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    <Video className="w-4 h-4" /> Public
                  </button>
                  <button
                    onClick={() => setPrivacy("followers")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${
                      privacy === "followers"
                        ? "bg-[#C8521A] text-white"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    <Users className="w-4 h-4" /> Followers
                  </button>
                </div>
              </div>

              <button className="w-full mt-4 py-4 rounded-full bg-white text-black font-black text-lg flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                <Play className="w-6 h-6 fill-current" />
                START BROADCAST
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
