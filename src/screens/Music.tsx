import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Play, Music2, Headphones, Mic, Heart, ChevronRight } from "lucide-react";
import { PLAYLISTS, REGIONAL_CHARTS, NEW_RELEASES, FEATURED_ARTISTS, LISTENING_SESSIONS, getProfile, fmt } from "../data/mock";

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
  success: "#4CAF7D" 
};

export function Music() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Charts");
  const tabs = ["Charts", "Playlists", "Karaoke"];

  return (
    <div className="min-h-screen pb-20 text-[15px]" style={{ backgroundColor: T.bg, color: T.text }}>
      <header className="px-4 pt-12 pb-4 sticky top-0 z-10 backdrop-blur-md" style={{ backgroundColor: `${T.bg}E6` }}>
        <h1 className="font-display text-2xl font-bold mb-4">Music</h1>
        <div className="flex gap-4 border-b" style={{ borderColor: T.border }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium transition-colors ${
                activeTab === tab ? "border-b-2" : "opacity-60"
              }`}
              style={{
                borderColor: activeTab === tab ? T.primary : "transparent",
                color: activeTab === tab ? T.primary : T.text,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-8">
        {activeTab === "Charts" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Top Namibia */}
            <section>
              <h2 className="font-display text-xl font-bold mb-4">Top Namibia</h2>
              <div className="space-y-3">
                {REGIONAL_CHARTS.Namibia.map((song) => (
                  <div key={song.rank} className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: T.surface }}>
                    <div className="font-display font-bold text-lg w-6 text-center" style={{ color: T.primary }}>
                      {song.rank}
                    </div>
                    <div className="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ background: song.gradient }}>
                      <Music2 size={20} className="text-white opacity-80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="text-sm truncate" style={{ color: T.muted }}>{song.artist}</div>
                    </div>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: T.s2 }}>
                      <Play size={14} className="ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Regional Charts */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold">Regional Charts</h2>
                <ChevronRight size={20} style={{ color: T.muted }} />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {(Object.keys(REGIONAL_CHARTS) as Array<keyof typeof REGIONAL_CHARTS>)
                  .filter((k) => k !== "Namibia")
                  .map((region) => {
                    const topSong = REGIONAL_CHARTS[region][0];
                    return (
                      <div
                        key={region}
                        className="snap-start shrink-0 w-48 rounded-xl p-4 flex flex-col justify-end relative overflow-hidden"
                        style={{ height: 160, background: topSong.gradient }}
                      >
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="relative z-10">
                          <h3 className="font-display font-bold text-lg text-white mb-1">{region} Top 50</h3>
                          <div className="text-sm text-white/80 line-clamp-1">
                            1. {topSong.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>

            {/* New Releases */}
            <section>
              <h2 className="font-display text-xl font-bold mb-4">New Releases</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {NEW_RELEASES.map((release) => (
                  <div key={release.id} className="snap-start shrink-0 w-32 group cursor-pointer">
                    <div
                      className="w-32 h-32 rounded-xl mb-2 flex items-center justify-center"
                      style={{ background: release.gradient }}
                    >
                      <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="font-medium text-sm line-clamp-2 leading-tight">
                      {release.title}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Artists */}
            <section>
              <h2 className="font-display text-xl font-bold mb-4">Featured Artists</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {FEATURED_ARTISTS.map((artist) => (
                  <div key={artist.id} className="snap-start shrink-0 flex flex-col items-center gap-2 w-24">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ background: artist.image }}
                    >
                      <Mic size={24} className="text-white/80" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm truncate w-24">{artist.name}</div>
                      <div className="text-xs truncate w-24" style={{ color: T.muted }}>{artist.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "Playlists" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Playlist of the Week */}
            <section>
              <h2 className="font-display text-xl font-bold mb-4">Playlist of the Week</h2>
              <div
                className="rounded-2xl p-6 flex flex-col justify-end relative overflow-hidden"
                style={{ height: 240, background: PLAYLISTS[0].gradient }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="relative z-10 flex items-end justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                      Featured
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white mb-1">
                      {PLAYLISTS[0].title}
                    </h3>
                    <div className="text-white/80 text-sm mb-3">
                      {PLAYLISTS[0].description}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <span>{PLAYLISTS[0].track_count} tracks</span>
                      <span>•</span>
                      <span>{fmt(PLAYLISTS[0].votes || 0)} saves</span>
                      <span>•</span>
                      <span>{new Date(PLAYLISTS[0].created_at || '').getFullYear()}</span>
                    </div>
                  </div>
                  <button className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white text-black shadow-lg">
                    <Play size={20} className="ml-1" fill="currentColor" />
                  </button>
                </div>
              </div>
            </section>

            {/* Listening Sessions */}
            <section>
              <h2 className="font-display text-xl font-bold mb-4">Listening Sessions</h2>
              <div className="space-y-3">
                {LISTENING_SESSIONS.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 rounded-xl relative overflow-hidden"
                    style={{ backgroundColor: T.surface }}
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-1 opacity-20"
                      style={{ background: session.gradient }}
                    />
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: session.gradient }}
                    >
                      <Mic size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{session.title}</div>
                      <div className="text-sm truncate flex items-center gap-2" style={{ color: T.muted }}>
                        <span>Hosted by {session.host}</span>
                        <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                        <span className="flex items-center gap-1" style={{ color: T.primary }}>
                          <Headphones size={12} />
                          {session.listeners}
                        </span>
                      </div>
                    </div>
                    <button
                      className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                      style={{ backgroundColor: `${T.primary}20`, color: T.primary }}
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Community Playlists */}
            <section>
              <h2 className="font-display text-xl font-bold mb-4">Community Playlists</h2>
              <div className="grid grid-cols-2 gap-4">
                {PLAYLISTS.slice(1).map((playlist) => (
                  <div key={playlist.id} className="group cursor-pointer">
                    <div
                      className="aspect-square rounded-xl mb-3 flex items-center justify-center relative overflow-hidden"
                      style={{ background: playlist.gradient }}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <Play size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity absolute" />
                    </div>
                    <div className="font-medium text-sm truncate">{playlist.title}</div>
                    <div className="text-xs flex items-center gap-3 mt-1" style={{ color: T.muted }}>
                      <span>{playlist.track_count} tracks</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "Karaoke" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl font-bold">Active Karaoke Rooms</h2>
            </div>
            <div className="space-y-4">
              {LISTENING_SESSIONS.map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl border backdrop-blur-md relative overflow-hidden"
                  style={{ 
                    backgroundColor: `${T.surface}80`, 
                    borderColor: `${T.border}80` 
                  }}
                >
                  <div
                    className="absolute top-0 left-0 w-1 h-full opacity-50"
                    style={{ background: session.gradient }}
                  />
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: session.gradient }}
                    >
                      <Mic size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg truncate mb-1">{session.title}</div>
                      <div className="text-sm truncate flex items-center gap-2" style={{ color: T.muted }}>
                        <span>Host: {session.host}</span>
                        <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                        <span className="flex items-center gap-1" style={{ color: T.primary }}>
                          <Headphones size={12} />
                          {session.listeners}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/room/${session.id}`)}
                    className="w-full mt-4 py-3 rounded-xl font-bold transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ backgroundColor: T.primary, color: "#fff" }}
                  >
                    Join Room
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
