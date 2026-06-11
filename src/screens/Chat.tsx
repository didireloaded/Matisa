import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "@/lib/router-compat";
import { ArrowLeft, MoreHorizontal, Send, Mic, Image, FileImage } from "lucide-react";
import { CONVERSATIONS, getProfile } from "../data/mock";

export function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const conv = CONVERSATIONS.find(c => c.id === id);
  const other = conv && !conv.is_group ? getProfile(conv.member_ids.find(m => m !== "u_ndina")!) : null;
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, []);

  if (!conv) return null;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 60px)" }}>
      <div className="flex items-center gap-3 border-b border-[#2E2822] px-4 py-3" style={{ background: "rgba(15,13,11,0.95)" }}>
        <button onClick={() => navigate("/messages")} className="text-[#F5F0EA]"><ArrowLeft size={20} /></button>
        {conv.is_group ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C8521A] to-[#2D7DD2] text-white">👥</div>
        ) : (
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: other!.gradient }}>{other!.full_name.charAt(0)}</div>
        )}
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-[#F5F0EA] truncate">{conv.is_group ? conv.group_name : other?.full_name}</span>
          <div className="text-[10px] text-[#4CAF7D]">{conv.is_group ? `${conv.member_ids.length} members` : (other?.online ? "Online" : "Last seen recently")}</div>
        </div>
        <button className="text-[#8A7F74]"><MoreHorizontal size={20} /></button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        <div className="flex justify-start gap-2">
          <div className="max-w-[76%]">
            <div className="rounded-2xl rounded-bl-md border border-[#2E2822] bg-[#1C1814] px-4 py-2.5 text-sm text-[#F5F0EA]">
              <p>Hey! How is it going?</p>
            </div>
            <div className="mt-0.5 text-[9px] text-[#8A7F74]">2h ago</div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="max-w-[76%]">
            <div className="rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white" style={{ background: "#C8521A" }}>
              <p>All good! What is up?</p>
            </div>
            <div className="mt-0.5 text-[9px] text-[#8A7F74] text-right">1h ago</div>
          </div>
        </div>
        <div ref={endRef} />
      </div>
      <div className="border-t border-[#2E2822] px-3 py-2.5" style={{ background: "#0F0D0B" }}>
        <div className="flex items-end gap-2 rounded-2xl border border-[#2E2822] bg-[#1C1814] px-2 py-1.5">
          <button className="flex h-9 w-9 items-center justify-center text-[#E8A055]"><Image size={18} /></button>
          <button className="flex h-9 w-9 items-center justify-center text-[#E8A055]"><FileImage size={18} /></button>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Message…" rows={1} className="flex-1 resize-none bg-transparent py-2 text-sm text-[#F5F0EA] outline-none placeholder:text-[#8A7F74]" />
          {draft ? (
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C8521A] text-white"><Send size={16} /></button>
          ) : (
            <button className="flex h-9 w-9 items-center justify-center text-[#E8A055]"><Mic size={18} /></button>
          )}
        </div>
      </div>
    </div>
  );
}
