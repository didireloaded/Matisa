import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, TrendingUp, MapPin, Users } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { USERS } from "./data";

const TRENDING = [
  { tag: "#NamibiaRising", posts: "12.4K" },
  { tag: "#WindhoekNights", posts: "8.7K" },
  { tag: "#KatuturaStyle", posts: "5.2K" },
  { tag: "#AfrobeatsNAM", posts: "4.9K" },
  { tag: "#SossusRave2025", posts: "3.1K" },
  { tag: "#NamCulture", posts: "2.8K" },
];

export function ExplorePage() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = query
    ? USERS.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.username.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <div className="min-h-full pb-28">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-10 bg-[#0B0B0B]/80 backdrop-blur-xl">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search people, notes, events…"
            className="w-full bg-[#1a1a1a] text-white placeholder:text-white/30 rounded-2xl pl-10 pr-10 py-3 text-sm outline-none border border-white/5 focus:border-[#FF9D2E]/30 transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X size={14} className="text-white/40" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {query ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4"
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <Search size={32} className="mb-3 text-white/20" />
                <p className="text-white/40 text-sm">No results for "{query}"</p>
              </div>
            ) : (
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/30 mb-3">People</p>
                {filtered.map((u) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 py-3 border-b border-white/5"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={u.avatar}
                        alt={u.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm flex items-center gap-1">
                        {u.name}
                        {u.verified && <span className="text-[#FF9D2E] text-[10px]">✓</span>}
                      </div>
                      <div className="text-white/40 text-xs">
                        @{u.username} · {u.location}
                      </div>
                    </div>
                    <button className="px-4 py-1.5 rounded-full bg-[#FF9D2E]/10 text-[#FF9D2E] text-xs">
                      Follow
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="discover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Trending */}
            <div className="px-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-[#FF9D2E]" />
                <span className="text-[11px] uppercase tracking-widest text-white/40">
                  Trending in Namibia
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TRENDING.map((t, i) => (
                  <motion.button
                    key={t.tag}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#151515] border border-white/5 rounded-2xl p-3 text-left hover:border-[#FF9D2E]/20 transition"
                  >
                    <p className="text-white text-sm mb-1">{t.tag}</p>
                    <p className="text-white/40 text-xs">{t.posts} notes</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* People to follow */}
            <div className="px-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-[#A855F7]" />
                <span className="text-[11px] uppercase tracking-widest text-white/40">
                  Who to follow
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {USERS.slice(1).map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-[#151515] border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 flex-shrink-0 w-[140px]"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      <ImageWithFallback
                        src={u.avatar}
                        alt={u.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-white text-xs leading-tight">{u.name}</p>
                      <p className="text-white/40 text-[10px]">@{u.username}</p>
                    </div>
                    <div className="text-white/40 text-[10px] flex items-center gap-1">
                      <MapPin size={10} />
                      {u.location.split(",")[0]}
                    </div>
                    <button className="w-full py-1.5 rounded-full bg-gradient-to-r from-[#FF9D2E] to-[#FF6B35] text-black text-xs">
                      Follow
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Discovery grid */}
            <div className="px-4 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-widest text-white/40">
                  ✦ Discover
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  "https://images.unsplash.com/photo-1528508670332-4c687dae6295?w=300&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1606416132922-22ab37c1231e?w=300&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1689864727821-e47577e88226?w=300&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1488197047962-b48492212cda?w=300&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1770283553838-769c5f97d55c?w=300&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1731662784037-9b2f21819caa?w=300&h=300&fit=crop",
                ].map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`overflow-hidden rounded-lg ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                    style={{ aspectRatio: i === 0 ? "1" : "1" }}
                  >
                    <ImageWithFallback
                      src={src}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
