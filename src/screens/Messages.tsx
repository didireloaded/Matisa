import { useNavigate } from "@/lib/router-compat";
import { Plus, Search } from "lucide-react";
import { CONVERSATIONS, getProfile } from "../data/mock";

export function Messages() {
  const navigate = useNavigate();

  return (
    <div className="pb-6">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-xl font-bold text-[#F5F0EA]">Messages</h1>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2E2822] bg-[#1C1814] text-[#F5F0EA]"><Plus size={18} /></button>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#2E2822] bg-[#1C1814] px-3 py-2.5">
          <Search size={17} color="#8A7F74" />
          <input placeholder="Search conversations…" className="flex-1 bg-transparent text-sm text-[#F5F0EA] outline-none placeholder:text-[#8A7F74]" />
        </div>
      </div>
      <div className="divide-y divide-[#2E2822]">
        {CONVERSATIONS.map(c => {
          const other = c.is_group ? null : getProfile(c.member_ids.find(m => m !== "u_ndina")!);
          const name = c.is_group ? c.group_name : other?.full_name;
          return (
            <button key={c.id} onClick={() => navigate(`/chat/${c.id}`)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#1C1814]">
              {c.is_group ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#C8521A] to-[#2D7DD2] text-white flex-shrink-0 text-lg">👥</div>
              ) : (
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: other!.gradient }}>{other!.full_name.charAt(0)}</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 truncate">
                    <span className={`text-sm truncate ${c.unread > 0 ? "font-bold text-[#F5F0EA]" : "font-semibold text-[#F5F0EA]"}`}>{name}</span>
                  </div>
                  <span className="flex-shrink-0 text-[10px] text-[#8A7F74]">{c.last_message_at}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className={`truncate text-xs ${c.unread > 0 ? "text-[#F5F0EA]" : "text-[#8A7F74]"}`}>{c.last_message}</p>
                  {c.unread > 0 && <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#C8521A] px-1.5 text-[10px] font-bold text-white">{c.unread}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
