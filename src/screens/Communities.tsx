import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Check } from "lucide-react";
import { COMMUNITIES, fmt } from "../data/mock";

export function Communities() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"regions"|"interests">("regions");
  const list = COMMUNITIES.filter(c => tab === "regions" ? c.is_region : !c.is_region);

  return (
    <div className="pb-6">
      <div className="sticky top-[60px] z-20 border-b border-[#2E2822] backdrop-blur-lg" style={{ background: "rgba(15,13,11,0.90)" }}>
        <div className="flex">
          {(["regions","interests"] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-sm font-semibold capitalize transition ${t === tab ? "text-[#F5F0EA]" : "text-[#8A7F74]"}`}>{t === "regions" ? "14 Regions" : "Interests"}{t === tab && <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-[#C8521A]" />}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        {list.map(c => (
          <button key={c.id} onClick={() => navigate(`/community/${c.id}`)} className="overflow-hidden rounded-2xl border border-[#2E2822] text-left transition hover:border-[#C8521A]/40">
            <div className="h-24 relative" style={{ background: c.gradient }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3"><div className="font-display text-sm font-bold text-white leading-tight line-clamp-2">{c.name}</div></div>
            </div>
            <div className="bg-[#1C1814] p-3">
              <div className="text-[10px] text-[#8A7F74]">{fmt(c.member_count)} members</div>
              <div className="mt-1 flex items-center gap-2"><span className="text-[10px] font-semibold text-[#4CAF7D]">{c.today_posts} today</span><span className="text-[10px] text-[#8A7F74]">· {c.active_users} active</span></div>
              {c.joined && <div className="mt-1 text-[10px] font-semibold text-[#4CAF7D] flex items-center gap-1"><Check size={10} /> Joined</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
