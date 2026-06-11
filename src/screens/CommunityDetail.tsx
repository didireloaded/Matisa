import { useParams, useNavigate } from "@/lib/router-compat";
import { ArrowLeft, Check } from "lucide-react";
import { COMMUNITIES, POSTS, getProfile } from "../data/mock";
import type { Post } from "../data/types";
import { useState } from "react";

function PostCard({ post }: { post: Post }) {
  const author = post.profiles || getProfile(post.user_id);
  return (
    <article className="border-b border-[#2E2822] px-4 py-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: author.gradient }}>{author.full_name.charAt(0)}</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[#F5F0EA]">{author.full_name}</div>
          <p className="mt-1 text-sm text-[#F5F0EA]">{post.content}</p>
        </div>
      </div>
    </article>
  );
}

export function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const c = COMMUNITIES.find(x => x.id === id) ?? COMMUNITIES[0];
  const posts = POSTS.slice(0, 5);
  const [joined, setJoined] = useState(!!c.joined);

  return (
    <div>
      <div className="relative h-48" style={{ background: c.gradient }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0B] via-black/20 to-transparent" />
        <button onClick={() => navigate("/communities")} className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur text-white"><ArrowLeft size={18} /></button>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="font-display text-3xl font-bold text-white">{c.name}</div>
          <div className="text-sm text-white/70 mt-0.5">{c.member_count.toLocaleString()} members · {c.post_count.toLocaleString()} posts · {c.today_posts} today</div>
          <button onClick={() => setJoined(j => !j)} className={`mt-3 rounded-full px-4 py-1.5 text-sm font-semibold transition ${joined ? "border border-[#4CAF7D] bg-[#4CAF7D]/10 text-[#4CAF7D]" : "bg-[#C8521A] text-white"}`}>
            {joined ? <span className="flex items-center gap-1.5"><Check size={14} /> Joined</span> : "Join Community"}
          </button>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-[#8A7F74]">{c.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-[#8A7F74]"><span>{c.active_users} active now</span><span>·</span><span>{c.today_posts} posts today</span></div>
      </div>
      <div className="h-px bg-[#2E2822]" />
      {posts.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  );
}
