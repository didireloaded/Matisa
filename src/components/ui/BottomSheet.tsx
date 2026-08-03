import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[120] flex flex-col bg-[var(--color-surface)] rounded-t-[32px] border-t border-[var(--color-border)] shadow-2xl max-h-[calc(100dvh-12px)] overflow-y-auto overscroll-contain pb-[calc(24px+env(safe-area-inset-bottom))]"
      >
        {/* Drag Handle */}
        <div className="w-full flex justify-center py-3">
          <div className="w-12 h-1.5 rounded-full bg-[var(--color-border-hover)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-2">
          <h2 className="text-xl font-bold font-display text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-[var(--color-text-muted)] hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 overflow-y-auto no-scrollbar">{children}</div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
