import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface FeedPost {
  id: string;
  user: {
    name: string;
    username: string;
    avatarUrl?: string;
  };
  content?: string;
  mediaUrl?: string;
  location?: string;
  timePosted: string;
  type: 'text' | 'photo' | 'video' | 'voice';
  voiceDuration?: string;
  likes: number;
  comments: number;
  shares: number;
}

export function useFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const fetchFeed = async (page = 0) => {
    if (page === 0) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          media_urls,
          created_at,
          author_id,
          profiles:author_id (
            username,
            full_name,
            avatar_url
          ),
          likes:likes(count),
          comments:comments(count)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const formattedPosts: FeedPost[] = data.map((post: any) => {
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        
        let type: 'text' | 'photo' | 'video' | 'voice' = 'text';
        let mediaUrl = undefined;
        
        if (post.media_urls && post.media_urls.length > 0) {
          type = 'photo';
          mediaUrl = post.media_urls[0];
        }

        const created = new Date(post.created_at);
        const now = new Date();
        const diffMs = now.getTime() - created.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const timePosted = diffHrs > 0 ? `${diffHrs}h` : `${Math.floor(diffMs / 60000)}m`;

        const likesCount = post.likes?.[0]?.count || 0;
        const commentsCount = post.comments?.[0]?.count || 0;

        return {
          id: post.id,
          user: {
            name: profile?.full_name || 'Unknown',
            username: profile?.username || 'unknown',
            avatarUrl: profile?.avatar_url,
          },
          content: post.content,
          mediaUrl,
          timePosted,
          type,
          likes: likesCount,
          comments: commentsCount,
          shares: 0,
        };
      });

      if (formattedPosts.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setPosts(prev => page === 0 ? formattedPosts : [...prev, ...formattedPosts]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const loadMore = () => {
    if (!isFetchingMore && hasMore) {
      const nextPage = Math.ceil(posts.length / PAGE_SIZE);
      fetchFeed(nextPage);
    }
  };

  const refetch = () => fetchFeed(0);

  useEffect(() => {
    fetchFeed(0);
  }, []);

  return { posts, isLoading, isFetchingMore, hasMore, error, refetch, loadMore };
}
