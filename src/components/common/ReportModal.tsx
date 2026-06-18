import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "user" | "post" | "room" | "event";
}

export function ReportModal({ isOpen, onClose, targetId, targetType }: ReportModalProps) {
  const [step, setStep] = useState<"reason" | "action" | "done">("reason");

  const REASONS = [
    "Inappropriate content",
    "Harassment or bullying",
    "Spam or scam",
    "Underage user",
    "Other",
  ];

  const handleReport = () => {
    // API Call goes here
    toast.success("Report submitted securely.");
    setStep("action");
  };

  const handleBlock = () => {
    toast.success("User blocked. You won't see them again.");
    setStep("done");
  };

  const handleMute = () => {
    toast.success("User muted.");
    setStep("done");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          className="bg-[#151515] border border-white/10 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
          >
            <X size={16} />
          </button>

          {step === "reason" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Report {targetType}</h3>
                  <p className="text-xs text-white/50">Your report is anonymous</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={handleReport}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "action" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#FF9D2E]/20 text-[#FF9D2E] flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Report Sent</h3>
              <p className="text-sm text-white/50 mb-8">
                Do you want to block or mute this account to prevent further interaction?
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleBlock}
                  className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold transition"
                >
                  Block Account
                </button>
                <button
                  onClick={handleMute}
                  className="w-full py-3 rounded-xl bg-white/5 text-white/80 hover:bg-white/10 font-bold transition"
                >
                  Mute Account
                </button>
                <button
                  onClick={() => setStep("done")}
                  className="w-full py-3 text-white/50 text-sm hover:text-white transition"
                >
                  No, I'm good
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Protected</h3>
              <p className="text-sm text-white/50 mb-8">We've updated your preferences.</p>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
