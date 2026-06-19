import { useState } from "react";
import {
  Play,
  Heart,
  Share2,
  MoreHorizontal,
  Shuffle,
  SkipBack,
  SkipForward,
  Repeat,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/input";

const DUMMY_TRACKS = [
  {
    id: "1",
    title: "Midnight City",
    artist: "M83",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
    duration: "4:03",
  },
  {
    id: "2",
    title: "Starboy",
    artist: "The Weeknd",
    cover: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?w=300&h=300&fit=crop",
    duration: "3:50",
  },
  {
    id: "3",
    title: "Blinding Lights",
    artist: "The Weeknd",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop",
    duration: "3:20",
  },
];

export function Music() {
  const [activeTab, setActiveTab] = useState("for_you");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-background)] pb-40">
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-white text-3xl font-display font-bold tracking-tight">Music</h1>
      </div>

      <div className="px-5 mb-4">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tracks, artists..."
          icon={<Search size={18} />}
          className="h-12 rounded-full border-none bg-[var(--color-surface-2)]"
        />
      </div>

      <div className="px-5 mb-6">
        <Tabs
          variant="pill"
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "for_you", label: "For You" },
            { id: "trending", label: "Trending" },
            { id: "playlists", label: "Playlists" },
          ]}
        />
      </div>

      <div className="flex-1 px-5 space-y-8">
        {/* Featured Albums Carousel */}
        <div>
          <h2 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Featured Albums
          </h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[160px] shrink-0 group cursor-pointer">
                <div className="relative w-full aspect-square rounded-[20px] overflow-hidden mb-3">
                  <img
                    src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=300&h=300&fit=crop`}
                    alt={`Album ${i}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-xl">
                      <Play fill="currentColor" size={20} className="ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-bold text-sm truncate">Neon Dreams {i}</h3>
                <p className="text-[var(--color-text-muted)] text-xs truncate mt-0.5">
                  Various Artists
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Track List */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Top Tracks
            </h2>
          </div>

          <div className="space-y-1">
            {DUMMY_TRACKS.map((track, i) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-2 rounded-xl hover:bg-[var(--color-surface-2)] transition cursor-pointer group"
              >
                <span className="text-[var(--color-text-muted)] text-xs font-bold w-4 text-right">
                  {i + 1}
                </span>
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play fill="white" size={16} className="text-white ml-0.5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-sm truncate">{track.title}</h4>
                  <p className="text-[var(--color-text-muted)] text-xs truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-4 text-[var(--color-text-muted)]">
                  <button className="hover:text-white transition opacity-0 group-hover:opacity-100">
                    <Heart size={16} />
                  </button>
                  <span className="text-xs font-medium">{track.duration}</span>
                  <button className="hover:text-white transition">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Mini Player */}
      <div className="fixed bottom-[88px] left-4 right-4 z-40">
        <div className="bg-[var(--color-surface-2)]/95 backdrop-blur-xl border border-[var(--color-border)] rounded-full p-2 pr-4 flex items-center gap-3 shadow-2xl">
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 relative animate-[spin_10s_linear_infinite]">
            <img
              src={DUMMY_TRACKS[0].cover}
              alt="Now Playing"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full border border-[var(--color-surface-2)]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-white font-bold text-sm truncate">{DUMMY_TRACKS[0].title}</h4>
              <span className="w-1 h-1 rounded-full bg-[var(--color-primary)] animate-pulse" />
            </div>
            <p className="text-[var(--color-text-muted)] text-xs truncate">
              {DUMMY_TRACKS[0].artist}
            </p>
          </div>
          <div className="flex items-center gap-3 text-white">
            <button className="hover:text-[var(--color-primary)] transition">
              <Heart size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition">
              <Play fill="currentColor" size={18} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Music;
