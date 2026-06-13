import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/common';
import { CreateStoryModal } from '@/components/feed/CreateStoryModal';
import type { Story } from '@/types';
import { RadarCanvas } from '../components/radar/RadarCanvas';

function StoriesRow({
  stories,
  onAddStory,
}: {
  stories: Story[];
  onAddStory: () => void;
}) {
  const { profile } = useAuth();
  const myStory = stories.find(s => s.user_id === profile?.id);

  return (
    <div
      className="flex gap-3.5 overflow-x-auto px-4 py-3.5 no-scrollbar border-b"
      style={{ borderColor: '#2E2822' }}
    >
      {/* Add Story tile */}
      <button
        onClick={onAddStory}
        className="flex flex-shrink-0 flex-col items-center gap-1.5 group"
        aria-label="Add story"
      >
        <div className="relative">
          {myStory ? (
            <div className="story-ring h-[68px] w-[68px] rounded-full p-[2.5px]">
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-[#0F0D0B]">
                <Avatar profile={profile!} size={62} />
              </div>
            </div>
          ) : (
            <div
              className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 border-dashed transition group-hover:border-[#C8521A]"
              style={{ borderColor: '#2E2822' }}
            >
              <Avatar profile={profile!} size={56} />
            </div>
          )}
          <div
            className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 text-white"
            style={{ background: '#C8521A', borderColor: '#0F0D0B' }}
          >
            <Plus size={12} strokeWidth={3} />
          </div>
        </div>
        <span className="text-[10px] font-medium text-[#8A7F74] truncate max-w-[68px]">
          Your story
        </span>
      </button>

      {/* Other stories */}
      {stories
        .filter(s => s.user_id !== profile?.id && s.profiles)
        .map(story => (
          <button
            key={story.id}
            onClick={() => {}}
            className="flex flex-shrink-0 flex-col items-center gap-1.5"
          >
            <div className="story-ring h-[68px] w-[68px] rounded-full p-[2.5px]">
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-[#0F0D0B]">
                <Avatar profile={story.profiles!} size={62} />
              </div>
            </div>
            <span
              className="text-[10px] font-medium text-[#F5F0EA] truncate max-w-[68px]"
            >
              {(story.profiles?.display_name || story.profiles?.username || '').split(' ')[0]}
            </span>
          </button>
        ))}
    </div>
  );
}

export function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [showCreateStory, setShowCreateStory] = useState(false);

  useEffect(() => {
    supabase
      .from('stories')
      .select('*, profiles!stories_user_id_fkey(*)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setStories(data as Story[]);
      });
  }, []);

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)] overflow-hidden">
      {/* Stories */}
      <StoriesRow
        stories={stories}
        onAddStory={() => setShowCreateStory(true)}
      />

      {/* Radar Canvas (Fullscreen space) */}
      <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-[#0F0D0B]">
        <RadarCanvas />
      </main>

      {showCreateStory && (
        <CreateStoryModal
          open={showCreateStory}
          onOpenChange={setShowCreateStory}
        />
      )}
    </div>
  );
}
