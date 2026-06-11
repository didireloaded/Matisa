import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export interface Post {
  id: string;
  user_id: string;
  content?: string;
  type: 'text' | 'voice' | 'photo' | 'video' | 'poll' | 'location';
  media_url?: string;
  voice_duration?: number;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  likes_count: number;
  comments_count: number;
  reposts_count: number;
}

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles ( username, full_name, avatar_url ),
          likes:post_interactions(count),
          comments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match UI needs
      return (data as any[]).map(post => ({
        ...post,
        likes_count: post.likes?.[0]?.count || 0,
        comments_count: post.comments?.[0]?.count || 0,
        reposts_count: 0, // Mock for now
      })) as Post[];
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPost: { content?: string, type: string, media_url?: string, voice_duration?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert([{ ...newPost, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
