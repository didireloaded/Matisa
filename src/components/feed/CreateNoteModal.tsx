import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { NoteService } from "@/services/NoteService";
import { Avatar } from "@/components/common/Avatar";

interface CreateNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateNoteModal({ open, onClose, onSuccess }: CreateNoteModalProps) {
  const { profile } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const charLimit = 50;
  const charsLeft = charLimit - content.length;
  const isOverLimit = charsLeft < 0;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!profile || !mounted) return null;

  const handleSubmit = async () => {
    if (!content.trim() || isOverLimit || !profile) return;

    setLoading(true);
    try {
      const newNote = await NoteService.createNote(profile.id, content.trim());

      if (!newNote) throw new Error("Failed to create note in database.");

      toast.success("Note dropped! It'll disappear in 24h.");
      setContent("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to post note.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-[#151515] rounded-3xl p-6 border border-[#222222] shadow-2xl relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-[#0B0B0B] rounded-full text-[#A0A0A0] hover:text-white transition"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Avatar profile={profile} size={48} />
                <div>
                  <h3 className="font-bold text-white text-lg">Drop a Note</h3>
                  <p className="text-[#FF9D2E] text-xs font-bold uppercase tracking-wider">
                    Disappears in 24h
                  </p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full bg-[#0B0B0B] text-white border border-[#222222] rounded-2xl p-4 text-xl font-medium resize-none focus:outline-none focus:border-[#FF9D2E] transition-colors placeholder:text-[#A0A0A0]"
                  rows={4}
                  autoFocus
                />
                <div
                  className={`absolute bottom-3 right-3 text-sm font-bold ${isOverLimit ? "text-[#FF6B6B]" : "text-[#A0A0A0]"}`}
                >
                  {charsLeft}
                </div>
              </div>

              <Button
                  onClick={handleSubmit}
                  disabled={loading || !content.trim() || isOverLimit}
                  loading={loading}
                  className="w-full mt-4 h-12 bg-gradient-to-r from-[#FF9D2E] to-[#FF6B6B] text-white rounded-full font-bold flex items-center justify-center gap-2"
                  ariaLabel="Post note"
                >
                  {isOverLimit ? "Too long" : (<> <Send size={18} /> Post Note </>)}
                </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
