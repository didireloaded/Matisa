import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Search, X, Heart, Flame } from "lucide-react";
import { POSTS, PROFILES, fmt } from "../data/mock";

export function Explore() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const trending = [...POSTS].sort((a, b) => b.likes_count - a.likes_count).slice(0, 6);
  const people = PROFILES.filter(p => p.id !== "u_ndina").slice(0, 6);

  return (
    <div className="pb-6">
      <div className="sticky top-[60px] z-20 border-b border-[#2E2822] px-4 py-3 backdrop-blur-lg" style={{ background: "rgba(15,13,11,0.90)" }}>
        <div className="flex items-center gap-2 rounded-2xl border border-[#2E2822] bg-[#1C1814] px-3 py-2.5">
          <Search size={17} color="#8A7F74" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search people, posts, creators…" className="flex-1 bg-transparent text-sm text-[#F5F0EA] outline-none placeholder:text-[#8A7F74]" />
          {q && <button onClick={() => setQ("")}><X size={15} color="#8A7F74" /></button>}
        </div>
      </div>
      <div className="px-4 py-5 space-y-4">
        <div className="flex items-end justify-between"><div><h2 className="font-display text-lg font-bold text-[#F5F0EA]">Trending</h2><p className="mt-0.5 text-xs text-[#8A7F74]">Most engaged posts right now</p></div><span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold bg-[#C8521A]/15 text-[#E8A055] border-[#C8521A]/25"><Flame size={10} /> Last 48h</span></div>
        <div className="grid grid-cols-2 gap-3">
          {trending.map(p => (
            <button key={p.id} onClick={() => navigate(`/profile/${p.user_id}`)} className="overflow-hidden rounded-2xl border border-[#2E2822] bg-[#1C1814] text-left">
              <div className="h-24" style={{ background: (p.profiles || PROFILES[0]).gradient }} />
              <div className="p-3"><p className="text-xs text-[#F5F0EA] line-clamp-2 leading-snug">{p.content}</p><div className="mt-2 flex items-center gap-2 text-[10px] text-[#8A7F74]"><span>@{(p.profiles || PROFILES[0]).username}</span><span>·</span><Heart size={9} /><span>{fmt(p.likes_count)}</span></div></div>
            </button>
          ))}
        </div>
      </div>
      <div className="h-px bg-[#2E2822]" />
      <div className="px-4 py-5 space-y-4">
        <div className="flex items-end justify-between"><div><h2 className="font-display text-lg font-bold text-[#F5F0EA]">People to Follow</h2><p className="mt-0.5 text-xs text-[#8A7F74]">Discover Namibians near you</p></div></div>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {people.map(p => (
            <div key={p.id} className="flex-shrink-0 w-44 overflow-hidden rounded-2xl border border-[#2E2822] bg-[#1C1814]">
              <div className="h-16 relative" style={{ background: p.gradient }}><div className="absolute inset-0 bg-gradient-to-t from-[#1C1814] to-transparent" /></div>
              <div className="px-3 pb-3 -mt-6">
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-[#0F0D0B]" style={{ background: p.gradient }}>{p.full_name.charAt(0)}</div>
                <div className="mt-2"><div className="text-sm font-semibold text-[#F5F0EA] truncate">{p.full_name}</div><span className="text-[11px] text-[#8A7F74]">@{p.username}</span><p className="mt-1 text-[10px] text-[#8A7F74]">{p.region} · {fmt(p.followers_count)} followers</p></div>
                <button onClick={() => navigate(`/profile/${p.id}`)} className="mt-3 w-full rounded-full bg-[#C8521A] py-1.5 text-[11px] font-semibold text-white">Follow</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
