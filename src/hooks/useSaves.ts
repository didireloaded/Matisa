import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types';

export function useSaves() {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Join post_saves with posts and profiles
      const { data, error } = await supabase
        .from('post_saves')
        .select(`
          post_id,
          posts (*, profiles!posts_user_id_fkey(*))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const posts = data?.map(save => save.posts).filter(Boolean) as Post[];
      setSavedPosts(posts);
    } catch (err) {
      console.error('Error fetching saved posts:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const toggleSave = useCallback(async (postId: string, isCurrentlySaved: boolean) => {
    if (!user) return false;
    
    try {
      if (isCurrentlySaved) {
        await supabase
          .from('post_saves')
          .delete()
          .match({ user_id: user.id, post_id: postId });
      } else {
        await supabase
          .from('post_saves')
          .insert({ user_id: user.id, post_id: postId });
      }
      return true;
    } catch (err) {
      console.error('Error toggling save:', err);
      return false;
    }
  }, [user]);

  const checkIsSaved = useCallback(async (postId: string) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase
        .from('post_saves')
        .select('post_id')
        .match({ user_id: user.id, post_id: postId })
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (err) {
      return false;
    }
  }, [user]);

  return {
    savedPosts,
    loading,
    fetchSavedPosts,
    toggleSave,
    checkIsSaved
  };
}
