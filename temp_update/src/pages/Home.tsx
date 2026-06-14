import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, ImageIcon, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { T, Avatar, PostCard, PostSkeleton, EmptyState } from '@/components/common';
import { CommentsModal } from '@/components/feed/CommentsModal';
import { CreatePostModal } from '@/components/feed/CreatePostModal';
import { CreateStoryModal } from '@/components/feed/CreateStoryModal';
import { toast } from 'sonner';
import type { Post, Story } from '@/types';

const PAGE = 20;

type FeedTab = 'foryou' | 'following';

// ─────────────────────────────────────────────
// STORIES ROW
// ─────────────────────────────────────────────

function StoriesRow({
  stories,
  onAddStory,
}: {
  stories: Story[];
  onAddStory: () => void;
}) {
  const { profile } = useAuth();
  const navigate    = useNavigate();
  const myStory     = stories.find(s => s.user_id === profile?.id);

  return (
    <div
      className="flex gap-3.5 overflow-x-auto px-4 py-3.5 no-scrollbar border-b"
      style={{ borderColor: '#2E2822' }}
    >
      {/* Add Story tile */}
      <button
        onClick={onAddStory}
        className="flex flex-shrink-0 flex-col items-center gap-1.5 group"
        aria-label="Add story"
      >
        <div className="relative">
          {myStory ? (
            <div className="story-ring h-[68px] w-[68px] rounded-full p-[2.5px]">
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-[#0F0D0B]">
                <Avatar profile={profile!} size={62} />
              </div>
            </div>
          ) : (
            <div
              className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 border-dashed transition group-hover:border-[#C8521A]"
              style={{ borderColor: '#2E2822' }}
            >
              <Avatar profile={profile!} size={56} />
            </div>
          )}
          <div
            className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 text-white"
            style={{ background: '#C8521A', borderColor: '#0F0D0B' }}
          >
            <Plus size={12} strokeWidth={3} />
          </div>
        </div>
        <span className="text-[10px] font-medium text-[#8A7F74] truncate max-w-[68px]">
          Your story
        </span>
      </button>

      {/* Other stories */}
      {stories
        .filter(s => s.user_id !== profile?.id && s.profiles)
        .map(story => (
          <button
            key={story.id}
            onClick={() => {}}
            className="flex flex-shrink-0 flex-col items-center gap-1.5"
          >
            <div className="story-ring h-[68px] w-[68px] rounded-full p-[2.5px]">
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-[#0F0D0B]">
                <Avatar profile={story.profiles!} size={62} />
              </div>
            </div>
            <span
              className="text-[10px] font-medium text-[#F5F0EA] truncate max-w-[68px]"
            >
              {(story.profiles?.display_name || story.profiles?.username || '').split(' ')[0]}
            </span>
          </button>
        ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// EMPTY FEED CTA
// ─────────────────────────────────────────────

function EmptyFollowing({ onDiscover }: { onDiscover: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border"
        style={{ background: '#1C1814', borderColor: '#2E2822' }}
      >
        <AlignLeft size={26} style={{ color: '#8A7F74' }} />
      </div>
      <h3 className="text-base font-semibold text-[#F5F0EA]">Your feed is quiet</h3>
      <p className="mt-1.5 text-sm text-[#8A7F74] max-w-[220px]">
        Follow people to see their posts here.
      </p>
      <button
        onClick={onDiscover}
        className="mt-5 rounded-full px-5 py-2 text-sm font-semibold text-white transition active:scale-95"
        style={{ background: '#C8521A' }}
      >
        Discover people
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────

export function Home() {
  const { profile }  = useAuth();
  const navigate     = useNavigate();
  const [tab, setTab] = useState<FeedTab>('foryou');

  const [stories,  setStories]  = useState<Story[]>([]);
  const [posts,    setPosts]    = useState<Post[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore,  setHasMore]  = useState(true);
  const pageRef = useRef(0);

  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [showCreatePost,  setShowCreatePost]  = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);

  // ── Fetch stories ──────────────────────────

  useEffect(() => {
    supabase
      .from('stories')
      .select('*, profiles!stories_user_id_fkey(*)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setStories(data as Story[]);
      });
  }, []);

  // ── Fetch feed ─────────────────────────────

  const fetchPosts = useCallback(async (page: number, replace = false) => {
    if (!profile) return;

    page === 0 ? setLoading(true) : setLoadingMore(true);

    try {
      let ids: string[] | null = null;

      if (tab === 'following') {
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', profile.id);
        ids = (follows ?? []).map((f: any) => f.following_id);
        if (ids.length === 0) {
          setPosts([]);
          setHasMore(false);
          return;
        }
      }

      let q = supabase
        .from('posts')
        .select('*, profiles!posts_user_id_fkey(*)')
        .order('created_at', { ascending: false })
        .range(page * PAGE, page * PAGE + PAGE - 1);

      if (ids) q = q.in('user_id', ids);

      const { data, error } = await q;
      if (error) throw error;

      const batch = (data ?? []) as Post[];

      // Check liked/saved status
      if (batch.length && profile) {
        const pids = batch.map(p => p.id);
        const [likes, saves] = await Promise.all([
          supabase.from('post_likes').select('post_id').eq('user_id', profile.id).in('post_id', pids),
          supabase.from('post_saves').select('post_id').eq('user_id', profile.id).in('post_id', pids),
        ]);
        const likedSet = new Set((likes.data ?? []).map((r: any) => r.post_id));
        const savedSet = new Set((saves.data ?? []).map((r: any) => r.post_id));
        const enriched = batch.map(p => ({ ...p, liked: likedSet.has(p.id), saved: savedSet.has(p.id) }));
        setPosts(prev => replace ? enriched : [...prev, ...enriched]);
      } else {
        setPosts(prev => replace ? batch : [...prev, ...batch]);
      }

      setHasMore(batch.length === PAGE);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [profile, tab]);

  // Reset on tab change
  useEffect(() => {
    pageRef.current = 0;
    setHasMore(true);
    fetchPosts(0, true);
  }, [tab, fetchPosts]);

  // ── Interactions ────────────────────────────

  const handleLike = async (postId: string, liked: boolean) => {
    if (!profile) return;
    // Optimistic update
    setPosts(prev => prev.map(p =>
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

  const handleSave = async (postId: string, saved: boolean) => {
    if (!profile) return;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, saved } : p));
    if (saved) {
      await supabase.from('post_saves').insert({ post_id: postId, user_id: profile.id });
    } else {
      await supabase.from('post_saves').delete().match({ post_id: postId, user_id: profile.id });
    }
  };

  const handleRepost = async (post: Post) => {
    if (!profile) return;
    const { error } = await supabase.from('posts').insert({
      user_id: profile.id,
      type: post.type,
      content: post.content,
      media_urls: post.media_urls,
      region: post.region,
      is_repost: true,
      original_post_id: post.id,
    });
    if (error) toast.error('Failed to repost');
    else toast.success('Reposted');
  };

  // ── Infinite scroll ─────────────────────────

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
        pageRef.current += 1;
        fetchPosts(pageRef.current);
      }
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loading, fetchPosts]);

  // ── Render ──────────────────────────────────

  return (
    <div className="pb-24">

      {/* Stories */}
      <StoriesRow
        stories={stories}
        onAddStory={() => setShowCreateStory(true)}
      />

      {/* Tab bar */}
      <div
        className="sticky top-14 z-20 flex border-b"
        style={{
          background: 'rgba(15,13,11,0.95)',
          backdropFilter: 'blur(16px)',
          borderColor: '#2E2822',
        }}
      >
        {(['foryou', 'following'] as FeedTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex-1 py-3 text-sm font-semibold transition"
            style={{ color: tab === t ? '#F5F0EA' : '#8A7F74' }}
          >
            {t === 'foryou' ? 'For You' : 'Following'}
            {tab === t && (
              <motion.span
                layoutId="feed-tab"
                className="absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full"
                style={{ background: '#C8521A' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Post composer shortcut */}
      {profile && (
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex w-full items-center gap-3 border-b px-4 py-3 transition hover:bg-[#1C1814]/50"
          style={{ borderColor: '#2E2822' }}
        >
          <Avatar profile={profile} size={38} />
          <div
            className="flex-1 rounded-full border px-4 py-2 text-left text-sm"
            style={{ background: '#1C1814', borderColor: '#2E2822', color: '#8A7F74' }}
          >
            What's happening in Namibia?
          </div>
          <div className="flex gap-2 text-[#8A7F74]">
            <ImageIcon size={18} strokeWidth={1.7} />
          </div>
        </button>
      )}

      {/* Feed */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)
          ) : posts.length === 0 && tab === 'following' ? (
            <EmptyFollowing onDiscover={() => navigate('/explore')} />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<AlignLeft size={24} color="#8A7F74" />}
              title="Nothing here yet"
              subtitle="Be the first to post something."
            />
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={liked => handleLike(post.id, liked)}
                onSave={saved => handleSave(post.id, saved)}
                onRepost={() => handleRepost(post)}
                onComment={() => setCommentPostId(post.id)}
                onProfile={userId => navigate(`/profile/${userId}`)}
                isOwn={post.user_id === profile?.id}
                onDelete={async () => {
                  await supabase.from('posts').delete().eq('id', post.id);
                  setPosts(prev => prev.filter(p => p.id !== post.id));
                  toast.success('Post deleted');
                }}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading more spinner */}
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-[#C8521A]"
            style={{ borderTopColor: 'transparent' }}
          />
        </div>
      )}

      {/* End of feed */}
      {!hasMore && posts.length > 0 && (
        <p className="py-8 text-center text-xs text-[#8A7F74]">
          You're all caught up ·{' '}
          <button onClick={() => fetchPosts(0, true)} className="underline">
            Refresh
          </button>
        </p>
      )}

      {/* Modals */}
      {commentPostId && (
        <CommentsModal
          postId={commentPostId}
          onClose={() => setCommentPostId(null)}
        >
          {null}
        </CommentsModal>
      )}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => {
            setShowCreatePost(false);
            fetchPosts(0, true);
          }}
        />
      )}
      {showCreateStory && (
        <CreateStoryModal
          open={showCreateStory}
          onOpenChange={setShowCreateStory}
        />
      )}
    </div>
  );
}
