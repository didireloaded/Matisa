import { supabase } from '../lib/supabase';
import type { Post } from '@/types';

export const PostService = {
  /**
   * Fetches trending posts
   */
  async getTrendingPosts(limit: number = 20): Promise<Post[]> {
    const { data, error } = await supabase.rpc('get_trending_posts', { p_limit: limit });
    
    if (error || !data) {
      console.error('Error fetching trending posts:', error);
      return [];
    }

    const { data: enriched, error: enrichError } = await supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(*)')
      .in('id', data.map((p: any) => p.id))
      .order('created_at', { ascending: false });

    if (enrichError) {
      console.error('Error enriching posts:', enrichError);
      return [];
    }

    return enriched as Post[];
  },

  /**
   * Toggles like on a post
   */
  async toggleLike(postId: string, userId: string, liked: boolean): Promise<void> {
    if (liked) {
      await supabase.from('likes').insert({ post_id: postId, user_id: userId });
    } else {
      await supabase.from('likes').delete().match({ post_id: postId, user_id: userId });
    }
  }
};
