import { useNavigate } from "@/lib/router-compat";
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, Repeat2, CalendarDays, Eye } from "lucide-react";
import { NOTIFICATIONS, getProfile } from "../data/mock";

export function Notifications() {
  const navigate = useNavigate();
  const buckets = ["today","week","earlier"] as const;
  const labels: Record<string, string> = { today: "Today", week: "This week", earlier: "Earlier" };

  function iconFor(type: string) {
    const c: Record<string, React.ReactNode> = {
      like: <Heart size={13} fill="#C8521A" color="#C8521A" />, comment: <MessageCircle size={13} color="#2D7DD2" />,
      follow: <UserPlus size={13} color="#4CAF7D" />, repost: <Repeat2 size={13} color="#4CAF7D" />,
      rsvp: <CalendarDays size={13} color="#E8A055" />, mention: <MessageCircle size={13} color="#2D7DD2" />,
      view: <Eye size={13} color="#8A7F74" />,
      event_invite: <CalendarDays size={13} color="#2D7DD2" />,
    };
    return c[type] ?? <Bell size={13} />;
  }

  return (
    <div>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#2E2822] px-4 py-3 backdrop-blur-lg" style={{ background: "rgba(15,13,11,0.92)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-[#F5F0EA]"><ArrowLeft size={20} /></button>
          <h1 className="font-display text-lg font-bold text-[#F5F0EA]">Notifications</h1>
        </div>
        <button className="text-xs font-semibold text-[#E8A055]">Mark all read</button>
      </div>
      {buckets.map(b => {
        const items = NOTIFICATIONS.filter(n => n.bucket === b);
        if (!items.length) return null;
        return (
          <div key={b}>
            <div className="px-4 pb-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-[#8A7F74]">{labels[b]}</div>
            <div className="divide-y divide-[#2E2822]">
              {items.map(n => {
                const actor = getProfile(n.actor_id);
                return (
                  <button key={n.id} onClick={() => navigate(`/profile/${actor.id}`)} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#1C1814] ${!n.read ? "bg-[#1C1814]/60" : ""}`}>
                    <div className="relative flex-shrink-0">
                      <div className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: actor.gradient }}>{actor.full_name.charAt(0)}</div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0F0D0B] bg-[#221D18]">{iconFor(n.type)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm"><span className="font-semibold text-[#F5F0EA]">{actor.full_name}</span>{" "}<span className="text-[#8A7F74]">{n.body}</span></div>
                      <div className="mt-0.5 text-[10px] text-[#8A7F74]">{n.when}</div>
                    </div>
                    {!n.read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#C8521A]" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
