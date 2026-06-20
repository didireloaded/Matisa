import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, ChevronLeft, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/common/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import { AnalyticsAI } from "@/services/ai/AnalyticsAI";
import { PostOpportunityModal } from "@/components/opportunities/PostOpportunityModal";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";

export function Opportunities() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      AnalyticsAI.trackEvent(profile.id, "page_view", "opportunities");
    }
  }, [profile]);

  useEffect(() => {
    async function loadOpp() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("opportunities")
          .select("*, profiles(*)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setOpportunities(data || []);
      } catch (err) {
        console.error("Failed to load opportunities", err);
      } finally {
        setLoading(false);
      }
    }
    loadOpp();
  }, []);

  const handleApply = async (oppId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile) return toast.error("Please sign in to apply");
    try {
      const { error } = await supabase
        .from("opportunity_applications")
        .insert({ opportunity_id: oppId, applicant_id: profile.id, status: "pending" });
      if (error) {
        if (error.code === "23505") toast.success("You already applied!");
        else throw error;
      } else {
        toast.success("Application submitted!");
        AnalyticsAI.trackEvent(profile.id, "apply_opportunity", oppId);
      }
    } catch (err) {
      toast.error("Failed to apply");
    }
  };

  const filteredOpps =
    activeTab === "all"
      ? opportunities
      : opportunities.filter(
          (o) =>
            (o.type || o.role_needed).toLowerCase().includes(activeTab) ||
            (o.role_needed && o.role_needed.toLowerCase().includes(activeTab)),
        );

  return (
    <div className="flex flex-col min-h-[100dvh] pb-32 bg-[var(--color-background)]">
      {isPostModalOpen && (
        <PostOpportunityModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onCreated={(newOpp) => setOpportunities([newOpp, ...opportunities])}
        />
      )}
      {/* Header */}
      <header className="sticky top-0 z-30 px-5 pt-4 pb-2 bg-[var(--color-background)]/90 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-white hover:bg-[var(--color-surface-3)] transition"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">Opportunities</h1>
          </div>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_0_12px_rgba(139,92,246,0.3)] hover:scale-105 transition-transform"
          >
            <Briefcase size={18} />
          </button>
        </div>

        <Tabs
          variant="pill"
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "all", label: "For You" },
            { id: "gig", label: "Gigs" },
            { id: "collab", label: "Collabs" },
            { id: "job", label: "Jobs" },
          ]}
        />
      </header>

      {/* List */}
      <div className="p-5 flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
        ) : filteredOpps.length === 0 ? (
          <div className="mt-8">
            <PremiumEmptyState
              icon={Briefcase}
              title={activeTab === "all" ? "No Opportunities Yet" : `No ${activeTab}s found`}
              description="Be the first to post an opportunity for the Namibian creative community."
              glowColor="accent3"
              action={{
                label: "Post Opportunity",
                onClick: () => setIsPostModalOpen(true),
              }}
            />
          </div>
        ) : (
          filteredOpps.map((opp, i) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 25 }}
          >
            <Card variant="solid" className={`p-5 relative overflow-hidden`}>
              {/* Colored left border indicator based on type */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  opp.type === "Gig" || opp.role_needed === "Gig"
                    ? "bg-[#00E5FF]"
                    : opp.type === "Collaboration" || opp.role_needed === "Collaboration"
                      ? "bg-[#8B5CF6]"
                      : "bg-[#FF416C]"
                }`}
              />

              <div className="flex justify-between items-start mb-4 pl-2">
                <div className="flex gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      opp.type === "Gig" || opp.role_needed === "Gig"
                        ? "bg-[#00E5FF]/20 text-[#00E5FF]"
                        : opp.type === "Collaboration" || opp.role_needed === "Collaboration"
                          ? "bg-[#8B5CF6]/20 text-[#8B5CF6]"
                          : "bg-[#FF416C]/20 text-[#FF416C]"
                    }`}
                  >
                    {opp.type || opp.role_needed}
                  </span>
                </div>
                <button className="text-[var(--color-text-muted)] hover:text-white transition">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="pl-2">
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">{opp.title}</h3>

                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    size={24}
                    profile={{
                      id: opp.profiles?.id || "unknown",
                      display_name: opp.profiles?.display_name || opp.profiles?.username || "User",
                      avatar_url: opp.profiles?.avatar_url || "",
                    }}
                  />
                  <span className="text-sm font-semibold text-white/90">
                    {opp.profiles?.display_name || opp.profiles?.username || "User"}
                  </span>
                </div>

                <p className="text-[var(--color-text-muted)] text-sm mb-4 line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {(opp.required_skills || []).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs font-semibold px-2.5 py-1 bg-[var(--color-surface-3)] text-[var(--color-text-muted)] rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-lg">
                      {opp.budget || "Negotiable"}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {opp.location_name || opp.location || "Remote"}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="px-5 font-bold"
                    onClick={(e) => handleApply(opp.id, e)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default Opportunities;
