import { useState } from "react";
import { X, Gem, Heart, Star, Sparkles, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/Avatar";
import type { UserProfile } from "@/types";

interface GiftingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: UserProfile;
  onSendGift: (gift: GiftItem) => void;
  balance: number;
}

export interface GiftItem {
  id: string;
  name: string;
  cost: number;
  icon: React.ElementType;
  color: string;
  bgGlow: string;
}

const GIFTS: GiftItem[] = [
  { id: "rose", name: "Rose", cost: 10, icon: Heart, color: "text-rose-500", bgGlow: "shadow-[0_0_15px_rgba(244,63,94,0.4)]" },
  { id: "star", name: "Star", cost: 50, icon: Star, color: "text-yellow-400", bgGlow: "shadow-[0_0_15px_rgba(250,204,21,0.4)]" },
  { id: "diamond", name: "Diamond", cost: 100, icon: Gem, color: "text-cyan-400", bgGlow: "shadow-[0_0_15px_rgba(34,211,238,0.4)]" },
  { id: "crown", name: "Crown", cost: 500, icon: Sparkles, color: "text-amber-500", bgGlow: "shadow-[0_0_15px_rgba(245,158,11,0.4)]" },
  { id: "rocket", name: "Rocket", cost: 1000, icon: Sparkles, color: "text-purple-500", bgGlow: "shadow-[0_0_15px_rgba(168,85,247,0.4)]" },
  { id: "matisa_box", name: "Matisa Box", cost: 5000, icon: Gift, color: "text-[var(--color-primary)]", bgGlow: "shadow-[0_0_15px_rgba(255,157,46,0.5)]" },
];

export function GiftingModal({ isOpen, onClose, recipient, onSendGift, balance }: GiftingModalProps) {
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);

  if (!isOpen) return null;

  const handleSend = () => {
    if (selectedGift) {
      if (balance >= selectedGift.cost) {
        onSendGift(selectedGift);
        setSelectedGift(null);
        onClose();
      } else {
        // Here we'd typically trigger a top-up modal or navigation
        alert("Insufficient balance. Top up in Wallet.");
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full sm:max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-[32px] sm:rounded-[24px] p-6 pb-safe relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Gift size={24} className="text-[var(--color-primary)]" />
              Send Gift
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-3)] transition-colors"
              aria-label="Close Gifting Modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-4 bg-[var(--color-surface-2)] rounded-2xl mb-6">
            <Avatar size={48} profile={recipient} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5">Sending to</p>
              <h3 className="text-white font-bold text-base truncate">{recipient.display_name}</h3>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[13px] text-[var(--color-text-muted)] font-medium mb-0.5">Balance</p>
              <div className="flex items-center gap-1">
                <Gem size={14} className="text-[var(--color-primary)]" />
                <span className="text-white font-bold text-base">{balance}</span>
              </div>
            </div>
          </div>

          {/* Gift Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {GIFTS.map((gift) => {
              const isSelected = selectedGift?.id === gift.id;
              const canAfford = balance >= gift.cost;
              const Icon = gift.icon;

              return (
                <button
                  key={gift.id}
                  onClick={() => setSelectedGift(gift)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? `border-[var(--color-primary)] bg-[var(--color-primary)]/10 ${gift.bgGlow} scale-105`
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-white/20 hover:bg-[var(--color-surface-3)]"
                  } ${!canAfford && !isSelected ? "opacity-50" : ""}`}
                  aria-label={`Select ${gift.name} gift costing ${gift.cost} coins`}
                >
                  <Icon size={32} className={`mb-2 ${gift.color}`} strokeWidth={1.5} />
                  <span className={`text-[13px] font-bold ${isSelected ? "text-white" : "text-white/80"}`}>
                    {gift.name}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <Gem size={10} className={canAfford ? "text-[var(--color-primary)]" : "text-white/40"} />
                    <span className={`text-[11px] font-bold ${canAfford ? "text-white/60" : "text-white/40"}`}>
                      {gift.cost}
                    </span>
                  </div>
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div 
                      layoutId="gift-outline"
                      className="absolute inset-0 border-2 border-[var(--color-primary)] rounded-2xl"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Footer */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            disabled={!selectedGift}
            onClick={handleSend}
            className="h-14 text-[17px] font-bold shadow-[0_0_20px_rgba(255,157,46,0.3)]"
          >
            {selectedGift ? (
              balance >= selectedGift.cost ? (
                <>Send {selectedGift.name}</>
              ) : (
                <>Top Up to Send</>
              )
            ) : (
              "Select a Gift"
            )}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
