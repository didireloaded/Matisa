import { useState, useEffect } from 'react';
import { Music2, Play, Search, Disc } from 'lucide-react';
import { T, SongCard, EmptyState, Skeleton } from '../components/shared';

export function Music() {
  const [loading, setLoading] = useState(false);

  // Placeholder for music feed
  const trendingMusic = [
    { id: 1, title: 'Namibian Sunset', artist: 'Local Sound' },
    { id: 2, title: 'Windhoek Nights', artist: 'Kwaito Master' },
    { id: 3, title: 'Desert Vibes', artist: 'DJ Sand' },
  ];

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-40 px-4 pt-4 pb-3 bg-[#0F0D0B]/90 backdrop-blur-md border-b border-[#2E2822]">
        <h1 className="text-xl font-bold text-[#F5F0EA] flex items-center gap-2">
          <Music2 size={24} className="text-[#C8521A]" />
          Music
        </h1>
        <div className="mt-3 flex h-10 items-center rounded-xl bg-[#1C1814] px-3 border border-[#2E2822]">
          <Search size={18} className="text-[#8A7F74]" />
          <input
            type="text"
            placeholder="Search songs or artists..."
            className="w-full bg-transparent px-3 text-sm text-[#F5F0EA] outline-none placeholder:text-[#8A7F74]"
          />
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-[#8A7F74] mb-3 uppercase tracking-wider">Trending in Namibia</h2>
          <div className="space-y-3">
            {trendingMusic.map((song) => (
              <SongCard key={song.id} title={song.title} artist={song.artist} />
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-sm font-semibold text-[#8A7F74] mb-3 uppercase tracking-wider">Your Playlists</h2>
          <EmptyState icon={<Disc />} title="No playlists yet" subtitle="Create a playlist to save your favorite tracks." />
        </section>
      </main>
    </div>
  );
}