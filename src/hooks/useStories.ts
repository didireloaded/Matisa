import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Story {
  id: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  type: 'photo' | 'video' | 'voice' | 'mood';
  hasUnseenStory?: boolean;
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            id,
            media_type,
            author_id,
            profiles:author_id (
              username,
              full_name,
              avatar_url
            )
          `)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by author_id
        const storyGroups = new Map<string, Story>();

        data.forEach((story: any) => {
          if (!storyGroups.has(story.author_id)) {
            const profile = Array.isArray(story.profiles) ? story.profiles[0] : story.profiles;
            
            let type: 'photo' | 'video' | 'voice' | 'mood' = 'photo';
            if (story.media_type === 'video') type = 'video';
            if (story.media_type === 'voice') type = 'voice';

            storyGroups.set(story.author_id, {
              id: story.id, // Using first story's ID as the group ID for now
              user: {
                name: profile?.full_name || 'Unknown',
                avatarUrl: profile?.avatar_url,
              },
              type,
              hasUnseenStory: true,
            });
          }
        });

        setStories(Array.from(storyGroups.values()));
      } catch (err) {
        console.error("Failed to fetch stories:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStories();
  }, []);

  return { stories, isLoading };
}
