import { useState } from "react";
import { useParams, useNavigate } from "@/lib/router-compat";
import { ArrowLeft, Settings, MoreHorizontal, UserCheck, UserPlus, MessageCircle, PhoneCall, MapPin, Music2, Play, Tag } from "lucide-react";
import { POSTS, ME_ID, getProfile, fmt } from "../data/mock";
import type { Post } from "../data/types";

function Avatar({ profile, size = 40 }: { profile: ReturnType<typeof getProfile>; size?: number }) {
  return <div className="flex items-center justify-center rounded-full text-white font-semibold select-none ring-1 ring-black/20" style={{ width: size, height: size, background: profile.gradient, fontSize: size * 0.38 }}>{profile.full_name.charAt(0).toUpperCase()}</div>;
}

function PostCard({ post }: { post: Post }) {
  const author = post.profiles || getProfile(post.user_id);
  const [liked, setLiked] = useState(!!post.liked);
  const [likes, setLikes] = useState(post.likes_count);
  return (
    <article className="border-b border-[#2E2822] px-4 py-4">
      <div className="flex gap-3">
        <Avatar profile={author} size={42} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div className="text-sm"><span className="font-semibold text-[#F5F0EA]">{author.full_name}</span> <span className="text-[#8A7F74]">· {post.created_at}</span></div>
            <MoreHorizontal size={18} className="text-[#8A7F74]" />
          </div>
          {post.content && <p className="mt-2 text-sm text-[#F5F0EA]">{post.content}</p>}
          <div className="mt-3 flex items-center gap-4 text-[#8A7F74]">
            <button onClick={() => { setLiked(l => !l); setLikes(c => liked ? c - 1 : c + 1); }} className={`flex items-center gap-1 text-xs ${liked ? "text-[#C8521A]" : ""}`}><svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "#C8521A" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg> {fmt(likes)}</button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = id || ME_ID;
  const u = getProfile(userId);
  const isMe = u.id === ME_ID;
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState<"posts"|"media"|"portfolio">("posts");
  const userPosts = POSTS.filter(p => p.user_id === u.id);

  return (
    <div>
      <div className="relative h-40" style={{ background: u.gradient }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0B] to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur text-white"><ArrowLeft size={18} /></button>
        <button onClick={() => isMe ? navigate("/settings") : undefined} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur text-white">{isMe ? <Settings size={17} /> : <MoreHorizontal size={17} />}</button>
      </div>
      <div className="-mt-14 px-4">
        <div className="flex items-end justify-between">
          <div className="rounded-full border-4 border-[#0F0D0B]"><Avatar profile={u} size={80} /></div>
          <div className="flex gap-2 pb-1">
            {isMe ? (
              <button onClick={() => navigate("/settings")} className="rounded-full border border-[#2E2822] bg-[#1C1814] px-4 py-2 text-sm font-semibold text-[#F5F0EA]">Edit Profile</button>
            ) : (
              <>
                <button className="rounded-full border border-[#2E2822] bg-[#1C1814] px-4 py-2 text-sm font-semibold text-[#F5F0EA]"><MessageCircle size={14} /> Message</button>
                <button onClick={() => setFollowing(f => !f)} className={`rounded-full px-4 py-2 text-sm font-semibold ${following ? "border border-[#2E2822] bg-[#1C1814] text-[#F5F0EA]" : "bg-[#C8521A] text-white"}`}>{following ? <UserCheck size={14} /> : <UserPlus size={14} />} {following ? "Following" : "Follow"}</button>
              </>
            )}
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-[#F5F0EA]">{u.full_name}</h1>
            {u.is_verified && <svg width={16} height={16} viewBox="0 0 24 24" fill="#2D7DD2"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
            {u.is_plus && <span className="rounded-full bg-[#E8A055]/15 px-2 py-0.5 text-[9px] font-bold text-[#E8A055]">PLUS</span>}
          </div>
          <div className="text-sm text-[#8A7F74]">@{u.username}</div>
          <p className="mt-2 text-sm text-[#F5F0EA]">{u.bio}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#8A7F74]">
            <span className="flex items-center gap-1"><MapPin size={11} />{u.city}, {u.region}</span>
            <span className="rounded-full border border-[#C8521A]/25 bg-[#C8521A]/10 px-2 py-0.5 text-[#E8A055]">{u.mood}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {u.interests.map(i => <span key={i} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium border-[#C8521A]/30 bg-[#C8521A]/10 text-[#E8A055]">{i}</span>)}
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <div><span className="font-bold text-[#F5F0EA]">{fmt(u.posts_count)}</span> <span className="text-[#8A7F74]">posts</span></div>
          <div><span className="font-bold text-[#F5F0EA]">{fmt(u.followers_count)}</span> <span className="text-[#8A7F74]">followers</span></div>
          <div><span className="font-bold text-[#F5F0EA]">{fmt(u.following_count)}</span> <span className="text-[#8A7F74]">following</span></div>
        </div>
        {u.song_title && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#2E2822] bg-[#221D18] p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C8521A] to-[#2D7DD2] text-white"><Music2 size={18} /></div>
            <div className="min-w-0 flex-1"><div className="text-sm font-semibold text-[#F5F0EA]">{u.song_title}</div><div className="text-xs text-[#8A7F74]">{u.song_artist}</div></div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C8521A] text-white"><Play size={12} fill="white" /></button>
          </div>
        )}
        {/* Matisa is a social discovery app — no bookings or hiring CTAs */}
      </div>
      <div className="mt-4 border-b border-[#2E2822]">
        <div className="flex px-4">
          {(["posts","media"] as const).map(t => (
            <button key={t} onClick={() => setTab(t as any)} className={`flex-1 py-3 text-sm font-semibold capitalize transition ${t === tab ? "text-[#F5F0EA]" : "text-[#8A7F74]"}`}>{t}{t === tab && <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-[#C8521A]" />}</button>
          ))}
        </div>
      </div>
      {tab === "posts" && (userPosts.length === 0 ? <div className="py-16 text-center text-sm text-[#8A7F74]">No posts yet</div> : userPosts.map(p => <PostCard key={p.id} post={p} />))}
      {tab === "media" && <div className="grid grid-cols-3 gap-0.5">{userPosts.filter(p => p.media_urls).flatMap(p => Array.from({ length: p.media_urls?.length || 1 }).map((_, i) => <div key={`${p.id}-${i}`} className="aspect-square" style={{ background: u.gradient }} />))}</div>}
      {tab === "portfolio" && <div className="p-4 text-sm text-[#8A7F74]">Portfolio section</div>}
    </div>
  );
}
