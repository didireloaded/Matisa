import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Settings, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, PostCard, PostSkeleton } from '@/components/common';
import type { Post, Profile as ProfileType } from '@/types';

const PAGE = 10;

function getName(p: ProfileType | null): string {
  if (!p) return '';
  return (p as any).display_name || (p as any).full_name || p.username || '';
}

export function Profile() {
  const { id }                    = useParams<{ id: string }>();
  const navigate                  = useNavigate();
  const { profile: currentUser, loading: authLoading, signOut } = useAuth();

  const isOwnProfile = !id || id === currentUser?.id;
  const targetId     = isOwnProfile ? currentUser?.id : id;

  const [profile,     setProfile]     = useState<ProfileType | null>(null);
  const [posts,       setPosts]       = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts,   setLoadingPosts]   = useState(true);
  const [hasMore,     setHasMore]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Load profile ────────────────────────────

  useEffect(() => {
    // Wait for auth to finish before deciding
    if (authLoading) return;

    if (isOwnProfile) {
      setProfile(currentUser);
      setLoadingProfile(false);
      return;
    }

    if (!id) return;
    setLoadingProfile(true);
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data as ProfileType);
        setLoadingProfile(false);
      });
  }, [id, isOwnProfile, currentUser, authLoading]);

  // ── Load posts ──────────────────────────────

  useEffect(() => {
    if (!targetId) return;
    setLoadingPosts(true);
    supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(*)')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false })
      .range(0, PAGE - 1)
      .then(({ data }) => {
        setPosts((data ?? []) as Post[]);
        setHasMore((data?.length ?? 0) === PAGE);
        setLoadingPosts(false);
      });
  }, [targetId]);

  // ── Load more (infinite scroll) ─────────────

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore && !loadingPosts && posts.length > 0) {
        loadMore();
      }
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loadingPosts, posts.length]);

  const loadMore = async () => {
    if (!targetId || !posts.length) return;
    setLoadingMore(true);
    const last = posts[posts.length - 1];
    const { data } = await supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(*)')
      .eq('user_id', targetId)
      .lt('created_at', last.created_at)
      .order('created_at', { ascending: false })
      .limit(PAGE);
    if (data?.length) {
      setPosts(prev => [...prev, ...(data as Post[])]);
      setHasMore(data.length === PAGE);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  // ── States ──────────────────────────────────

  if (authLoading || loadingProfile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: '#C8521A' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-[#8A7F74]">Profile not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-[#C8521A] underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0F0D0B' }}>

      {/* Cover */}
      <div className="relative h-32 w-full" style={{ background: '#1C1814' }}>
        {profile.cover_url && (
          <img src={profile.cover_url} alt="Cover" className="h-full w-full object-cover" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom,transparent 60%,rgba(15,13,11,0.6))' }}
        />
        <div className="absolute left-4 top-4 flex gap-2">
          {!isOwnProfile && (
            <button
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
            >
              <ArrowLeft size={16} />
            </button>
          )}
        </div>
        <div className="absolute right-4 top-4">
          {isOwnProfile && (
            <button
              onClick={signOut}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
              aria-label="Sign out / Settings"
            >
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div className="relative border-b px-4 pb-4" style={{ borderColor: '#2E2822' }}>
        {/* Avatar overlapping cover */}
        <div className="absolute -top-12 rounded-full border-4" style={{ borderColor: '#0F0D0B' }}>
          <Avatar profile={profile} size={84} />
        </div>

        {/* Action buttons — right */}
        <div className="flex justify-end pt-3">
          {isOwnProfile ? (
            <button
              className="rounded-full border px-4 py-1.5 text-sm font-semibold text-[#F5F0EA] transition hover:bg-[#1C1814]"
              style={{ borderColor: '#2E2822' }}
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/chat/${profile.id}`)}
                className="flex h-8 w-8 items-center justify-center rounded-full border text-[#F5F0EA] transition hover:bg-[#1C1814]"
                style={{ borderColor: '#2E2822' }}
              >
                <MessageSquare size={14} />
              </button>
              <button
                className="flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: '#C8521A' }}
              >
                <Plus size={14} /> Follow
              </button>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="mt-2">
          <h1 className="text-xl font-bold text-[#F5F0EA]">{getName(profile)}</h1>
          <p className="text-sm text-[#8A7F74]">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 whitespace-pre-wrap text-sm text-[#F5F0EA]">{profile.bio}</p>
        )}

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
          {(profile as any).region && (
            <span className="flex items-center gap-1 text-[#8A7F74]">
              <MapPin size={13} />
              {(profile as any).region}
            </span>
          )}
          <span className="text-[#F5F0EA]">
            <strong>{profile.following_count ?? 0}</strong>{' '}
            <span className="text-[#8A7F74]">Following</span>
          </span>
          <span className="text-[#F5F0EA]">
            <strong>{(profile as any).follower_count ?? (profile as any).followers_count ?? 0}</strong>{' '}
            <span className="text-[#8A7F74]">Followers</span>
          </span>
        </div>
      </div>

      {/* Posts */}
      <main>
        {loadingPosts ? (
          Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#8A7F74]">No posts yet.</div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                isOwn={isOwnProfile}
                onLike={() => {}}
                onSave={() => {}}
                onRepost={() => {}}
                onComment={() => {}}
                onProfile={uid => navigate(`/profile/${uid}`)}
                onDelete={isOwnProfile ? async () => {
                  await supabase.from('posts').delete().eq('id', post.id);
                  setPosts(prev => prev.filter(p => p.id !== post.id));
                } : undefined}
              />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {loadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin" style={{ color: '#C8521A' }} />
              </div>
            )}

            {!hasMore && (
              <p className="py-8 text-center text-xs text-[#8A7F74]">
                End of posts
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
