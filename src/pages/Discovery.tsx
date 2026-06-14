import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Send, Plus, Bell, MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StoriesViewer, Story } from '../components/stories/StoriesViewer';

const MOCK_STORIES: Story[] = [
  {
    id: 's1',
    userId: 'u1',
    username: 'Samera',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=samera',
    mediaUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000',
    mediaType: 'image',
    timestamp: '2 hours ago'
  },
  {
    id: 's2',
    userId: 'u2',
    username: 'Julien Ray',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julien',
    mediaUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=1000',
    mediaType: 'image',
    timestamp: '16 Minutes ago'
  },
  {
    id: 's3',
    userId: 'u3',
    username: 'Mariane',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mariane',
    mediaUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=1000',
    mediaType: 'image',
    timestamp: '5 hours ago'
  }
];

export function Discovery() {
  const navigate = useNavigate();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  // Bottom Nav Bar handled within this page to perfectly match the floating design from reference
  return (
    <div className="min-h-[100dvh] bg-[#0A0B10] text-white flex flex-col relative pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-[3px]">
            <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            <div className="w-2.5 h-2.5 rounded-sm bg-white/50" />
          </div>
          <span className="text-xl font-bold tracking-wide ml-2">Menu</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded-full transition">
            <Bell className="w-5 h-5 text-white/80" />
          </button>
          <button 
            onClick={() => navigate('/messages')}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-white/90 transition"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stories Carousel */}
      <div className="flex items-start gap-5 px-6 overflow-x-auto no-scrollbar py-2">
        {/* Add Story */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <button className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10 transition">
            <Plus className="w-6 h-6 text-white/80" />
          </button>
          <span className="text-xs font-medium text-white/80">Add Story</span>
        </div>

        {/* Story Items */}
        {MOCK_STORIES.map((story, idx) => (
          <div 
            key={story.id} 
            className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
            onClick={() => setActiveStoryIndex(idx)}
          >
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-500">
              <div className="w-full h-full rounded-full border-[3px] border-[#0A0B10] overflow-hidden group-hover:scale-95 transition-transform">
                <img src={story.userAvatar} alt={story.username} className="w-full h-full object-cover bg-[#1A1B23]" />
              </div>
            </div>
            <span className="text-xs font-medium text-white/80">{story.username}</span>
          </div>
        ))}
      </div>

      {/* Main Feed */}
      <div className="flex flex-col px-6 mt-8 space-y-8">
        
        {/* Post Card 1 */}
        <div className="relative w-full rounded-[32px] overflow-hidden bg-gradient-to-b from-yellow-500 to-orange-500 aspect-[4/5] shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1000" 
            alt="Post content" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          />
          
          {/* Post Header */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" 
                alt="Alex Smith" 
                className="w-10 h-10 rounded-full border-2 border-white/20 object-cover bg-black"
              />
              <span className="font-bold text-white shadow-sm">Alex Smith</span>
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              <div className="w-4 h-1.5 bg-white/50 rounded-full" />
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10 bg-white/10 backdrop-blur-md rounded-full py-6 px-3 border border-white/20">
            <button className="flex flex-col items-center gap-1 group">
              <Heart className="w-6 h-6 text-white group-hover:fill-white transition" />
              <span className="text-[10px] font-medium text-white/90">1.234k</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
              <MessageCircle className="w-6 h-6 text-white group-hover:fill-white transition" />
              <span className="text-[10px] font-medium text-white/90">230</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
              <Bookmark className="w-6 h-6 text-white group-hover:fill-white transition" />
              <span className="text-[10px] font-medium text-white/90">Save</span>
            </button>
            <button className="flex flex-col items-center gap-1 group mt-2">
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Post Card 2 */}
        <div className="relative w-full rounded-[32px] overflow-hidden bg-gradient-to-tr from-cyan-900 to-blue-900 aspect-[4/5] shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1000" 
            alt="Post content" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          />
          
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=hr" 
                alt="HR Rumen" 
                className="w-10 h-10 rounded-full border-2 border-white/20 object-cover bg-black"
              />
              <span className="font-bold text-white shadow-sm">HR Rumen</span>
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              <div className="w-4 h-1.5 bg-white/50 rounded-full" />
            </div>
          </div>
        </div>

      </div>

      {/* Floating Bottom Nav (Replacing default layout nav for this screen) */}
      <div className="fixed bottom-8 left-6 right-6 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-between px-2 z-40 shadow-2xl">
        <button className="flex items-center gap-2 bg-white/20 rounded-full px-5 py-2.5 text-white">
          <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
            <div className="bg-white rounded-sm" />
            <div className="bg-white rounded-sm" />
            <div className="bg-white rounded-sm" />
            <div className="bg-white rounded-sm" />
          </div>
          <span className="font-semibold text-sm">Home</span>
        </button>

        <button className="p-3 text-white/70 hover:text-white transition">
          <Search className="w-6 h-6" />
        </button>

        <button className="p-3 text-white/70 hover:text-white transition">
          <Plus className="w-6 h-6" />
        </button>

        <button className="p-3 text-white/70 hover:text-white transition">
          <Heart className="w-6 h-6" />
        </button>

        <button 
          onClick={() => navigate('/profile')}
          className="p-3 text-white/70 hover:text-white transition"
        >
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" className="w-6 h-6 rounded-full object-cover bg-black" />
        </button>
      </div>

      {/* Story Viewer Overlay */}
      {activeStoryIndex !== null && (
        <StoriesViewer 
          stories={MOCK_STORIES} 
          initialIndex={activeStoryIndex} 
          onClose={() => setActiveStoryIndex(null)} 
        />
      )}
    </div>
  );
}
