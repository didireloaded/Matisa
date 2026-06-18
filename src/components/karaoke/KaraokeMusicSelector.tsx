import { useState } from "react";
import { Search, Music, Clock, Play, Plus } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
}

export function KaraokeMusicSelector({ onSelect }: { onSelect: (song: Song) => void }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for MVP
  const recentSongs: Song[] = [
    {
      id: "1",
      title: "Water",
      artist: "Tyla",
      thumbnail: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?w=100",
      duration: "3:20",
    },
    {
      id: "2",
      title: "Essence",
      artist: "Wizkid",
      thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100",
      duration: "4:05",
    },
    {
      id: "3",
      title: "Someone Like You",
      artist: "Adele",
      thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100",
      duration: "4:45",
    },
  ];

  const popularSongs: Song[] = [
    {
      id: "4",
      title: "Calm Down",
      artist: "Rema",
      thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100",
      duration: "3:59",
    },
    {
      id: "5",
      title: "Last Last",
      artist: "Burna Boy",
      thumbnail: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?w=100",
      duration: "2:52",
    },
    {
      id: "6",
      title: "As It Was",
      artist: "Harry Styles",
      thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100",
      duration: "2:47",
    },
  ];

  const filteredSongs = popularSongs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-background/95 backdrop-blur-xl text-foreground">
      <div className="p-6 pb-2">
        <h2 className="text-2xl font-bold mb-6">Choose a Song</h2>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search artists, songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 text-white placeholder:text-white/40 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-8">
        {!searchQuery && (
          <section>
            <div className="flex items-center gap-2 mb-4 text-white/60">
              <Clock className="w-4 h-4" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Recently Sung</h3>
            </div>
            <div className="space-y-3">
              {recentSongs.map((song) => (
                <SongRow key={song.id} song={song} onSelect={() => onSelect(song)} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-4 text-white/60">
            <Music className="w-4 h-4" />
            <h3 className="font-bold uppercase tracking-wider text-sm">
              {searchQuery ? "Search Results" : "Popular for Karaoke"}
            </h3>
          </div>
          <div className="space-y-3">
            {(searchQuery ? filteredSongs : popularSongs).map((song) => (
              <SongRow key={song.id} song={song} onSelect={() => onSelect(song)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SongRow({ song, onSelect }: { song: Song; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group text-left"
    >
      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
        <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-white" fill="currentColor" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-white truncate">{song.title}</h4>
        <p className="text-sm text-white/60 truncate">{song.artist}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-white/40">{song.duration}</span>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-[var(--primary)] transition-colors">
          <Plus className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}
