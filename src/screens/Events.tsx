import { useState } from "react";
import { MapPin, Clock, Check, MessageCircle } from "lucide-react";
import { EVENTS, getProfile, fmt } from "../data/mock";

export function Events() {
  const [tab, setTab] = useState<"discover"|"mine">("discover");
  const mine = EVENTS.filter(e => e.rsvpd || e.created_by === "u_ndina");
  const list = tab === "mine" ? mine : EVENTS;
  const [rsvpd, setRsvpd] = useState<Set<string>>(new Set(EVENTS.filter(e => e.rsvpd).map(e => e.id)));

  return (
    <div className="pb-24">
      <div className="sticky top-[60px] z-20 border-b border-[#2E2822] backdrop-blur-lg" style={{ background: "rgba(15,13,11,0.90)" }}>
        <div className="flex">
          {(["discover","mine"] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-sm font-semibold transition ${t === tab ? "text-[#F5F0EA]" : "text-[#8A7F74]"}`}>{t === "discover" ? "Discover" : `My Events${mine.length ? ` (${mine.length})` : ""}`}{t === tab && <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-[#C8521A]" />}</button>)}
        </div>
      </div>
      <div className="space-y-3 p-4">
        {list.map(ev => {
          const going = rsvpd.has(ev.id);
          return (
            <div key={ev.id} className="overflow-hidden rounded-2xl border border-[#2E2822] bg-[#1C1814]">
              <div className="h-32 relative" style={{ background: ev.gradient }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${ev.is_free ? "bg-[#4CAF7D]/15 text-[#4CAF7D] border-[#4CAF7D]/25" : "bg-[#C8521A]/15 text-[#E8A055] border-[#C8521A]/25"}`}>{ev.is_free ? "Free" : `N$${ev.price}`}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold bg-[#2E2822] text-[#8A7F74] border-[#2E2822]">{ev.category}</span>
                </div>
                {ev.has_event_chat && <div className="absolute top-3 right-3"><span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold bg-[#2D7DD2]/15 text-[#2D7DD2] border-[#2D7DD2]/25"><MessageCircle size={9} /> Chat</span></div>}
                <div className="absolute bottom-3 left-3 right-3"><div className="font-display text-lg font-bold text-white leading-tight">{ev.title}</div></div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 text-xs text-[#8A7F74]"><MapPin size={11} /><span>{ev.location_name}</span><Clock size={11} /><span>{ev.date} · {ev.time}</span></div>
                <p className="mt-2 text-sm text-[#8A7F74] line-clamp-2">{ev.description}</p>
                {ev.attendee_ids.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">{ev.attendee_ids.slice(0,4).map(id => <div key={id} className="h-7 w-7 rounded-full border-2 border-[#1C1814] flex items-center justify-center text-[8px] font-bold text-white" style={{ background: getProfile(id).gradient }}>{getProfile(id).full_name.charAt(0)}</div>)}</div>
                    <span className="text-xs text-[#8A7F74]">{fmt(ev.rsvp_count)} going · {fmt(ev.interested_count)} interested</span>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: getProfile(ev.created_by).gradient }}>{getProfile(ev.created_by).full_name.charAt(0)}</div><span className="text-xs text-[#8A7F74]">by {getProfile(ev.created_by).full_name}</span></div>
                  <button onClick={() => setRsvpd(prev => { const n = new Set(prev); going ? n.delete(ev.id) : n.add(ev.id); return n; })} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${going ? "border border-[#4CAF7D] text-[#4CAF7D]" : "bg-[#C8521A] text-white"}`}>{going ? <span className="flex items-center gap-1"><Check size={12} /> Going</span> : "RSVP"}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
