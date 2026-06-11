import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string | null;
  media_url: string | null;
  media_type: 'voice' | null;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export function useComments(postId: string) {
  const { session } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          author_id,
          content,
          media_url,
          media_type,
          created_at,
          profiles:author_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    if (!postId) return;

    // Realtime subscription
    const channel = supabase.channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          const { data: newComment } = await supabase
            .from('comments')
            .select(`
              id,
              post_id,
              author_id,
              content,
              media_url,
              media_type,
              created_at,
              p
<truncated 1055 bytes>