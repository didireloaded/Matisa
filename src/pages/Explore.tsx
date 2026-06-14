import { useState, useEffect } from 'react';
import { Search, X, TrendingUp, Users, CalendarDays, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { T, Avatar, PostCard, PostSkeleton, EmptyState } from '@/components/common';
import { CommentsModal } from '@/components/feed/CommentsModal';
import { toast } from 'sonner';
import { fmtCount, timeAgo } from '@/types';
import type { Post, Profile } from '@/types';
import { useEvents, type Event } from '@/hooks/useEvents';

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
            <div className="h-10 w-10 rounded-full skeleton flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded skeleton" />
              <div className="h-2 w-20 rounded skeleton" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!profiles.length && !posts.length) {
    return (
      <div className="flex flex-col items-center py-16 text-center px-8">
        <Search size={32} color="#8A7F74" className="mb-3 opacity-50" />
        <p className="text-sm text-[#8A7F74]">No results for "{query}"</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {profiles.length > 0 && (
        <div>
          <h3 className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#8A7F74]">
            People
          </h3>
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => onProfile(p.id)}
              className="flex w-full items-center gap-3 px-4 py-3 hover:bg-[#1C1814] transition"
            >
              <Avatar profile={p} size={44} />
              <div className="min-w-0 flex-1 text-left">
                <div className="text-sm font-semibold text-[#F5F0EA]">
                  {p.display_name || p.full_name}
                </div>
                <div className="text-xs text-[#8A7F74]">@{p.username}</div>
              </div>
              {p.region && (
                <span className="text-[10px] text-[#8A7F74]">{p.region}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <div>
          <h3 className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#8A7F74] border-t" style={{ borderColor: '#2E2822' }}>
            Posts
          </h3>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => {}}
              onSave={() => {}}
              onRepost={() => {}}
              onComment={() => {}}
              onProfile={onProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PEOPLE CARD
// ─────────────────────────────────────────────

function PeopleCard({ profile, onFollow, onProfile }: {
  profile: Profile & { is_following?: boolean };
  onFollow: (id: string) => void;
  onProfile: (id: string) => void;
}) {
  const [following, setFollowing] = useState(!!profile.is_following);

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowing(f => !f);
    onFollow(profile.id);
  };

  return (
    <div
      className="w-44 flex-shrink-0 overflow-hidden rounded-2xl border"
      style={{ background: '#1C1814', borderColor: '#2E2822' }}
    >
      {/* Cover gradient */}
      <div
        className="h-14 relative"
        style={{ background: profile.gradient ?? 'linear-gradient(135deg,#C8521A,#6B2D1A)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1814] to-transparent" />
      </div>

      {/* Content */}
      <div className="px-3 pb-3 -mt-7">
        <button onClick={() => onProfile(profile.id)} className="block">
          <Avatar profile={profile} size={48} />
        </button>
        <div className="mt-2 min-w-0">
          <button
            onClick={() => onProfile(profile.id)}
            className="text-sm font-semibold text-[#F5F0EA] truncate block"
          >
            {profile.display_name || profile.full_name}
          </button>
          <span className="text-[10px] text-[#8A7F74] truncate block">
            @{profile.username}
          </span>
          <p className="mt-1 text-[10px] text-[#8A7F74]">
            {profile.region} · {fmtCount((profile.follower_count ?? profile.followers_count) ?? 0)} followers
          </p>
        </div>
        <button
          onClick={handleFollow}
          className="mt-3 w-full rounded-full py-1.5 text-[11px] font-semibold transition active:scale-95"
          style={{
            background: following ? 'transparent' : '#C8521A',
            color: following ? '#8A7F74' : 'white',
            border: following ? '1px solid #2E2822' : 'none',
          }}
        >
          {following ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EVENT CARD (compact)
// ─────────────────────────────────────────────

function EventRow({ event, onNavigate }: { event: Event; onNavigate: () => void }) {
  const badge =
    event.event_type === 'karaoke'   ? '🎤 Karaoke'
    : event.event_type === 'virtual' ? '🌐 Virtual'
    : '📍 In Person';

  return (
    <button
      onClick={onNavigate}
      className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition hover:border-[#C8521A]/30"
      style={{ background: '#1C1814', borderColor: '#2E2822' }}
    >
      {/* Cover or gradient */}
      <div
        className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ background: 'linear-gradient(135deg,#C8521A,#6B2D1A)' }}
      >
        {event.cover_url ? (
          <img src={event.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <CalendarDays size={22} color="white" opacity={0.8} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#F5F0EA] truncate">{event.title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#8A7F74]">
          <CalendarDays size={11} />
          <span>{new Date(event.start_time).toLocaleDateString('en-NA', { weekday:'short', month:'short', day:'numeric' })}</span>
        </div>
        {event.location_name && (
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#8A7F74]">
            <MapPin size={10} />
            <span className="truncate">{event.location_name}</span>
          </div>
        )}
      </div>

      <span
        className="flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold"
        style={{ background: '#C8521A18', color: '#E8A055' }}
      >
        {badge}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
// EXPLORE
// ─────────────────────────────────────────────

export function Explore() {
  const { profile } = useAuth();
  const navigate    = useNavigate();

  const [query,    setQuery]    = useState('');
  const [active,   setActive]   = useState(false);

  // Discovery data
  const [trending, setTrending]     = useState<Post[]>([]);
  const [people,   setPeople]       = useState<Profile[]>([]);
  const [loadingDisc, setLoadingDisc] = useState(true);

  // Search data
  const [searchProfiles, setSearchProfiles] = useState<Profile[]>([]);
  const [searchPosts,    setSearchPosts]    = useState<Post[]>([]);
  const [searchLoading,  setSearchLoading]  = useState(false);

  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const { events, isLoading: eventsLoading } = useEvents();

  // ── Load discovery ──────────────────────────

  useEffect(() => {
    if (!profile) return;
    setLoadingDisc(true);

    Promise.all([
      // Trending posts
      supabase
        .from('posts')
        .select('*, profiles!posts_user_id_fkey(*)')
        .gt('created_at', new Date(Date.now() - 48 * 3600 * 1000).toISOString())
        .order('like_count', { ascending: false })
        .limit(10),

      // Suggested people (not already following)
      supabase
        .from('profiles')
        .select('*')
        .neq('id', profile.id)
        .order('follower_count', { ascending: false })
        .limit(8),
    ]).then(([postsRes, peopleRes]) => {
      if (postsRes.data) setTrending(postsRes.data as Post[]);
      if (peopleRes.data) {
        // Filter out people already followed (best-effort — we don't fetch follows here to keep it fast)
        setPeople(peopleRes.data as Profile[]);
      }
    }).finally(() => setLoadingDisc(false));
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
          .limit(12),
        supabase
          .from('posts')
          .select('*, profiles!posts_user_id_fkey(*)')
          .ilike('content', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(12),
      ]);
      setSearchProfiles((pRes.data ?? []) as Profile[]);
      setSearchPosts((postRes.data ?? []) as Post[]);
      setSearchLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // ── Follow ──────────────────────────────────

  const handleFollow = async (targetId: string) => {
    if (!profile) return;
    const { error } = await supabase.rpc('follow_user', {
      p_follower: profile.id,
      p_following: targetId,
    });
    if (error) toast.error('Could not follow user');
    else toast.success('Following!');
  };

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

  // ── Render ──────────────────────────────────

  return (
    <div className="pb-24">

      {/* Sticky search bar */}
      <div
        className="sticky top-14 z-20 px-4 py-3 border-b"
        style={{
          background: 'rgba(15,13,11,0.95)',
          backdropFilter: 'blur(16px)',
          borderColor: '#2E2822',
        }}
      >
        <div
          className="flex items-center gap-2 rounded-2xl border px-3.5 py-2.5"
          style={{ background: '#1C1814', borderColor: active ? '#C8521A' : '#2E2822' }}
        >
          <Search size={16} color="#8A7F74" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
            placeholder="Search people, posts, topics…"
            className="flex-1 bg-transparent text-sm text-[#F5F0EA] outline-none placeholder:text-[#8A7F74]"
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X size={15} color="#8A7F74" />
            </button>
          )}
        </div>
      </div>

      {/* Search results */}
      <AnimatePresence>
        {query.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <SearchResults
              query={query}
              profiles={searchProfiles}
              posts={searchPosts}
              loading={searchLoading}
              onProfile={id => navigate(`/profile/${id}`)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discovery sections (hidden when searching) */}
      {query.trim().length < 2 && (
        <div>

          {/* ── Trending ── */}
          <section className="pt-5 pb-4">
            <div className="mb-3 flex items-center justify-between px-4">
              <div>
                <h2 className="font-display text-[15px] font-bold text-[#F5F0EA]">Trending</h2>
                <p className="mt-0.5 text-[11px] text-[#8A7F74]">Most engaged in the last 48h</p>
              </div>
              <span
                className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold"
                style={{ background: '#C8521A18', borderColor: '#C8521A30', color: '#E8A055' }}
              >
                <TrendingUp size={10} />
                Live
              </span>
            </div>

            {loadingDisc ? (
              Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
            ) : trending.length === 0 ? (
              <EmptyState
                icon={<TrendingUp size={22} color="#8A7F74" />}
                title="Nothing trending yet"
                subtitle="Post something to get it going."
              />
            ) : (
              trending.slice(0, 6).map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={liked => handleLike(post.id, liked)}
                  onSave={() => {}}
                  onRepost={() => {}}
                  onComment={() => setCommentPostId(post.id)}
                  onProfile={id => navigate(`/profile/${id}`)}
                />
              ))
            )}
          </section>

          {/* ── People to follow ── */}
          {people.length > 0 && (
            <section className="border-t py-5" style={{ borderColor: '#2E2822' }}>
              <div className="mb-3 flex items-center justify-between px-4">
                <div>
                  <h2 className="font-display text-[15px] font-bold text-[#F5F0EA]">Suggested</h2>
                  <p className="mt-0.5 text-[11px] text-[#8A7F74]">Namibians to discover</p>
                </div>
                <button
                  onClick={() => navigate('/explore/people')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#C8521A]"
                >
                  See all <ArrowRight size={12} />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar pb-1">
                {people.map(p => (
                  <PeopleCard
                    key={p.id}
                    profile={p}
                    onFollow={handleFollow}
                    onProfile={id => navigate(`/profile/${id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Upcoming events preview ── */}
          <section className="border-t py-5" style={{ borderColor: '#2E2822' }}>
            <div className="mb-3 flex items-center justify-between px-4">
              <div>
                <h2 className="font-display text-[15px] font-bold text-[#F5F0EA]">Events</h2>
                <p className="mt-0.5 text-[11px] text-[#8A7F74]">Happening soon in Namibia</p>
              </div>
              <button
                onClick={() => navigate('/events')}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#C8521A]"
              >
                See all <ArrowRight size={12} />
              </button>
            </div>

            {eventsLoading ? (
              <div className="space-y-3 px-4">
                {[0,1,2].map(i => (
                  <div key={i} className="h-[72px] rounded-2xl skeleton" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <EmptyState
                icon={<CalendarDays size={22} color="#8A7F74" />}
                title="No upcoming events"
              />
            ) : (
              <div className="space-y-3 px-4">
                {events.slice(0, 3).map(event => (
                  <EventRow
                    key={event.id}
                    event={event}
                    onNavigate={() => navigate('/events')}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      )}

      {/* Comments modal */}
      {commentPostId && (
        <CommentsModal postId={commentPostId} onClose={() => setCommentPostId(null)}>
          {null}
        </CommentsModal>
      )}
    </div>
  );
}
