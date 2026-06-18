import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, ChevronLeft, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/common/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";

const DUMMY_OPPORTUNITIES = [
  {
    id: "opp_1",
    creator: { id: "user_2", name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=user_2" },
    type: "Gig",
    role: "Videographer",
    description:
      "Shooting a music video this weekend. Need someone with a drone for aerial shots over the beach.",
    budget: "$500 - $1,000",
    location: "Los Angeles, CA",
    date: "This Saturday",
    tags: ["Music Video", "Drone", "Camera Operator"],
    matchScore: 92,
  },
  {
    id: "opp_2",
    creator: { id: "user_3", name: "Marcus Johnson", avatar: "https://i.pravatar.cc/150?u=user_3" },
    type: "Collaboration",
    role: "Vocalist / Singer",
    description:
      "Looking for a soulful R&B vocalist to feature on my new track. I have the beat and lyrics ready.",
    budget: "Revenue Split",
    location: "Remote",
    date: "Flexible",
    tags: ["R&B", "Feature", "Vocals"],
    matchScore: 85,
  },
  {
    id: "opp_3",
    creator: {
      id: "user_4",
      name: "Elena Rodriguez",
      avatar: "https://i.pravatar.cc/150?u=user_4",
    },
    type: "Job",
    role: "Video Editor",
    description:
      "Need a fast-paced editor for a 3-part YouTube documentary series. Premiere Pro required.",
    budget: "$3,000 Total",
    location: "Remote",
    date: "Next 2 Weeks",
    tags: ["Editing", "Documentary", "YouTube"],
    matchScore: 78,
  },
];

export function Opportunities() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const filteredOpps =
    activeTab === "all"
      ? DUMMY_OPPORTUNITIES
      : DUMMY_OPPORTUNITIES.filter((o) => o.type.toLowerCase().includes(activeTab));

  return (
    <div className="flex flex-col min-h-[100dvh] pb-32 bg-[var(--color-background)]">
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
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]">
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
        {filteredOpps.map((opp, i) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card variant="solid" className={`p-5 relative overflow-hidden`}>
              {/* Colored left border indicator based on type */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  opp.type === "Gig"
                    ? "bg-[#00E5FF]"
                    : opp.type === "Collaboration"
                      ? "bg-[#8B5CF6]"
                      : "bg-[#FF416C]"
                }`}
              />

              <div className="flex justify-between items-start mb-4 pl-2">
                <div className="flex gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      opp.type === "Gig"
                        ? "bg-[#00E5FF]/20 text-[#00E5FF]"
                        : opp.type === "Collaboration"
                          ? "bg-[#8B5CF6]/20 text-[#8B5CF6]"
                          : "bg-[#FF416C]/20 text-[#FF416C]"
                    }`}
                  >
                    {opp.type}
                  </span>
                  {opp.matchScore > 90 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                      Top Match
                    </span>
                  )}
                </div>
                <button className="text-[var(--color-text-muted)] hover:text-white transition">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="pl-2">
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">{opp.role}</h3>

                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    size={24}
                    profile={{
                      id: opp.creator.id,
                      display_name: opp.creator.name,
                      avatar_url: opp.creator.avatar,
                    }}
                  />
                  <span className="text-sm font-semibold text-white/90">{opp.creator.name}</span>
                </div>

                <p className="text-[var(--color-text-muted)] text-sm mb-4 line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {opp.tags.map((tag) => (
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
                    <span className="text-white font-bold text-lg">{opp.budget}</span>
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {opp.location}
                    </span>
                  </div>
                  <Button variant="primary" size="sm" className="px-5 font-bold">
                    Apply
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Opportunities;
