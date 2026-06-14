import { useState, useEffect } from "react";
import {
  Search,
  X,
  TrendingUp,
  CalendarDays,
  MapPin,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  Mic,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Avatar, PostSkeleton } from "@/components/common";
import { CommentsModal } from "@/components/feed/CommentsModal";
import { toast } from "sonner";
import type { Post, Profile } from "@/types";
import { RichPostCard } from "@/components/feed/RichPostCard";
import { useEvents, type Event } from "@/hooks/useEvents";
import { RankingAI, SearchAI } from "@/services/ai";

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// SEARCH RESULTS
// ─────────────────────────────────────────────

function SearchResults({
  query,
  profiles,
  posts,
  loading,
  onProfile,
}: {
  query: string;
  profiles: Profile[];
  posts: Post[];
  loading: boolean;
  onProfile: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
              <div className="h-2 w-20 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!profiles.length && !posts.length) {
    return (
      <div className="flex flex-col items-center py-16 text-center px-8">
        <Search size={32} className="mb-3 text-white/30" />
        <p className="text-sm text-white/50">No results for "{query}"</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {profiles.length > 0 && (
        <div className="mb-6">
          <h3 className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">
            People
          </h3>
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => onProfile(p.id)}
              className="flex w-full items-center gap-3 px-6 py-3 hover:bg-white/5 transition"
            >
              <Avatar profile={p} size={44} />
              <div className="min-w-0 flex-1 text-left">
                <div className="text-sm font-semibold text-white">
                  {p.display_name || p.full_name}
                </div>
                <div className="text-xs text-white/50">@{p.username}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <div className="px-6">
          <h3 className="py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-2">
            Posts
          </h3>
          {posts.map((post) => (
            <RichPostCard key={post.id} post={post} onLike={() => {}} onComment={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// EXPLORE PAGE
// ─────────────────────────────────────────────

const EXPLORE_TABS = ["For You", "Notes", "Music", "Events", "Groups"];

export function Explore() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState(false);
  const [activeTab, setActiveTab] = useState("For You");

  // Discovery data
  const [trending, setTrending] = useState<Post[]>([]);
  const [loadingDisc, setLoadingDisc] = useState(true);

  // Search data
  const [searchProfiles, setSearchProfiles] = useState<Profile[]>([]);
  const [searchPosts, setSearchPosts] = useState<Post[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const { events, isLoading: eventsLoading } = useEvents();

  // ── Load discovery (Algorithmic For You Feed) ──────────────
  useEffect(() => {
    async function loadFeed() {
      setLoadingDisc(true);
      try {
        // 1. Fetch candidate posts (larger pool to score)
        const { data: postsData, error } = await supabase
          .from("posts")
          .select("*, profiles!posts_user_id_fkey(*)")
          .order("created_at", { ascending: false })
          .limit(40);

        if (error) throw error;
        if (!postsData) return;

        // 2. Client-side AI Ranking Algorithm
        const finalPosts = postsData as Post[];

        if (profile) {
          try {
            // Invisible AI: Rank the feed
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

  // ── Search ─────────────────────────────────
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchProfiles([]);
      setSearchPosts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        // 1. AI Smart Search
        const aiSearch = await SearchAI.search(query, profile?.id);

        // If AI returns results, use them
        if (aiSearch && aiSearch.results && aiSearch.results.length > 0) {
          setSearchProfiles(aiSearch.results as Profile[]);

          // Fetch posts based on AI expanded terms
          if (
            aiSearch.ai_intent?.intent_category?.includes("post") ||
            aiSearch.ai_intent?.expanded_terms
          ) {
            const terms = [query, ...(aiSearch.ai_intent.expanded_terms || [])];
            // Build an OR query like `content.ilike.%term1%,content.ilike.%term2%`
            const orQuery = terms
              .map((t) => `content.ilike.%${t.replace(/[,"%]/g, "")}%`)
              .join(",");
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
          // Fallback to strict DB search if AI is unavailable
          const [pRes, postRes] = await Promise.all([
            supabase
              .from("profiles")
              .select("*")
              .or(
                `username.ilike.%${query.replace(/[,"%]/g, "")}%,display_name.ilike.%${query.replace(/[,"%]/g, "")}%`,
              )
              .limit(5),
            supabase
              .from("posts")
              .select("*, profiles!posts_user_id_fkey(*)")
              .ilike("content", `%${query}%`)
              .order("created_at", { ascending: false })
              .limit(10),
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
    <div className="min-h-full pb-28 bg-background text-foreground">
      {/* Top Search Bar */}
      <div className="sticky top-0 z-20 px-6 pt-4 pb-4 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 border border-white/10 focus-within:border-white/30 transition-colors">
          <Search size={18} className="text-white/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setActiveSearch(true)}
            onBlur={() => setActiveSearch(false)}
            placeholder="Explore content, hashtags, places..."
            className="flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/40"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={16} className="text-white/50 hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {query.trim().length >= 2 ? (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SearchResults
              query={query}
              profiles={searchProfiles}
              posts={searchPosts}
              loading={searchLoading}
              onProfile={(id) => navigate(`/profile/${id}`)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Explore Tabs */}
            <div className="px-6 py-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-4">
                {EXPLORE_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap text-lg font-bold transition-colors ${
                      activeTab === tab ? "text-white" : "text-white/30 hover:text-white/60"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Karaoke Rooms Banner */}
            <div className="px-6 mb-8 mt-2">
              <div
                className="w-full rounded-[24px] bg-gradient-to-r from-secondary to-primary p-5 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => navigate("/room/lobby")}
              >
                <div>
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                    Live Karaoke{" "}
                    <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">
                      Live
                    </span>
                  </h3>
                  <p className="text-xs text-white/80">3 rooms active right now</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Main Content Feed */}
            <div className="px-6 flex flex-col">
              {loadingDisc ? (
                <div className="space-y-6">
                  <div className="w-full aspect-[4/5] bg-white/5 rounded-[32px] animate-pulse" />
                  <div className="w-full aspect-[4/5] bg-white/5 rounded-[32px] animate-pulse" />
                </div>
              ) : trending.length === 0 ? (
                <div className="py-16 text-center">
                  <TrendingUp size={32} className="mx-auto mb-4 text-white/20" />
                  <h3 className="text-lg font-bold mb-2">Nothing trending yet</h3>
                  <p className="text-sm text-white/50">Be the first to create amazing content.</p>
                </div>
              ) : (
                trending.map((post) => (
                  <RichPostCard
                    key={post.id}
                    post={post}
                    onLike={(liked) => handleLike(post.id, liked)}
                    onComment={() => setCommentPostId(post.id)}
                  />
                ))
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
