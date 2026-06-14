import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MOCK_PHOTOS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600', views: '1.234k', height: 'h-64' },
  { id: 2, url: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=600', views: '3.264k', height: 'h-48' },
  { id: 3, url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600', views: '5.644k', height: 'h-56' },
  { id: 4, url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=600', views: '5.764k', height: 'h-48' },
  { id: 5, url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600', views: '2.984k', height: 'h-64' },
  { id: 6, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600', views: '6.394k', height: 'h-56' },
];

export function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Photos' | 'Video' | 'Tagged' | 'notes'>('Photos');

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-24 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/70 hover:text-white transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button className="p-2 -mr-2 text-white/70 hover:text-white transition bg-white/5 rounded-full">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Info Header */}
      <div className="px-6 flex flex-col mt-4">
        <div className="flex items-center gap-5">
          {/* Avatar with Gradient Ring */}
          <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 to-orange-500 flex-shrink-0 relative">
            <div className="absolute inset-0 rounded-full bg-background border-4 border-background flex items-center justify-center overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" 
                alt="Alex Smith" 
                className="w-full h-full object-cover bg-black"
              />
            </div>
          </div>
          
          {/* Details & Actions */}
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-bold tracking-wide">Alex Smith</h1>
            <span className="text-sm text-white/50 mb-4">@alexsmith</span>
            
            <div className="flex items-center gap-3">
              <button className="flex-1 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold transition border border-white/5">
                Following
              </button>
              <button className="flex-1 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold transition border border-white/5">
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-6 bg-card p-4 rounded-3xl border border-border">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold">264</span>
            <span className="text-[11px] text-white/50">Posts</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold">14.9k</span>
            <span className="text-[11px] text-white/50">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold">378</span>
            <span className="text-[11px] text-white/50">Following</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-card">
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === 'notes' ? 'text-white' : 'text-muted-foreground'}`}
        >
          Notes
          {activeTab === 'notes' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-background p-4">
        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground space-y-2">
          <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center mb-2">
            <MessageSquare className="w-5 h-5 opacity-50" />
          </div>
          <p>No notes yet</p>
        </div>
      </div>

      {/* Masonry Grid Content */}
      <div className="px-6">
        <div className="columns-2 gap-4 space-y-4">
          {MOCK_PHOTOS.map((photo) => (
            <div 
              key={photo.id} 
              className={`relative rounded-[24px] overflow-hidden break-inside-avoid ${photo.height} bg-card group cursor-pointer`}
            >
              <img 
                src={photo.url} 
                alt="Post" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4">
                <span className="text-[10px] font-bold text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {photo.views}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
