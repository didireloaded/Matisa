import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smile } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface SetMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMood?: string | null;
}

const EMOJIS = ["😎", "🥳", "😴", "☕", "🎶", "🏖️", "🔥", "🇿🇦"];

export function SetMoodModal({ isOpen, onClose, currentMood }: SetMoodModalProps) {
  const { user, profile } = useAuth();
  const [moodText, setMoodText] = useState(currentMood || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ mood: moodText })
        .eq("id", user.id);
      
      if (error) throw error;
      
      // Update local profile context if needed (handled by realtime or reload)
      onClose();
      // Optional: force reload or use a store
      window.location.reload(); 
    } catch (err) {
      console.error("Error setting mood:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setMoodText("");
    if (!user) return;
    setLoading(true);
    try {
      await supabase.from("profiles").update({ mood: null }).eq("id", user.id);
      onClose();
      window.location.reload();
    } catch (err) {}
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-[#151515] rounded-t-3xl sm:rounded-3xl p-6 relative z-10 border border-white/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Smile className="text-[#FF9D2E]" /> Set Your Vibe
              </h2>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={moodText}
                onChange={(e) => setMoodText(e.target.value.slice(0, 40))}
                placeholder="What's your vibe right now? (e.g. 🎶 Jamming)"
                className="w-full bg-[#0B0B0B] border border-white/10 rounded-2xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FF9D2E]"
                maxLength={40}
              />

              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setMoodText((prev) => (emoji + " " + prev).slice(0, 40))}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl hover:bg-white/10 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleClear}
                  className="flex-1 py-3.5 rounded-full bg-white/5 text-white/70 font-semibold"
                >
                  Clear
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-[2] py-3.5 rounded-full bg-[#FF9D2E] text-black font-bold disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Update Vibe"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
