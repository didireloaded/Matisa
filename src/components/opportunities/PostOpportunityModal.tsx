import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (opp: any) => void;
}

export function PostOpportunityModal({ isOpen, onClose, onCreated }: Props) {
  const { profile } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Gig");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return toast.error("Please sign in");
    if (!title || !description) return toast.error("Please fill in title and description");

    setLoading(true);
    try {
      const newOpp = {
        creator_id: profile.id,
        title,
        description,
        type: type.toLowerCase(),
        role_type: type,
        location_name: location,
        budget_type: budget ? "paid" : "tbd",
        budget_amount: budget ? parseFloat(budget) : null,
      };

      const { data, error } = await supabase
        .from("opportunities")
        .insert(newOpp)
        .select("*, profiles!opportunities_creator_id_fkey(*)")
        .single();

      if (error) throw error;

      toast.success("Opportunity posted!");
      onCreated(data);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to post opportunity");
    } finally {
      setLoading(false);
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase size={24} className="text-[var(--color-primary)]" />
              Post Opportunity
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-3)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-[var(--color-text-muted)] mb-1 block">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Needed: Videographer for music video"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--color-text-muted)] mb-1 block">
                Type
              </label>
              <div className="flex gap-2">
                {["Gig", "Job", "Collaboration"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-colors ${type === t ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white" : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)]"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--color-text-muted)] mb-1 block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the role..."
                rows={4}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-primary)] resize-none"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-bold text-[var(--color-text-muted)] mb-1 block flex items-center gap-1">
                  <MapPin size={14} /> Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote"
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-bold text-[var(--color-text-muted)] mb-1 block flex items-center gap-1">
                  <DollarSign size={14} /> Budget
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={loading}
              className="mt-4 font-bold h-12"
            >
              {loading ? "Posting..." : "Post Opportunity"}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
