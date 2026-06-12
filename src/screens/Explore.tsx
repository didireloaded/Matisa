import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { usePosts } from "../lib/api/posts";
import { Search, Flame, Mic, Play, Heart, MessageCircle as CommentIcon, Repeat2, Bookmark, Share2, MoreHorizontal, MapPin } from "lucide-react";
import type { Post } from "../data/types";
import { POSTS, ME_ID, getProfile, fmt, TRENDING_TAGS } from "../data/mock";

const T = { bg: "#0F0D0B", surface: "#1C1814", s2: "#221D18", border: "#2E2822", text: "#F5F0EA", muted: "#8A7F74", primary: "#C8521A", sand: "#E8A055", sky: "#2D7DD2", success: "#4CAF7D" };

// --- Inline Components ---

const Verified = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-[#2D7DD2] fill-current ml-0.5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.5 12.536V11.464C22.5 10.638 21.848 9.948 21.026 9.873L19.261 9.711C18.966 9.684 18.704 9.531 18.528 9.296L17.481 7.904C16.989 7.248 16.096 7.026 15.344 7.37L13.729 8.113C13.46 8.236 13.155 8.236 12.886 8.113L11.271 7.37C10.519 7.026 9.626 7.248 9.134 7.904L8.087 9.296C7.911 9.531 7.649 9.684 7.354 9.711L5.589 9.873C4.767 9.948 4.115 10.638 4.115 11.464V12.536C4.115 13.362 4.767 14.052 5.589 14.127L7.354 14.289C7.649 14.316 7.911 14.469 8.087 14.704L9.134 16.096C9.626 16.752 10.519 16.974 11.271 16.63L12.886 15.887C13.155 15.764 13.46 15.764 13.729 15.887L15.344 16.63C16.096 16.974 16.989 16.752 17.481 16.096L18.528 14.704C18.704 14.469 18.966 14.316 19.261 14.289L21.026 14.127C21.848 14.052 22.5 13.362 22.5 12.536Z"/>
    <path d="M10.5 12L11.5 13L14.5 10" stroke="#0F0D0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Badge = ({ children, tone = "primary", className = "" }: { children: React.ReactNode; tone?: string; className?: string }) => {
  const bg = tone === "primary" ? "bg-[#C8521A]/15 text-[#C8521A]" : "bg-[#2E2822] text-[#8A7F74]";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${bg} ${className}`}>
      {children}
    </span>
  );
};

const Avatar = ({ profile, size = 42, online, ring }: { profile: any; size?: number; online?: boolean; ring?: boolean }) => (
  <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
    <img 
      src={profile.avatar_url} 
      alt={profile.username}
      className="rounded-full object-cover w-full h-full bg-[#2E2822]"
      style={ring ? { padding: 2, border: `2px solid #C8521A` } : {}}
    />
    {online && (
      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#4CAF7D] border-2 border-[#0F0D0B]" />
    )}
  </div>
);

