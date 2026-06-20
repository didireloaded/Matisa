import { useState, useEffect } from "react";
import { ArrowLeft, Gem, CreditCard, History, ChevronRight, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function Wallet() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"topup" | "history">("topup");

  useEffect(() => {
    if (!profile) return;
    async function loadWallet() {
      const { data } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", profile!.id)
        .single();
      if (data) setBalance(data.balance);

      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .or(`sender_id.eq.${profile!.id},receiver_id.eq.${profile!.id}`)
        .order("created_at", { ascending: false });
      if (txs) setTransactions(txs);
    }
    loadWallet();
  }, [profile]);

  const PACKAGES = [
    { coins: 100, price: "$0.99", bonus: 0 },
    { coins: 500, price: "$4.99", bonus: 50 },
    { coins: 1000, price: "$9.99", bonus: 150 },
    { coins: 5000, price: "$49.99", bonus: 1000 },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--color-background)]">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center px-4 h-16 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-xl">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-white hover:bg-[var(--color-surface-3)] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg text-white mr-10">Wallet</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-safe">
        {/* Balance Card */}
        <div className="p-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative overflow-hidden rounded-[24px] p-8 text-center bg-gradient-to-br from-[#FF416C] to-[#8E2DE2] shadow-[0_10px_40px_rgba(142,45,226,0.3)]"
          >
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-white/80 font-medium tracking-wide uppercase text-sm mb-2">
                Available Balance
              </span>
              <div className="flex items-center justify-center gap-2">
                <Gem size={40} className="text-white drop-shadow-md" strokeWidth={1.5} />
                <span className="text-5xl font-black text-white tracking-tight">
                  {balance.toLocaleString()}
                </span>
              </div>
              {balance === 0 && (
                <p className="text-white/60 text-xs mt-3 font-medium">
                  Top up to start gifting your favorite creators ✨
                </p>
              )}
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab("topup")}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "topup"
                ? "border-[var(--color-primary)] text-white"
                : "border-transparent text-[var(--color-text-muted)]"
            }`}
          >
            Top Up
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-[var(--color-primary)] text-white"
                : "border-transparent text-[var(--color-text-muted)]"
            }`}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === "topup" ? (
              <motion.div
                key="topup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="text-[var(--color-primary)]" size={20} />
                  <h2 className="text-white font-bold text-lg">Select Package</h2>
                </div>

                {PACKAGES.map((pkg, i) => (
                  <button
                    key={i}
                    onClick={() => alert("Payment gateway integration coming soon")}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] hover:border-white/20 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <Gem className="text-[var(--color-primary)]" size={24} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-white font-bold text-lg">{pkg.coins} Coins</span>
                        {pkg.bonus > 0 && (
                          <span className="text-xs font-bold text-[#32CD32] uppercase tracking-wider">
                            +{pkg.bonus} Bonus
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="primary" size="sm" className="pointer-events-none font-bold">
                      {pkg.price}
                    </Button>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {transactions.length === 0 ? (
                  <PremiumEmptyState
                    icon={History}
                    title="No Transactions Yet"
                    description="Your gifting and top-up history will appear here."
                    action={{ label: "Get Coins", onClick: () => setActiveTab("topup") }}
                    glowColor="secondary"
                  />
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => {
                      const isSender = tx.sender_id === profile?.id;
                      const sign = isSender ? "-" : "+";
                      const color = isSender ? "text-red-400" : "text-green-400";
                      const label =
                        tx.type === "gift" ? (isSender ? "Sent Gift" : "Received Gift") : "Top Up";

                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-4 bg-[var(--color-surface-2)] rounded-2xl border border-[var(--color-border)]"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5`}
                            >
                              {tx.type === "gift" ? (
                                <Gift size={18} className="text-[var(--color-primary)]" />
                              ) : (
                                <CreditCard size={18} className="text-[var(--color-primary)]" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white font-bold text-sm">{label}</span>
                              <span className="text-xs text-[var(--color-text-muted)] font-medium">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <span className={`font-bold text-base ${color}`}>
                            {sign}
                            {tx.amount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Wallet;
