import { useState, useEffect } from 'react';
import { Search, X, TrendingUp, CalendarDays, MapPin, Heart, MessageCircle, Bookmark, Send, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar, PostSkeleton, EmptyState } from '@/components/common';
import { CommentsModal } from '@/components/feed/CommentsModal';
import { toast } from 'sonner';
import type { Post, Profile } from '@/types';
import { useEvents, type Event } from '@/hooks/useEvents';

// ─────────────────────────────────────────────
// RICH POST CARD (From Phase 10 Initial Request)
// ─────────────────────────────────────────────

function RichPostCard({ post, onLike, onComment }: { 
  post: Post & { profiles?: any }; 
  onLike: (liked: boolean) => void;
  onComment: () => void;
}) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likes, setLikes] = useState(post.like_count ?? 0);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes(prev => newLiked ? prev + 1 : prev - 1);
    onLike(newLiked);
  };

  return (
    <div className="relative w-full rounded-[32px] overflow-hidden bg-gradient-to-tr from-card to-background aspect-[4/5] shadow-2xl mb-6">
      {/* Background Media Placeholder (If post has media, use it, else generic gradient) */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-secondary/40 mix-blend-overlay opacity-60" />
      
      {/* Content Text (Centered/Stylized for text-only posts, or caption for media) */}
      <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none z-0">
        <p className="text-white text-xl font-medium text-center leading-relaxed drop-shadow-md">
          {post.content}
        </p>
      </div>
      
      {/* Post Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Avatar profile={post.profiles} size={40} />
          <div className="flex flex-col">
            <span className="font-bold text-white shadow-sm text-sm">
              {post.profiles?.display_name || post.profiles?.full_name || 'Anonymous'}
            </span>
            <span className="text-[10px] text-white/70">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="absolute right-4 bottom-8 flex flex-col items-center gap-6 z-10 bg-white/10 backdrop-blur-md rounded-full py-6 px-3 border border-white/20">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <Heart className={`w-6 h-6 transition ${liked ? 'fill-primary text-primary' : 'text-white group-hover:fill-white/50'}`} />
          <span className="text-[10px] font-medium text-white/90">{likes}</span>
        </button>
        <button onClick={onComment} className="flex flex-col items-center gap-1 group">
          <MessageCircle className="w-6 h-6 text-white group-hover:fill-white/50 transition" />
          <span className="text-[10px] font-medium text-white/90">{post.comment_count ?? 0}</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <Bookmark className="w-6 h-6 text-white group-hover:fill-white/50 transition" />
          <span className="text-[10px] font-medium text-white/90">Save</span>
        </button>
        <button className="flex flex-col items-center gap-1 group mt-2">
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

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
        {[0,1,2].map(i => (
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
          {profiles.map(p => (
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
          {posts.map(post => (
            <RichPostCard
              key={post.id}
              post={post}
              onLike={() => {}}
              onComment={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// EXPLORE PAGE
// ─────────────────────────────────────────────

const EXPLORE_TABS = ['For You', 'Notes', 'Music', 'Events', 'Groups'];

export function Explore() {
  const { profile } = useAuth();
  const navigate    = useNavigate();

  const [query,    setQuery]    = useState('');
  const [activeSearch, setActiveSearch] = useState(false);
  const [activeTab, setActiveTab] = useState('For You');

  // Discovery data
  const [trending, setTrending]     = useState<Post[]>([]);
  const [loadingDisc, setLoadingDisc] = useState(true);

  // Search data
  const [searchProfiles, setSearchProfiles] = useState<Profile[]>([]);
  const [searchPosts,    setSearchPosts]    = useState<Post[]>([]);
  const [searchLoading,  setSearchLoading]  = useState(false);

  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const { events, isLoading: eventsLoading } = useEvents();

  // ── Load discovery ──────────────────────────
  useEffect(() => {
    if (!profile) {
      setLoadingDisc(false);
      return;
    }
    setLoadingDisc(true);

    supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(*)')
      .gt('created_at', new Date(Date.now() - 72 * 3600 * 1000).toISOString())
      .order('like_count', { ascending: false })
      .limit(10)
      .then((res) => {
        if (res.data) setTrending(res.data as Post[]);
        setLoadingDisc(false);
      });
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
      const [pRes, postRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${query.replace(/[,"%]/g, '')}%,display_name.ilike.%${query.replace(/[,"%]/g, '')}%`)
          .limit(5),
        supabase
          .from('posts')
          .select('*, profiles!posts_user_id_fkey(*)')
          .ilike('content', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);
      setSearchProfiles((pRes.data ?? []) as Profile[]);
      setSearchPosts((postRes.data ?? []) as Post[]);
      setSearchLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleLike = async (postId: string, liked: boolean) => {
    if (!profile) return;
    setTrending(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked, like_count: (p.like_count ?? 0) + (liked ? 1 : -1) }
        : p
    ));
    if (liked) {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: profile.id });
    } else {
      await supabase.from('post_likes').delete().match({ post_id: postId, user_id: profile.id });
    }
  };

  return (
    <div className="min-h-full pb-32 bg-background text-foreground">
      
      {/* Top Search Bar */}
      <div className="sticky top-0 z-20 px-6 pt-14 pb-4 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 border border-white/10 focus-within:border-white/30 transition-colors">
          <Search size={18} className="text-white/50" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setActiveSearch(true)}
            onBlur={() => setActiveSearch(false)}
            placeholder="Explore content, hashtags, places..."
            className="flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/40"
          />
          {query && (
            <button onClick={() => setQuery('')}>
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
              onProfile={id => navigate(`/profile/${id}`)}
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
                {EXPLORE_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap text-lg font-bold transition-colors ${
                      activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Karaoke Rooms Banner */}
            <div className="px-6 mb-8 mt-2">
              <div className="w-full rounded-[24px] bg-gradient-to-r from-secondary to-primary p-5 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                   onClick={() => navigate('/room/lobby')}>
                <div>
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                    Live Karaoke <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">Live</span>
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
                trending.map(post => (
                  <RichPostCard
                    key={post.id}
                    post={post}
                    onLike={liked => handleLike(post.id, liked)}
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
