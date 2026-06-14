import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Plus, Play, Zap, Award, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

// Vibrant color palette matching the reference
const COLORS = [
  "bg-[#DEB887]", // Tan
  "bg-[#DDA0DD]", // Plum/Pink
  "bg-[#8FBC8F]", // Sage Green
  "bg-[#DAA520]", // Goldenrod
  "bg-[#CD5C5C]", // Indian Red
  "bg-[#4682B4]", // Steel Blue
];

interface Creator extends Profile {
  color: string;
  large: boolean;
}

export function Creators() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreators() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("followers_count", { ascending: false })
          .limit(10);

        if (error) throw error;

        const formattedCreators = data.map((profile, i) => ({
          ...profile,
          color: COLORS[i % COLORS.length],
          large: i === 0, // Make the first one large like the reference
        }));

        setCreators(formattedCreators);
      } catch (err) {
        console.error("Error fetching creators:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCreators();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#1A181C] text-white relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between p-6 z-10">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center transform rotate-45 shadow-lg">
          <div className="w-4 h-4 bg-black rounded-sm transform -rotate-45" />
        </div>

        <div className="flex items-center gap-4">
          <button className="text-white/70 hover:text-white">
            <Search className="w-6 h-6" />
          </button>
          <button className="relative text-white/70 hover:text-white">
            <Bell className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF416C] rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-[#1A181C]">
              9
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/50" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {creators.map((creator, i) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/profile/${creator.id}`)}
                className={`relative rounded-[32px] p-6 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  creator.color
                } ${creator.large ? "col-span-2 aspect-[2/1.2]" : "col-span-1 aspect-[4/5]"}`}
              >
                {/* Subtle wavy background overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    <path
                      d="M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="0.5"
                    />
                    <path
                      d="M0,70 Q30,90 60,70 T100,70 L100,100 L0,100 Z"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="0.3"
                    />
                  </svg>
                </div>

                <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md p-1 border border-white/30">
                  <img
                    src={
                      creator.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`
                    }
                    alt={creator.display_name || creator.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                <div className="relative z-10 mt-auto">
                  <h3
                    className={`font-bold text-white leading-tight ${creator.large ? "text-3xl" : "text-xl"}`}
                  >
                    {(creator.display_name || creator.username).split(" ").map((n, idx) => (
                      <span key={idx}>
                        {n}
                        <br />
                      </span>
                    ))}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-white/80 text-sm font-medium">
                    <UsersIcon />
                    {(creator.followers_count ?? 0) >= 1000000
                      ? `${((creator.followers_count ?? 0) / 1000000).toFixed(1)}M`
                      : (creator.followers_count ?? 0) >= 1000
                        ? `${((creator.followers_count ?? 0) / 1000).toFixed(1)}K`
                        : (creator.followers_count ?? 0)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Right Actions */}
      <div className="absolute bottom-32 right-6 flex flex-col gap-3 z-20">
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:scale-105 transition-transform">
          <Play className="w-5 h-5 fill-current ml-1" />
        </button>
        <button className="w-12 h-12 bg-[#2A2A2A] border border-white/10 rounded-full flex items-center justify-center text-white relative shadow-lg hover:bg-[#3A3A3A] transition-colors">
          <Zap className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF9D2E] rounded-full text-[9px] font-bold text-black flex items-center justify-center border-2 border-[#1A181C]">
            2
          </div>
        </button>
        <button className="w-12 h-12 bg-[#2A2A2A] border border-white/10 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#3A3A3A] transition-colors">
          <Award className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF416C] shadow-lg cursor-pointer">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=you"
            alt="You"
            className="w-full h-full object-cover bg-black"
          />
        </div>
      </div>

      {/* Bottom Floating Nav mimicking reference */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-6">
          <button className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF416C] to-[#8E2DE2] flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-4 text-white/50 text-sm font-medium">
            <button className="hover:text-white transition-colors">Dares</button>
            <button className="text-white relative">
              Trend Creators
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}
