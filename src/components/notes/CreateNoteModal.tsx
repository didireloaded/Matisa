import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NoteService } from "@/services/NoteService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";

interface CreateNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: "text" | "voice";
}

export function CreateNoteModal({
  open,
  onClose,
  onSuccess,
  initialMode = "text",
}: CreateNoteModalProps) {
  const { profile } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"text" | "voice">("text");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const MAX_CHARS = 100;
  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = MAX_CHARS - charCount <= 20;

  // Auto focus when modal opens
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Reset state on close
      setContent("");
      setIsSubmitting(false);
      setMode("text");
    }
  }, [open, initialMode]);

  const handleSubmit = async () => {
    if (!profile || !content.trim() || isOverLimit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await NoteService.createNote(profile.id, content.trim(), "text");

      if (result) {
        toast.success("Note shared with your crew! 🚀");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        throw new Error("Failed to create note");
      }
    } catch (error) {
      toast.error("Couldn't post your note. Try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoicePublish = async (audioUrl: string, duration: number, waveform: number[]) => {
    if (!profile) return;
    try {
      const result = await NoteService.createNote(
        profile.id,
        content.trim() || "",
        "voice",
        audioUrl,
        duration,
        waveform,
      );

      if (result) {
        toast.success("Voice note shared! 🎤");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        throw new Error("Failed to create note");
      }
    } catch (error) {
      toast.error("Couldn't post your voice note. Try again.");
      console.error(error);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--color-surface-elevated)] border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex bg-black/40 rounded-full p-1 border border-white/5 relative">
              <button
                onClick={() => setMode("text")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-bold transition-colors relative z-10",
                  mode === "text" ? "text-white" : "text-white/40 hover:text-white/70",
                )}
              >
                Text
              </button>
              <button
                onClick={() => setMode("voice")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-bold transition-colors relative z-10",
                  mode === "voice" ? "text-white" : "text-white/40 hover:text-white/70",
                )}
              >
                Voice
              </button>
              {/* Highlight Pill */}
              <motion.div
                className="absolute inset-y-1 w-1/2 bg-[var(--color-surface-3)] rounded-full z-0"
                initial={false}
                animate={{
                  left: mode === "text" ? "4px" : "calc(50% - 4px)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-4">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  mode === "voice" ? "Add an optional caption..." : "What's on your mind?..."
                }
                className={cn(
                  "w-full bg-transparent text-white font-medium placeholder:text-white/30 resize-none outline-none transition-all",
                  mode === "voice" ? "text-base min-h-[60px]" : "text-xl md:text-2xl min-h-[120px]",
                )}
                maxLength={MAX_CHARS + 50}
              />

              {/* Character Counter */}
              {mode === "text" && (
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  {isOverLimit && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <AlertCircle size={16} className="text-red-500" />
                    </motion.div>
                  )}
                  <span
                    className={cn(
                      "text-xs font-bold transition-colors",
                      isOverLimit
                        ? "text-red-500"
                        : isNearLimit
                          ? "text-amber-500"
                          : "text-white/40",
                    )}
                  >
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
              )}
            </div>

            {mode === "voice" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-center mt-2"
              >
                <VoiceRecorder mode="note" maxDurationSeconds={30} onPublish={handleVoicePublish} />
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-white/40 font-medium">Notes disappear in 24 hours</p>

            {mode === "text" && (
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isOverLimit || isSubmitting}
                className={cn(
                  "flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-200",
                  !content.trim() || isOverLimit || isSubmitting
                    ? "bg-white/10 text-white/30 cursor-not-allowed"
                    : "bg-[var(--color-primary)] text-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)]",
                )}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send
                      size={16}
                      className={content.trim() ? "translate-x-0.5 -translate-y-0.5" : ""}
                    />
                    Share
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