const PostCard = ({ post }: { post: Post }) => {
  const navigate = useNavigate();
  const author = getProfile(post.user_id);
  const [liked, setLiked] = useState(!!post.liked);
  const [saved, setSaved] = useState(!!post.saved);
  const [likes, setLikes] = useState(post.likes_count);
  
  if (!author) return null;

  return (
    <article className="border-b border-[#2E2822] px-4 py-4 cursor-pointer hover:bg-[#1C1814]/30 transition-colors" onClick={() => navigate(`/post/${post.id}`)}>
      <div className="flex gap-3">
        <button onClick={(e) => { e.stopPropagation(); navigate(`/profile/${author.id}`); }} className="self-start">
          <Avatar profile={author} size={42} online={author.online} />
        </button>
        
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <button 
              className="min-w-0 flex-1 text-left"
              onClick={(e) => { e.stopPropagation(); navigate(`/profile/${author.id}`); }}
            >
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="font-semibold text-[#F5F0EA] truncate">{author.full_name}</span>
                {author.is_verified && <Verified size={14} />}
                {author.is_plus && <span className="rounded-full bg-[#E8A055]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#E8A055]">PLUS</span>}
                <span className="text-[#8A7F74]">·</span>
                <span className="text-[#8A7F74] text-xs">{post.created_at}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-[#8A7F74] truncate">@{author.username}</span>
                {post.region && (
                  <Badge tone="primary" className="flex-shrink-0">
                    <MapPin size={9} /> {post.region}
                  </Badge>
                )}
              </div>
            </button>
            <button className="text-[#8A7F74] hover:text-[#F5F0EA] flex-shrink-0 transition-colors" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Content */}
          {post.content && (
            <p className="mt-2 text-[14px] leading-relaxed text-[#F5F0EA] whitespace-pre-wrap break-words">
              {post.content}
            </p>
          )}

          {/* Media Grid */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className={`mt-3 grid gap-0.5 overflow-hidden rounded-2xl border border-[#2E2822] ${post.media_urls.length === 1 ? "grid-cols-1" : post.media_urls.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
              {post.media_urls.slice(0, 4).map((_, i) => (
                <div 
                  key={i} 
                  className={`relative aspect-[4/3] ${post.media_urls!.length === 3 && i === 0 ? "row-span-2 aspect-auto" : ""}`} 
                  style={{ background: ["linear-gradient(135deg,#C8521A,#6B2D1A)", "linear-gradient(135deg,#2D7DD2,#1A3A60)", "linear-gradient(135deg,#E8A055,#8B5A1A)", "linear-gradient(135deg,#4CAF7D,#1A5C3A)"][i % 4] }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />
                  {post.type === "video" && i === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                        <Play size={16} fill="white" color="white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Voice Player */}
          {post.type === "voice" && post.voice_duration && (
            <div 
              className="mt-3 flex items-center gap-2.5 rounded-2xl border border-[#2E2822] bg-[#221D18] px-3 py-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C8521A] text-white hover:bg-[#E8A055] transition-colors">
                <Play size={12} fill="white" color="white" />
              </button>
              <div className="flex flex-1 items-center gap-[2px]">
                {Array.from({ length: 28 }).map((_, i) => (
                  <span 
                    key={i} 
                    className="rounded-full bg-[#C8521A] transition-opacity" 
                    style={{ width: 2, height: 4 + Math.abs(Math.sin(i * 1.4 + 0.3)) * 16, opacity: i < 11 ? 1 : 0.3 }} 
                  />
                ))}
              </div>
              <span className="flex-shrink-0 text-[10px] font-medium text-[#8A7F74]">
                0:{String(post.voice_duration).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between text-[#8A7F74]">
            <button 
              onClick={(e) => { e.stopPropagation(); setLiked(l => !l); setLikes(c => liked ? c - 1 : c + 1); }} 
              className={`flex items-center gap-1.5 text-xs font-medium transition ${liked ? "text-[#C8521A]" : "hover:text-[#C8521A]"}`}
            >
              <Heart size={18} fill={liked ? "#C8521A" : "none"} />
              <span>{fmt(likes)}</span>
            </button>
            <div className="flex items-center gap-1">
              <button 
                className="flex items-center gap-1.5 text-xs font-medium hover:text-[#2D7DD2] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <CommentIcon size={18} />
                <span>{fmt(post.comments_count)}</span>
              </button>
              <button 
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-[#2D7DD2]/10 hover:text-[#2D7DD2] ml-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Mic size={14} />
              </button>
            </div>
            <button 
              className="flex items-center gap-1.5 text-xs font-medium hover:text-[#4CAF7D] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Repeat2 size={18} />
              <span>{fmt(post.reposts_count)}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setSaved(s => !s) }} 
              className={`flex items-center gap-1.5 text-xs font-medium transition ${saved ? "text-[#E8A055]" : "hover:text-[#E8A055]"}`}
            >
              <Bookmark size={18} fill={saved ? "#E8A055" : "none"} />
              <span>{fmt(post.saves_count)}</span>
            </button>
            <button 
              className="hover:text-[#F5F0EA] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export function Explore() {
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");
  const { data: posts, isLoading } = usePosts();
  
  // Filter for 'following' tab mock (just pick some random subset or all for now)
  const displayPosts = activeTab === "following" ? (posts || []).filter(p => ["u_tangeni","u_didi",ME_ID].includes(p.user_id)) : (posts || []);

  return (
    <div className="min-h-screen bg-[#0F0D0B] pb-24">
      {/* 1. SEARCH BAR */}
      <div className="sticky top-[60px] z-10 px-4 py-2 bg-[#0F0D0B]/90 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A7F74]" />
          <input 
            type="text" 
            placeholder="Search discussions, tags, people..." 
            className="w-full bg-[#1C1814] border border-[#2E2822] text-[#F5F0EA] rounded-2xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#C8521A] transition-colors placeholder-[#8A7F74]"
          />
        </div>
      </div>

      {/* 2. TRENDING TOPICS */}
      <div className="pt-2 pb-4">
        <div className="px-4 mb-2 flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#C8521A]" />
          <h2 className="text-[#F5F0EA] font-display font-bold text-sm tracking-wide">Trending Discussions</h2>
        </div>
        <div className="flex overflow-x-auto no-scrollbar px-4 pb-2 gap-2 hide-scrollbar">
          {TRENDING_TAGS.map((tag) => (
            <button 
              key={tag}
              className="whitespace-nowrap px-4 py-1.5 rounded-full bg-[#1C1814] border border-[#2E2822] text-[#F5F0EA] text-sm font-medium hover:border-[#C8521A] transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. FEED TABS */}
      <div className="sticky top-[120px] z-10 flex border-b border-[#2E2822] bg-[#0F0D0B]/90 backdrop-blur-md">
        <button 
          className="flex-1 py-3 text-sm font-bold relative transition-colors"
          onClick={() => setActiveTab("foryou")}
        >
          <span className={activeTab === "foryou" ? "text-[#F5F0EA]" : "text-[#8A7F74]"}>For You</span>
          {activeTab === "foryou" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#C8521A] rounded-t-full" />
          )}
        </button>
        <button 
          className="flex-1 py-3 text-sm font-bold relative transition-colors"
          onClick={() => setActiveTab("following")}
        >
          <span className={activeTab === "following" ? "text-[#F5F0EA]" : "text-[#8A7F74]"}>Following</span>
          {activeTab === "following" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#C8521A] rounded-t-full" />
          )}
        </button>
      </div>

      {/* 4. POST FEED */}
      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8521A] border-t-transparent" />
          </div>
        ) : (
          displayPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
        
        {!isLoading && displayPosts.length === 0 && (
          <div className="p-8 text-center text-[#8A7F74]">
            No posts found.
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 right-4 z-20 flex flex-col gap-3">
        <button className="w-14 h-14 bg-[#221D18] border border-[#2E2822] rounded-full flex items-center justify-center text-[#C8521A] shadow-lg hover:bg-[#2E2822] transition-colors">
          <Mic className="w-6 h-6" />
        </button>
        <button className="w-14 h-14 bg-[#C8521A] rounded-full flex items-center justify-center text-[#F5F0EA] shadow-lg shadow-[#C8521A]/20 hover:bg-[#E8A055] transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
    </div>
  );
}
