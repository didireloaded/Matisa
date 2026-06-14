import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic2, X, Users, Globe, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CreateVoiceRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateVoiceRoomModal({ open, onClose }: CreateVoiceRoomModalProps) {
  const [title, setTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    if (!title.trim()) return;

    // Generate a random room ID
    const roomId = `room-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Close modal
    onClose();

    // Navigate to room with title as query param
    navigate(`/room/${roomId}?title=${encodeURIComponent(title.trim())}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl"
            style={{
              background: "linear-gradient(180deg, var(--card) 0%, var(--background) 100%)",
            }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-[var(--border)] hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F44336]/10 text-[#F44336]">
                <Mic2 size={28} />
              </div>
              <h2 className="text-xl font-bold text-foreground">Start a Voice Room</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Host conversations, drop a beat, or just chill.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Room Topic
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Friday Night Vibes 🎤"
                  maxLength={40}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#F44336] focus:outline-none focus:ring-1 focus:ring-[#F44336]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Privacy
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPrivate(false)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition ${
                      !isPrivate
                        ? "border-[#F44336] bg-[#F44336]/10 text-[#F44336]"
                        : "border-border bg-background text-muted-foreground hover:border-[var(--muted-foreground)]"
                    }`}
                  >
                    <Globe size={16} /> Public
                  </button>
                  <button
                    onClick={() => setIsPrivate(true)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition ${
                      isPrivate
                        ? "border-[#F44336] bg-[#F44336]/10 text-[#F44336]"
                        : "border-border bg-background text-muted-foreground hover:border-[var(--muted-foreground)]"
                    }`}
                  >
                    <Lock size={16} /> Private
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={!title.trim()}
              className="mt-8 w-full rounded-full bg-[#F44336] py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              style={{ boxShadow: "0 4px 20px rgba(244, 67, 54, 0.3)" }}
            >
              Go Live
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
