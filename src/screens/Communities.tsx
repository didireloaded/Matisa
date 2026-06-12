import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Search, Users, Hash, Plus } from "lucide-react";
import { COMMUNITIES, fmt } from "../data/mock";

const T = {
  bg: "#0F0D0B",
  surface: "#1C1814",
  s2: "#221D18",
  border: "#2E2822",
  text: "#F5F0EA",
  muted: "#8A7F74",
  primary: "#C8521A",
  sand: "#E8A055",
  sky: "#2D7DD2",
  success: "#4CAF7D",
};

export function Communities() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const joinedCommunities = COMMUNITIES.filter((c) => c.joined);
  const discoverCommunities = COMMUNITIES.filter((c) => !c.joined);

  // Simple hash for gradient colors based on name
  const getGradient = (name: string) => {
    const colors = [
      `from-[${T.primary}] to-[${T.sand}]`,
      `from-[${T.sky}] to-[${T.primary}]`,
      `from-[${T.success}] to-[${T.sky}]`,
      `from-[${T.sand}] to-[${T.success}]`,
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: T.bg, color: T.text }}>
      {/* HEADER */}
      <div
        className="sticky top-0 z-10 px-4 pt-6 pb-4 flex items-center justify-between"
        style={{ backgroundColor: T.bg }}
      >
        <h1 className="text-2xl font-display font-bold tracking-tight">Communities</h1>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
          style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
        >
          <Plus size={20} color={T.text} />
        </button>
      </div>

      <div className="px-4 space-y-8">
        {/* SEARCH BAR */}
        <div
          className="flex items-center px-4 py-3 rounded-full"
          style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
        >
          <Search size={18} color={T.muted} className="mr-3" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-base placeholder-muted"
            style={{ color: T.text }}
          />
        </div>

        {/* YOUR COMMUNITIES */}
        {joinedCommunities.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 px-1">Your Communities</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
              {joinedCommunities.map((c) => {
                const gradient = getGradient(c.name);
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/community/${c.id}`)}
                    className="flex-shrink-0 w-40 rounded-2xl overflow-hidden snap-start relative active:scale-95 transition-transform"
                    style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
                  >
                    {/* Gradient Banner */}
                    <div className={`h-16 bg-gradient-to-br opacity-80 ${gradient}`} />

                    {/* Content */}
                    <div className="p-3 pt-0 relative flex flex-col items-center">
                      {/* Avatar Overlap */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center -mt-6 mb-2 shadow-lg"
                        style={{ backgroundColor: T.s2, border: `2px solid ${T.surface}` }}
                      >
                        <Hash size={20} color={T.primary} />
                      </div>

                      <h3 className="font-bold text-center text-sm mb-1 line-clamp-1">{c.name}</h3>

                      {c.today_posts > 0 ? (
                        <div className="text-xs font-medium" style={{ color: T.sand }}>
                          {c.today_posts} posts today
                        </div>
                      ) : (
                        <div className="text-xs" style={{ color: T.muted }}>
                          Quiet today
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DISCOVER */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold">Discover</h2>
          </div>

          <div className="flex flex-col gap-3">
            {discoverCommunities.map((c) => {
              const gradient = getGradient(c.name);
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/community/${c.id}`)}
                  className="flex p-3 rounded-2xl active:scale-[0.98] transition-transform"
                  style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
                >
                  {/* Left: Gradient Square */}
                  <div
                    className={`w-16 h-16 rounded-xl flex-shrink-0 bg-gradient-to-br flex items-center justify-center ${gradient}`}
                  >
                    <Users size={24} color="#FFF" className="opacity-80" />
                  </div>

                  {/* Right: Info */}
                  <div className="ml-4 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-base leading-tight">{c.name}</h3>
                      <button
                        className="px-3 py-1 rounded-full text-xs font-bold transition-opacity"
                        style={{ backgroundColor: T.primary, color: T.text }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle join logic here
                        }}
                      >
                        Join
                      </button>
                    </div>

                    <p className="text-xs line-clamp-1 mb-2" style={{ color: T.muted }}>
                      {c.description}
                    </p>

                    <div
                      className="flex items-center gap-3 text-[11px] font-medium"
                      style={{ color: T.muted }}
                    >
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {fmt(c.member_count)} members
                      </span>
                      <span className="flex items-center gap-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: T.success }}
                        />
                        {fmt(c.active_users)} active
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
