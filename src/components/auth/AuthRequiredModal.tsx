import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthRequiredModal({ open, onClose }: AuthRequiredModalProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm rounded-3xl bg-[var(--color-surface)] p-6 shadow-2xl border border-[var(--color-border)] text-center"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/50 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/20 mb-4">
              <UserPlus size={32} className="text-[var(--color-primary)]" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Sign up to interact</h2>
            <p className="text-white/60 text-sm mb-6">
              Create an account or log in to like, comment, follow, and join the conversation.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onClose();
                  navigate("/auth");
                }}
                className="w-full rounded-full bg-[var(--color-primary)] py-3 font-semibold text-white transition hover:bg-opacity-90 shadow-[0_0_15px_rgba(255,157,46,0.4)]"
              >
                Go to Login
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-full py-3 font-semibold text-white/60 hover:text-white transition hover:bg-white/5"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
