import { Music2, Play } from 'lucide-react';

export function SongCard({ title, artist }: { title: string; artist: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#2E2822] bg-[#221D18] p-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white"
           style={{ background: 'linear-gradient(135deg,#C8521A,#2D7DD2)' }}>
        <Music2 size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#F5F0EA] truncate">{title}</div>
        <div className="text-xs text-[#8A7F74] truncate">{artist}</div>
      </div>
      <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C8521A] text-white">
        <Play size={11} fill="white" color="white" />
      </button>
    </div>
  );
}
