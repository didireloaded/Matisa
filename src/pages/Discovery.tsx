import { useState } from 'react';
import { Plus } from 'lucide-react';
import { StoriesViewer, Story } from '../components/stories/StoriesViewer';
import { PeopleCard, Person } from '../components/feed/PeopleCard';
import { UserQuickViewCard } from '../components/karaoke/UserQuickViewCard';

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
    username: 'Julien',
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

const MOCK_PEOPLE: Person[] = [
  {
    id: 'p1',
    name: 'Elsa Jonhson',
    age: 24,
    city: 'London, UK',
    occupation: 'Photographer',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    isVerified: true,
    mutualFriends: 12,
    interests: ['Photography', 'Travel', 'Art'],
    badges: ['Creator'],
    recentActivity: '2h ago'
  },
  {
    id: 'p2',
    name: 'Hannah Smith',
    age: 22,
    city: 'Toronto, Canada',
    occupation: 'Student',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
    isVerified: true,
    mutualFriends: 5,
    interests: ['Music', 'Gaming'],
    badges: [],
    recentActivity: '3h ago'
  },
  {
    id: 'p3',
    name: 'Dana Williams',
    age: 26,
    city: 'New York, US',
    occupation: 'Professional artist',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
    isVerified: false,
    mutualFriends: 2,
    interests: ['Design', 'Film', 'Fashion'],
    badges: ['Creator', 'Artist'],
    recentActivity: 'Online'
  },
  {
    id: 'p4',
    name: 'Patric Rookwood',
    age: 28,
    city: 'Berlin, DE',
    occupation: 'DJ',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    isVerified: false,
    mutualFriends: 0,
    interests: ['Music', 'Nightlife'],
    badges: ['Musician'],
    recentActivity: 'Online'
  },
  {
    id: 'p5',
    name: 'Alex Costa',
    age: 25,
    city: 'Lisbon, PT',
    occupation: 'Developer',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    isVerified: true,
    mutualFriends: 8,
    interests: ['Tech', 'Fitness', 'Coffee'],
    badges: [],
    recentActivity: '1d ago'
  }
];

const FILTERS = ['All', 'Creators', 'Friends', 'Trending', 'New'];

export function Discovery() {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Quick View State
  const [quickViewUser, setQuickViewUser] = useState<any | null>(null);

  // Split people into columns for masonry layout manually to ensure consistent distribution
  const featuredPerson = MOCK_PEOPLE[0];
  const col1 = [MOCK_PEOPLE[1], MOCK_PEOPLE[3]];
  const col2 = [MOCK_PEOPLE[2], MOCK_PEOPLE[4]];

  return (
    <div className="min-h-full pb-32"> {/* Increased padding for bottom nav */}
      
      {/* Top Header Placeholder (MainLayout provides the actual header now) */}
      <div className="pt-2"></div>

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
              <div className="w-full h-full rounded-full border-[3px] border-background overflow-hidden group-hover:scale-95 transition-transform">
                <img src={story.userAvatar} alt={story.username} className="w-full h-full object-cover bg-card" />
              </div>
            </div>
            <span className="text-xs font-medium text-white/80">{story.username}</span>
          </div>
        ))}
      </div>

      {/* Title */}
      <div className="px-6 mt-6 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Browse your vibe</h1>
      </div>

      {/* Floating Segmented Filters */}
      <div className="px-6 mb-6 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                activeFilter === f 
                  ? 'bg-white text-black border-white' 
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Grid (Masonry) */}
      <div className="px-6 flex flex-col gap-4">
        {/* Featured Large Card */}
        <div className="w-full">
          <PeopleCard 
            person={featuredPerson} 
            size="large" 
            onLongPress={() => setQuickViewUser(featuredPerson)}
          />
        </div>

        {/* Masonry Columns for Medium/Small Cards */}
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-4">
            {col1.map((p, i) => (
              <PeopleCard 
                key={p.id} 
                person={p} 
                size={i % 2 === 0 ? 'medium' : 'small'} 
                onLongPress={() => setQuickViewUser(p)}
              />
            ))}
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {col2.map((p, i) => (
              <PeopleCard 
                key={p.id} 
                person={p} 
                size={i % 2 !== 0 ? 'medium' : 'small'} 
                onLongPress={() => setQuickViewUser(p)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      {activeStoryIndex !== null && (
        <StoriesViewer 
          stories={MOCK_STORIES} 
          initialIndex={activeStoryIndex} 
          onClose={() => setActiveStoryIndex(null)} 
        />
      )}

      {/* Quick View Card (Long Press) */}
      {quickViewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={() => setQuickViewUser(null)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm">
            <UserQuickViewCard 
              user={{
                id: quickViewUser.id,
                name: quickViewUser.name,
                username: quickViewUser.name.toLowerCase().replace(' ', ''),
                avatar: quickViewUser.photoUrl,
                bio: 'Living my best life and exploring the world.',
                badges: quickViewUser.badges
              }} 
              onClose={() => setQuickViewUser(null)} 
            />
          </div>
        </div>
      )}

    </div>
  );
}
