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
              profiles:author_id (
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newComment) {
            setComments(prev => [...prev, newComment]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const addComment = async (content: string | null, mediaUrl?: string, mediaType?: 'voice') => {
    if (!session?.user) throw new Error('Must be logged in to comment');

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: session.user.id,
          content,
          media_url: mediaUrl,
          media_type: mediaType
        });

      if (error) throw error;

      // Fetch the post author to send them a notification
      const { data: postData } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      if (postData && postData.author_id !== session.user.id) {
        supabase.functions.invoke('send-notification', {
          body: {
            userId: postData.author_id,
            title: `New comment on your post`,
            body: `${session.user.user_metadata?.full_name || 'Someone'} commented: ${content ? content : '🎤 Voice note'}`,
            data: { url: `/` } // Route them to feed for now
          }
        }).catch(console.error);
      }

    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  return { comments, isLoading, addComment };
}
