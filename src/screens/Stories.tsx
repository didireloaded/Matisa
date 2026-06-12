import { useState } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Send, Music2, Play, Eye } from "lucide-react";
import { STORIES, getProfile, ME_ID } from "../data/mock";

export function Stories() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const startIdx = parseInt(searchParams.get("idx") || "0", 10);
  const [idx, setIdx] = useState(startIdx);
  const story = STORIES[Math.min(idx, STORIES.length - 1)];
  const author = getProfile(story.user_id);
  const isMe = story.user_id === ME_ID;

  const next = () => idx < STORIES.length - 1 ? setIdx(idx + 1) : navigate("/");
  const prev = () => idx > 0 && setIdx(idx - 1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-fade-in">
      <div className="absolute inset-x-0 top-0 z-10 flex gap-1 p-3">
        {STORIES.map((_, i) => <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"><div className="h-full rounded-full bg-white transition-all" style={{ width: i < idx ? "100%" : i === idx ? "55%" : "0%" }} /></div>)}
      </div>
      <div className="absolute left-0 right-0 top-6 z-10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold" style={{ background: author.gradient }}>{author.full_name.charAt(0)}</div>
          <div><div className="text-sm font-semibold text-white">{author.full_name}</div><div className="text-[10px] text-white/70">{story.kind === "audio" ? "Audio Story" : story.kind === "video" ? "Video Story" : "2h ago"}</div></div>
        </div>
        <button onClick={() => navigate("/")} className="text-white"><X size={22} /></button>
      </div>
      <div className="flex flex-1 items-center justify-center" style={{ background: story.gradient }}>
        <div className="px-8 text-center">
          {story.kind === "audio" ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur"><Music2 size={36} color="white" /></div>
              <div className="font-display text-xl font-bold text-white">{story.caption}</div>
            </div>
          ) : story.kind === "video" ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur"><Play size={36} color="white" fill="white" /></div>
              <div className="font-display text-xl font-bold text-white">{story.caption}</div>
            </div>
          ) : (
            <div className="font-display text-2xl font-bold text-white drop-shadow-lg">{story.caption ?? "Story"}</div>
          )}
        </div>
        <button onClick={prev} className="absolute inset-y-0 left-0 w-1/3" />
        <button onClick={next} className="absolute inset-y-0 right-0 w-2/3" />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 px-4 pb-8">
        {isMe ? (
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2.5 backdrop-blur"><Eye size={16} color="white" /><span className="text-sm text-white">42 views</span></div>
        ) : (
          <>
            <input placeholder={`Reply to ${author.username}…`} className="flex-1 rounded-full border border-white/25 bg-black/35 px-4 py-2.5 text-sm text-white backdrop-blur placeholder:text-white/60 outline-none" />
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C8521A] text-white"><Send size={16} /></button>
          </>
        )}
      </div>
    </div>
  );
}
