import { useState, useEffect } from "react";
import { Music2, Play, Search, Disc, Heart } from "lucide-react";
import { Skeleton, Avatar } from "@/components/common";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { CreatePlaylistModal } from "@/components/music/CreatePlaylistModal";

export function Music() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [myPlaylists, setMyPlaylists] = useState<any[]>([]);

  const fetchMusic = async () => {
    if (!profile) return;

    // Fetch Trending Playlists (ordered by vote count, we do a join)
    // Since supabase doesn't have a direct order by count without a view, we fetch all and sort
    const { data: trending } = await supabase
      .from("playlists")
      .select("*, profiles(*), playlist_votes(user_id)");

    if (trending) {
      const withVotes = trending
        .map((p) => ({
          ...p,
          voteCount: p.playlist_votes?.length || 0,
          hasVoted: p.playlist_votes?.some((v: any) => v.user_id === profile.id),
        }))
        .sort((a, b) => b.voteCount - a.voteCount);

      setPlaylists(withVotes);
      setMyPlaylists(withVotes.filter((p) => p.author_id === profile.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMusic();
  }, [profile]);

  const handleVote = async (playlistId: string, hasVoted: boolean) => {
    if (!profile) return;

    // Optimistic UI update
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, hasVoted: !hasVoted, voteCount: p.voteCount + (hasVoted ? -1 : 1) };
        }
        return p;
      }),
    );

    if (hasVoted) {
      await supabase
        .from("playlist_votes")
        .delete()
        .match({ playlist_id: playlistId, user_id: profile.id });
    } else {
      await supabase
        .from("playlist_votes")
        .insert({ playlist_id: playlistId, user_id: profile.id });
    }
  };

  return (
    <div className="pb-32 bg-background min-h-screen text-foreground relative">
      {/* Decorative Blur Gradients for Apple Music / Spotify Premium vibe */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/10 blur-[120px]" />
        <div className="absolute top-[20%] left-[-20%] w-[70vw] h-[70vw] rounded-full bg-accent1/5 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 px-6 pt-14 pb-4 bg-background/80 backdrop-blur-xl border-b border-border">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center shadow-lg shadow-secondary/20">
            <Music2 size={20} className="text-white" />
          </div>
          Leaderboards
        </h1>
        <div className="mt-6 flex h-12 items-center rounded-2xl bg-card/50 border border-border px-4 focus-within:border-primary/50 transition-colors backdrop-blur-sm">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search playlists, artists, tracks..."
            className="w-full bg-transparent px-3 text-sm text-foreground font-medium outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      <main className="px-6 py-8 space-y-12 relative z-10">
        <section>
          <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">Trending Now</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-full rounded-2xl bg-card/50 border border-border"
                />
              ))}
            </div>
          ) : playlists.length > 0 ? (
            <div className="space-y-4">
              {playlists.map((playlist, idx) => (
                <div
                  key={playlist.id}
                  className="flex items-center gap-4 rounded-3xl border border-border bg-card/60 backdrop-blur-md p-4 transition hover:bg-accent/50 group cursor-pointer"
                >
                  <div className="w-6 text-center font-bold text-muted-foreground text-lg group-hover:text-primary transition-colors">
                    {idx + 1}
                  </div>
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-background overflow-hidden border border-border shadow-md">
                    {playlist.cover_url ? (
                      <img src={playlist.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Disc size={24} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-foreground truncate">
                      {playlist.title}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium truncate flex items-center gap-1 mt-1">
                      Created by {playlist.profiles?.display_name || playlist.profiles?.username}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(playlist.id, playlist.hasVoted);
                      }}
                      className={`flex flex-col items-center justify-center transition-transform active:scale-95 ${playlist.hasVoted ? "text-secondary" : "text-muted-foreground hover:text-secondary/70"}`}
                    >
                      <Heart size={20} className={playlist.hasVoted ? "fill-secondary" : ""} />
                      <span className="text-[10px] font-bold mt-1">{playlist.voteCount}</span>
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105 active:scale-95">
                      <Play size={16} className="fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PremiumEmptyState
              icon={Music2}
              title="No trending music"
              description="Be the first to create a playlist and get it trending!"
              glowColor="secondary"
            />
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Your Library</h2>
            <CreatePlaylistModal
              onCreated={() => {
                setLoading(true);
                fetchMusic();
              }}
            >
              <button className="text-sm font-bold text-secondary bg-secondary/10 px-4 py-2 rounded-full hover:bg-secondary/20 transition-colors border border-secondary/20">
                + New Playlist
              </button>
            </CreatePlaylistModal>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="aspect-square w-full rounded-3xl bg-card/50 border border-border"
                />
              ))}
            </div>
          ) : myPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {myPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="rounded-3xl border border-border bg-card overflow-hidden p-4 aspect-square flex flex-col justify-end relative group cursor-pointer shadow-lg"
                >
                  {playlist.cover_url ? (
                    <img
                      src={playlist.cover_url}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-secondary/40 to-primary/40 opacity-60 group-hover:opacity-80 transition-opacity" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <div className="relative z-10">
                    <h3 className="font-bold text-foreground text-lg tracking-tight leading-tight mb-1">
                      {playlist.title}
                    </h3>
                    <p className="text-xs text-primary font-bold">{playlist.voteCount} votes</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PremiumEmptyState
              icon={Disc}
              title="No playlists yet"
              description="Create a playlist to save your favorite tracks."
              glowColor="accent1"
            />
          )}
        </section>
      </main>
    </div>
  );
}
