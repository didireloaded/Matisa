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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeed() {
      try {
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
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform Supabase data into FeedPost format
        const formattedPosts: FeedPost[] = data.map((post: any) => {
          const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
          
          let type: 'text' | 'photo' | 'video' | 'voice' = 'text';
          let mediaUrl = undefined;
          
          if (post.media_urls && post.media_urls.length > 0) {
            type = 'photo'; // Simplified: assume photo if media exists
            mediaUrl = post.media_urls[0];
          }

          // Calculate time ago
          const created = new Date(post.created_at);
          const now = new Date();
          const diffMs = now.getTime() - created.getTime();
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const timePosted = diffHrs > 0 ? `${diffHrs}h` : `${Math.floor(diffMs / 60000)}m`;

     
<truncated 814 bytes>