import { useState } from "react";
import { Radar, Eye, X } from "lucide-react";
import { PROFILES, ME_ID, getProfile } from "../data/mock";

export function RadarPage() {
  const [radius, setRadius] = useState(5);
  const [filter, setFilter] = useState("Everyone");
  const [selected, setSelected] = useState<string | null>(null);
  const [ghost, setGhost] = useState<"hidden"|"approximate"|"exact">("approximate");
  const nearby = PROFILES.filter(p => p.distance != null && p.ghost_mode !== "hidden" && p.id !== ME_ID).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  return (
    <div className="relative" style={{ height: "calc(100vh - 120px)", overflow: "hidden" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 44%, #1C1814 0%, #0F0D0B 70%)" }}>
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "linear-gradient(rgba(232,160,85,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(232,160,85,0.4) 1px,transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
          {[100,170,250,350].map(r => <div key={r} className="absolute rounded-full border border-[#C8521A]/15" style={{ width: r*2, height: r*2, left: -r, top: -r }} />)}
          <div className="radar-ring absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8521A]" />
          <div className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8521A] ring-4 ring-[#0F0D0B] shadow-lg shadow-[#C8521A]/50" />
          {nearby.slice(0, 7).map((u, i) => {
            const angle = ((u.bearing ?? i * 60) * Math.PI) / 180;
            const maxR = Math.min(100 + ((u.distance ?? 0) / 50), 330);
            return (
              <button key={u.id} onClick={() => setSelected(selected === u.id ? null : u.id)} className="absolute transition hover:scale-110"
                style={{ transform: `translate(calc(-50% + ${Math.cos(angle) * maxR}px), calc(-50% + ${Math.sin(angle) * maxR}px))` }}>
                <div className="h-8 w-8 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] font-bold text-white" style={{ background: u.gradient }}>{u.full_name.charAt(0)}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="absolute left-0 right-0 top-0 z-10 space-y-2 px-4 pt-3">
        <div className="flex items-center gap-2 rounded-2xl border border-[#2E2822] bg-[#1C1814]/95 px-3 py-2.5 backdrop-blur">
          <Radar size={16} color="#C8521A" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#F5F0EA]">{nearby.length} people within {radius}km</div>
            <div className="text-[10px] text-[#8A7F74]">Windhoek · Radar active</div>
          </div>
          <div className="flex items-center gap-1">
            {[0.1, 0.5, 1, 5, 20].map(r => <button key={r} onClick={() => setRadius(r)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${radius === r ? "bg-[#C8521A] text-white" : "text-[#8A7F74]"}`}>{r < 1 ? `${r*1000}m` : `${r}km`}</button>)}
          </div>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {["Everyone","Creatives","Students","Entrepreneurs","Musicians","Photographers","Videographers","Models"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition ${filter === f ? "border-[#C8521A] bg-[#C8521A] text-white" : "border-[#2E2822] bg-[#1C1814] text-[#8A7F74]"}`}>{f}</button>
          ))}
        </div>
      </div>
      {selected && (() => {
        const u = getProfile(selected);
        return (
          <div className="absolute inset-x-4 top-28 z-20 animate-slide-up rounded-2xl border border-[#2E2822] bg-[#1C1814]/98 p-4 backdrop-blur shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: u.gradient }}>{u.full_name.charAt(0)}</div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[#F5F0EA]">{u.full_name}</div>
                <div className="text-xs text-[#8A7F74]">@{u.username} · {u.city}</div>
                <div className="mt-1 text-[11px] text-[#E8A055]">{u.mood}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#8A7F74]"><X size={18} /></button>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-full border border-[#2E2822] py-2 text-xs font-semibold text-[#F5F0EA]">View Profile</button>
              <button className="flex-1 rounded-full bg-[#C8521A] py-2 text-xs font-semibold text-white">Follow</button>
            </div>
          </div>
        );
      })()}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="rounded-t-3xl border-t border-[#2E2822] bg-[#1C1814]/98 px-4 pb-4 pt-3 backdrop-blur">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#2E2822]" />
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ghost === "hidden" ? <Eye size={16} color="#8A7F74" /> : <Eye size={16} color="#C8521A" />}
              <div><div className="text-xs font-semibold text-[#F5F0EA]">Ghost Mode</div><div className="text-[10px] text-[#8A7F74]">{ghost === "hidden" ? "Hidden" : ghost === "approximate" ? "Approximate" : "Exact"}</div></div>
            </div>
            <div className="flex gap-1">
              {(["hidden","approximate","exact"] as const).map(m => <button key={m} onClick={() => setGhost(m)} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${ghost === m ? "bg-[#C8521A] text-white" : "border border-[#2E2822] text-[#8A7F74]"}`}>{m === "hidden" ? "Hide" : m === "approximate" ? "Approx" : "Exact"}</button>)}
            </div>
          </div>
          <div className="text-xs font-semibold text-[#8A7F74] mb-2 uppercase tracking-wider">Nearby now</div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {nearby.map(u => (
              <button key={u.id} onClick={() => setSelected(u.id)} className="flex-shrink-0 flex flex-col items-center gap-1 w-14">
                <div className="h-10 w-10 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] font-bold text-white" style={{ background: u.gradient }}>{u.full_name.charAt(0)}</div>
                <span className="text-[9px] text-[#8A7F74] text-center line-clamp-1 w-full">{u.full_name.split(" ")[0]}</span>
                <span className="text-[8px] text-[#C8521A]">{((u.distance ?? 0)/1000).toFixed(1)}km</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
