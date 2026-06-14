import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Settings, MessageSquare, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { T, Avatar, PostCard, PostSkeleton } from "@/components/common";
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import type { Post, Profile as ProfileType } from "@/types";

export function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile: currentUser, signOut } = useAuth();
  
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { ref, inView } = useInView();

  const isOwnProfile = !id || id === currentUser?.id;

  useEffect(() => {
    async function loadProfile() {
      if (isOwnProfile) {
        setProfile(currentUser);
        setLoadingProfile(false);
        return;
      }
      
      setLoadingProfile(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (data) setProfile(data as ProfileType);
      setLoadingProfile(false);
    }
    loadProfile();
  }, [id, currentUser, isOwnProfile]);

  useEffect(() => {
    async function loadPosts() {
      const targetId = isOwnProfile ? currentUser?.id : id;
      if (!targetId) return;
      
      setLoading(true);
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setPosts(data as Post[]);
        setHasMore(data.length === 10);
      }
      setLoading(false);
    }
    loadPosts();
  }, [id, currentUser, isOwnProfile]);

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      loadMorePosts();
    }
  }, [inView, hasMore, loading, loadingMore]);

  const loadMorePosts = async () => {
    const targetId = isOwnProfile ? currentUser?.id : id;
    if (!targetId || !posts.length) return;

    setLoadingMore(true);
    const lastPost = posts[posts.length - 1];

    const { data } = await supabase
      .from('posts')
      .select('*, profiles(*)')
      .eq('user_id', targetId)
      .lt('created_at', lastPost.created_at)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data && data.length > 0) {
      setPosts(prev => [...prev, ...(data as Post[])]);
      setHasMore(data.length === 10);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  if (loadingProfile) {
    return <div className="p-8 text-center text-[#8A7F74] text-sm">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-[#8A7F74] text-sm">Profile not found.</div>;
  }

  return (
    <div className="pb-24 bg-[#0F0D0B] min-h-screen">
      {/* Cover */}
      <div className="h-32 w-full bg-[#1C1814] relative">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="Cover" className="h-full w-full object-cover" />
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          {!isOwnProfile && (
            <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur">
              <ArrowLeft size={16} />
            </button>
          )}
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {isOwnProfile && (
            <button onClick={signOut} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur" aria-label="Settings">
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 relative pb-4 border-b border-[#2E2822]">
        <div className="absolute -top-12 border-4 border-[#0F0D0B] rounded-full">
          <Avatar profile={profile} size={84} />
        </div>
        
        <div className="flex justify-end pt-3">
          {isOwnProfile ? (
            <button className="rounded-full border border-[#2E2822] px-4 py-1.5 text-sm font-semibold text-[#F5F0EA] hover:bg-[#1C1814] transition">
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => navigate(`/chat/${profile.id}`)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2E2822] text-[#F5F0EA] hover:bg-[#1C1814] transition">
                <MessageSquare size={14} />
              </button>
              <button className="flex items-center gap-1 rounded-full bg-[#C8521A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#E8A055] transition">
                <Plus size={14} /> Follow
              </button>
            </div>
          )}
        </div>

        <div className="mt-2">
          <h1 className="text-xl font-bold text-[#F5F0EA]">{profile.display_name || profile.username}</h1>
          <p className="text-sm text-[#8A7F74]">@{profile.username}</p>
        </div>

        {profile.bio && (
          <p className="mt-3 text-sm text-[#F5F0EA] whitespace-pre-wrap">{profile.bio}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#8A7F74]">
          {profile.region && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{profile.region}</span>
            </div>
          )}
          <div className="flex gap-4">
            <span className="text-[#F5F0EA]"><strong className="font-semibold">{profile.following_count || 0}</strong> <span className="text-[#8A7F74]">Following</span></span>
            <span className="text-[#F5F0EA]"><strong className="font-semibold">{profile.follower_count || 0}</strong> <span className="text-[#8A7F74]">Followers</span></span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <main>
        {loading && posts.length === 0 ? (
          Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-[#8A7F74] text-sm">
            No posts yet.
          </div>
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
                onProfile={() => {}}
              />
            ))}
            
            {hasMore && (
              <div ref={ref} className="py-6 flex justify-center">
                <Loader2 className="animate-spin text-[#C8521A]" />
              </div>
            )}
            {!hasMore && posts.length > 0 && (
              <div className="py-8 text-center text-xs text-[#8A7F74]">
                You've reached the end
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}