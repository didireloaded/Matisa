import { useState, useEffect } from 'react';
import { Music2, Play, Search, Disc, Heart } from 'lucide-react';
import { T, EmptyState, Skeleton, Avatar } from "@/components/common";
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { CreatePlaylistModal } from '@/components/music/CreatePlaylistModal';

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
      .from('playlists')
      .select('*, profiles(*), playlist_votes(user_id)');
    
    if (trending) {
      const withVotes = trending.map(p => ({
        ...p,
        voteCount: p.playlist_votes?.length || 0,
        hasVoted: p.playlist_votes?.some((v: any) => v.user_id === profile.id)
      })).sort((a, b) => b.voteCount - a.voteCount);
      
      setPlaylists(withVotes);
      setMyPlaylists(withVotes.filter(p => p.author_id === profile.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMusic();
  }, [profile]);

  const handleVote = async (playlistId: string, hasVoted: boolean) => {
    if (!profile) return;
    
    // Optimistic UI update
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, hasVoted: !hasVoted, voteCount: p.voteCount + (hasVoted ? -1 : 1) };
      }
      return p;
    }));

    if (hasVoted) {
      await supabase.from('playlist_votes').delete().match({ playlist_id: playlistId, user_id: profile.id });
    } else {
      await supabase.from('playlist_votes').insert({ playlist_id: playlistId, user_id: profile.id });
    }
  };

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-40 px-4 pt-4 pb-3 bg-[#0F0D0B]/90 backdrop-blur-md border-b border-[#2E2822]">
        <h1 className="text-xl font-bold text-[#F5F0EA] flex items-center gap-2">
          <Music2 size={24} className="text-[#C8521A]" />
          Music & Leaderboards
        </h1>
        <div className="mt-3 flex h-10 items-center rounded-xl bg-[#1C1814] px-3 border border-[#2E2822]">
          <Search size={18} className="text-[#8A7F74]" />
          <input
            type="text"
            placeholder="Search playlists..."
            className="w-full bg-transparent px-3 text-sm text-[#F5F0EA] outline-none placeholder:text-[#8A7F74]"
          />
        </div>
      </header>

      <main className="px-4 py-4 space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-[#8A7F74] mb-3 uppercase tracking-wider">Trending Playlists</h2>
          {loading ? (
            <div className="space-y-3">
               {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
            </div>
          ) : playlists.length > 0 ? (
            <div className="space-y-3">
              {playlists.map((playlist, idx) => (
                <div key={playlist.id} className="flex items-center gap-3 rounded-2xl border border-[#2E2822] bg-[#221D18] p-3">
                  <div className="w-6 text-center font-bold text-[#8A7F74]">{idx + 1}</div>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#1C1814] overflow-hidden border border-[#2E2822]">
                    {playlist.cover_url ? (
                      <img src={playlist.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Disc size={20} className="text-[#8A7F74]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[#F5F0EA] truncate">{playlist.title}</div>
                    <div className="text-xs text-[#8A7F74] truncate flex items-center gap-1 mt-0.5">
                      By {playlist.profiles?.display_name || playlist.profiles?.username}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleVote(playlist.id, playlist.hasVoted)}
                      className={`flex flex-col items-center justify-center ${playlist.hasVoted ? 'text-[#C8521A]' : 'text-[#8A7F74]'}`}
                    >
                      <Heart size={16} fill={playlist.hasVoted ? '#C8521A' : 'none'} />
                      <span className="text-[10px] font-bold mt-0.5">{playlist.voteCount}</span>
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C8521A] text-white">
                      <Play size={12} fill="white" color="white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <EmptyState icon={<Music2 />} title="No trending music" />
          )}
        </section>
        
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#8A7F74] uppercase tracking-wider">Your Playlists</h2>
            <CreatePlaylistModal onCreated={() => { setLoading(true); fetchMusic(); }}>
              <button className="text-xs font-bold text-[#C8521A] bg-[#C8521A]/10 px-3 py-1 rounded-full hover:bg-[#C8521A]/20 transition">
                + New
              </button>
            </CreatePlaylistModal>
          </div>
          {loading ? (
             <Skeleton className="h-20 w-full rounded-2xl" />
          ) : myPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
               {myPlaylists.map(playlist => (
                 <div key={playlist.id} className="rounded-xl border border-[#2E2822] bg-[#1C1814] p-3 aspect-square flex flex-col justify-end relative overflow-hidden group">
                   {playlist.cover_url && <img src={playlist.cover_url} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition" />}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                   <div className="relative z-10">
                     <h3 className="font-bold text-[#F5F0EA] text-sm">{playlist.title}</h3>
                     <p className="text-xs text-[#E8A055] font-medium mt-1">{playlist.voteCount} votes</p>
                   </div>
                 </div>
               ))}
            </div>
          ) : (
            <EmptyState icon={<Disc />} title="No playlists yet" subtitle="Create a playlist to save your favorite tracks." />
          )}
        </section>
      </main>
    </div>
  );
}