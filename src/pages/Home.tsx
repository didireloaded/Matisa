import { useState, useEffect } from 'react';
import { Bell, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { T, Avatar } from '../components/shared';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Story } from '../types';
import { RadarCanvas } from '../components/radar/RadarCanvas';

export function Home() {
  const { profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      // Fetch stories
      const { data: sData } = await supabase
        .from('stories')
        .select('*, profiles(*)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (sData) setStories(sData as Story[]);
      setLoading(false);
    }
    loadFeed();
  }, []);

  return (
    <div className="pb-24">
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between px-4 border-b"
        style={{ backgroundColor: `${T.bg}E6`, backdropFilter: 'blur(12px)', borderColor: T.border }}
      >
        <h1 className="text-xl font-bold italic" style={{ color: T.text }}>Matisa</h1>
        <div className="flex items-center gap-4 text-[#F5F0EA]">
          <Link to="/activity" className="relative">
            <Bell size={22} strokeWidth={2} />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#C8521A] text-[8px] font-bold text-white">
              2
            </span>
          </Link>
        </div>
      </header>

      {/* Stories / Activity Bubbles */}
      <section className="border-b py-4" style={{ borderColor: T.border }}>
        <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar">
          {profile && (
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="relative">
                <Avatar profile={profile} size={64} />
                <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0F0D0B] bg-[#C8521A] text-white">
                  <Plus size={12} strokeWidth={3} />
                </div>
              </div>
              <span className="text-[11px] font-medium text-[#8A7F74]">Your Story</span>
            </div>
          )}
          {stories.map(story => (
            <div key={story.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <Avatar profile={story.profiles} size={64} ring />
              <span className="text-[11px] font-medium text-[#F5F0EA] truncate max-w-[64px]">
                {(story.profiles?.full_name || story.profiles?.username || '').split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Feed - Now Replaced by Radar */}
      <main className="flex-1 flex flex-col relative h-[calc(100vh-140px)]">
        <RadarCanvas />
      </main>
    </div>
  );
}