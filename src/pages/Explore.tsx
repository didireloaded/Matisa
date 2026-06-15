import { useState, useEffect } from "react";
import { Search, X, TrendingUp, MapPin, Users, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { CommentsModal } from "@/components/feed/CommentsModal";
import type { Post, Profile } from "@/types";
import { RichPostCard } from "@/components/feed/RichPostCard";
import { RankingAI, SearchAI } from "@/services/ai";
import { USERS } from "@/data/dummy";
import { FollowButton } from "@/components/common/FollowButton";

const TRENDING = [
  { tag: "#NamibiaRising", posts: "12.4K" },
  { tag: "#WindhoekNights", posts: "8.7K" },
  { tag: "#KatuturaStyle", posts: "5.2K" },
  { tag: "#AfrobeatsNAM", posts: "4.9K" },
  { tag: "#SossusRave2025", posts: "3.1K" },
  { tag: "#NamCulture", posts: "2.8K" },
];

export function Explore() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  // Search data
  const [searchProfiles, setSearchProfiles] = useState<Profile[]>([]);
  const [searchPosts, setSearchPosts] = useState<Post[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Discovery data
  const [trending, setTrending] = useState<Post[]>([]);
  const [loadingDisc, setLoadingDisc] = useState(true);

  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  // Load feed
  useEffect(() => {
    async function loadFeed() {
      setLoadingDisc(true);
      try {
        const { data: postsData, error } = await supabase
          .from("posts")
          .select("*, profiles!posts_user_id_fkey(*)")
          .order("created_at", { ascending: false })
          .limit(40);

        if (error) throw error;
        if (!postsData) return;

        const finalPosts = postsData as Post[];

        if (profile) {
          try {
            const rankedIds = await RankingAI.getPersonalizedFeed(profile.id);
            if (rankedIds && rankedIds.length > 0) {
              finalPosts.sort((a, b) => {
                const aIdx = rankedIds.indexOf(a.id);
                const bIdx = rankedIds.indexOf(b.id);
                return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
              });
            }
          } catch (aiErr) {
            console.error("AI ranking failed, falling back to chronological", aiErr);
          }
        }
        setTrending(finalPosts.slice(0, 20));
      } catch (err) {
        console.error("Error loading algorithmic feed:", err);
      } finally {
        setLoadingDisc(false);
      }
    }
    loadFeed();
  }, [profile]);

  // Search logic
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchProfiles([]);
      setSearchPosts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const aiSearch = await SearchAI.search(query, profile?.id);

        if (aiSearch && aiSearch.results && aiSearch.results.length > 0) {
          setSearchProfiles(aiSearch.results as Profile[]);

          if (aiSearch.ai_intent?.intent_category?.includes("post") || aiSearch.ai_intent?.expanded_terms) {
            const terms = [query, ...(aiSearch.ai_intent.expanded_terms || [])];
            const orQuery = terms.map((t) => `content.ilike.%${t.replace(/[,"%]/g, "")}%`).join(",");
            const { data: pData } = await supabase
              .from("posts")
              .select("*, profiles!posts_user_id_fkey(*)")
              .or(orQuery)
              .order("created_at", { ascending: false })
              .limit(10);
            setSearchPosts((pData ?? []) as Post[]);
          } else {
            setSearchPosts([]);
          }
        } else {
          const [pRes, postRes] = await Promise.all([
            supabase.from("profiles").select("*").or(`username.ilike.%${query.replace(/[,"%]/g, "")}%,display_name.ilike.%${query.replace(/[,"%]/g, "")}%`).limit(5),
            supabase.from("posts").select("*, profiles!posts_user_id_fkey(*)").ilike("content", `%${query}%`).order("created_at", { ascending: false }).limit(10),
          ]);
          setSearchProfiles((pRes.data ?? []) as Profile[]);
          setSearchPosts((postRes.data ?? []) as Post[]);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, profile]);

  const handleLike = async (postId: string, liked: boolean) => {
    if (!profile) return;
    setTrending((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, liked, like_count: (p.like_count ?? 0) + (liked ? 1 : -1) } : p,
      ),
    );
    if (liked) {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: profile.id });
    } else {
      await supabase.from("post_likes").delete().match({ post_id: postId, user_id: profile.id });
    }
  };

  return (
    <div className="min-h-full pb-28">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search people, notes, events…"
            className="w-full bg-[#1a1a1a] text-white placeholder:text-white/30 rounded-2xl pl-10 pr-10 py-3 text-sm outline-none border border-white/5 focus:border-[#FF9D2E]/30 transition"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X size={14} className="text-white/40" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {query ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4">
            {searchLoading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#FF9D2E] border-t-transparent animate-spin" />
              </div>
            ) : searchProfiles.length === 0 && searchPosts.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <Search size={32} className="mb-3 text-white/20" />
                <p className="text-white/40 text-sm">No results for "{query}"</p>
              </div>
            ) : (
              <div>
                {searchProfiles.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[11px] uppercase tracking-widest text-white/30 mb-3">People</p>
                    {searchProfiles.map((u) => (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 py-3 border-b border-white/5 cursor-pointer"
                        onClick={() => navigate(`/profile/${u.id}`)}
                      >
                        <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                          {u.avatar_url && <ImageWithFallback src={u.avatar_url} alt={u.display_name || u.username} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm flex items-center gap-1 font-bold">
                            {u.display_name || u.username}
                          </div>
                          <div className="text-white/40 text-xs">@{u.username}</div>
                        </div>
                        <FollowButton userId={u.id} variant="glass" className="px-4 py-1.5 rounded-full text-xs font-bold" />
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {searchPosts.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-white/30 mb-3">Posts</p>
                    {searchPosts.map((post) => (
                      <RichPostCard key={post.id} post={post} onLike={(liked) => handleLike(post.id, liked)} onComment={() => setCommentPostId(post.id)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Trending */}
            <div className="px-4 mb-6 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-[#FF9D2E]" />
                <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold">Trending in Namibia</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TRENDING.map((t, i) => (
                  <motion.button
                    key={t.tag}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setQuery(t.tag)}
                    className="bg-[#151515] border border-white/5 rounded-2xl p-3 text-left hover:border-[#FF9D2E]/20 transition"
                  >
                    <p className="text-white text-sm mb-1 font-bold">{t.tag}</p>
                    <p className="text-white/40 text-xs">{t.posts} notes</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* People to follow */}
            <div className="px-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-[#A855F7]" />
                <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold">Who to follow</span>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {USERS.slice(1).map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-[#151515] border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 flex-shrink-0 w-[140px]"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      <ImageWithFallback src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center">
                      <p className="text-white text-xs leading-tight font-bold">{u.name}</p>
                      <p className="text-white/40 text-[10px]">@{u.username}</p>
                    </div>
                    <div className="text-white/40 text-[10px] flex items-center gap-1">
                      <MapPin size={10} />
                      {u.location.split(",")[0]}
                    </div>
                    <FollowButton userId={u.id} variant="secondary" className="w-full py-1.5 rounded-full text-xs font-bold" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Discovery grid vs Posts Feed */}
            <div className="px-4 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold">✦ Discover</span>
              </div>
              
              {loadingDisc ? (
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-lg" />)}
                </div>
              ) : trending.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {trending.map(post => (
                    <RichPostCard
                      key={post.id}
                      post={post}
                      onLike={(liked) => handleLike(post.id, liked)}
                      onComment={() => setCommentPostId(post.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {[
                    "https://images.unsplash.com/photo-1528508670332-4c687dae6295?w=300&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1606416132922-22ab37c1231e?w=300&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1689864727821-e47577e88226?w=300&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1488197047962-b48492212cda?w=300&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1770283553838-769c5f97d55c?w=300&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1731662784037-9b2f21819caa?w=300&h=300&fit=crop",
                  ].map((src, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`overflow-hidden rounded-lg ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                      style={{ aspectRatio: i === 0 ? "1" : "1" }}
                    >
                      <ImageWithFallback
                        src={src}
                        alt=""
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments modal */}
      {commentPostId && (
        <CommentsModal postId={commentPostId} onClose={() => setCommentPostId(null)}>
          {null}
        </CommentsModal>
      )}
    </div>
  );
}
