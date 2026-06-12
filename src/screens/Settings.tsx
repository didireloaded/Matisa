import { useNavigate } from "@/lib/router-compat";
import { ArrowLeft, Eye, ShieldCheck, Bell, Music2, Mic, Palette, UserX, HelpCircle, LogOut } from "lucide-react";
import { getProfile, ME_ID } from "../data/mock";

export function Settings() {
  const navigate = useNavigate();
  const me = getProfile(ME_ID);

  const sections = [
    { title: "General", items: [{ icon: <Eye size={18} />, label: "Account" }, { icon: <ShieldCheck size={18} />, label: "Privacy" }, { icon: <Bell size={18} />, label: "Notifications" }] },
    { title: "Experience", items: [{ icon: <Music2 size={18} />, label: "Music" }, { icon: <Mic size={18} />, label: "Voice" }, { icon: <Palette size={18} />, label: "Appearance" }] },
    { title: "More", items: [{ icon: <UserX size={18} />, label: "Blocked Users" }, { icon: <HelpCircle size={18} />, label: "Help" }] },
    { title: "Account Actions", items: [{ icon: <LogOut size={18} />, label: "Sign Out", danger: true }] },
  ];

  return (
    <div>
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#2E2822] px-4 py-3 backdrop-blur-lg" style={{ background: "rgba(15,13,11,0.95)" }}>
        <button onClick={() => navigate("/profile")} className="text-[#F5F0EA]"><ArrowLeft size={20} /></button>
        <h1 className="font-display text-lg font-bold text-[#F5F0EA]">Settings</h1>
      </div>
      <div className="flex items-center gap-4 border-b border-[#2E2822] px-4 py-4">
        <div className="h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ background: me.gradient }}>{me.full_name.charAt(0)}</div>
        <div>
          <div className="font-semibold text-[#F5F0EA]">{me.full_name}</div>
          <div className="text-sm text-[#8A7F74]">@{me.username}</div>
          {me.is_plus && <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-[#E8A055]/15 text-[#E8A055] border-[#E8A055]/25">Matisa Plus</span>}
        </div>
      </div>
      {sections.map(s => (
        <div key={s.title}>
          <div className="px-4 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-[#8A7F74]">{s.title}</div>
          <div className="divide-y divide-[#2E2822]">
            {s.items.map(item => (
              <button key={item.label} className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-[#1C1814]">
                <div className="flex items-center gap-3" style={{ color: (item as any).danger ? "#EF4444" : (item as any).highlight ? "#E8A055" : "#F5F0EA" }}>
                  {item.icon}<span className="text-sm font-medium">{item.label}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A7F74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
