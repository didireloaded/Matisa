import { useState, useEffect } from 'react';
import { MapPin, Link as LinkIcon, Edit3, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { T, Avatar, PostCard, PostSkeleton } from "@/components/common";
import type { Post } from "@/types";

export function Profile() {
  const { profile, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      if (!profile) return;
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (data) setPosts(data as Post[]);
      setLoading(false);
    }
    loadPosts();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="pb-24">
      {/* Cover */}
      <div className="h-32 w-full bg-[#1C1814] relative">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="Cover" className="h-full w-full object-cover" />
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={signOut} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 relative pb-4 border-b border-[#2E2822]">
        <div className="absolute -top-12 border-4 border-[#0F0D0B] rounded-full">
          <Avatar profile={profile} size={84} />
        </div>
        
        <div className="flex justify-end pt-3">
          <button className="rounded-full border border-[#2E2822] px-4 py-1.5 text-sm font-semibold text-[#F5F0EA] hover:bg-[#1C1814] transition">
            Edit Profile
          </button>
        </div>

        <div className="mt-2">
          <h1 className="text-xl font-bold text-[#F5F0EA]">{profile.display_name}</h1>
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
            <span className="text-[#F5F0EA]"><strong className="font-semibold">{profile.following_count}</strong> <span className="text-[#8A7F74]">Following</span></span>
            <span className="text-[#F5F0EA]"><strong className="font-semibold">{profile.follower_count}</strong> <span className="text-[#8A7F74]">Followers</span></span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <main>
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-[#8A7F74] text-sm">
            No posts yet.
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              isOwn={true}
              onLike={() => {}}
              onSave={() => {}}
              onRepost={() => {}}
              onComment={() => {}}
              onProfile={() => {}}
            />
          ))
        )}
      </main>
    </div>
  );
}