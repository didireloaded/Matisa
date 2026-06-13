import { useState, useEffect } from 'react';
import { MapPin, Search, TrendingUp, Users, CalendarDays, Plus, PenSquare } from 'lucide-react';
import { T, PostCard, PostSkeleton, Avatar, EmptyState } from '../components/shared';
import { supabase } from '../lib/supabase';
import type { Post, RadarUser } from "@/types";
import { useAuth } from '../contexts/AuthContext';
import { CreateEventModal } from '../components/events/CreateEventModal';
import { useEvents } from '../hooks/useEvents';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { CommentsModal } from '../components/feed/CommentsModal';
import { toast } from 'sonner';

export function Explore() {
  const { profile } = useAuth();
  const [view, setView] = useState<'trending' | 'map' | 'events'>('trending');
  const [trending, setTrending] = useState<Post[]>([]);
  const [nearby, setNearby] = useState<RadarUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const { events, isLoading: eventsLoading } = useEvents();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (view === 'trending') {
        const { data } = await supabase.rpc('get_trending_posts', { p_limit: 20 });
        if (data) {
          const { data: enriched } = await supabase
            .from('posts')
            .select('*, profiles(*)')
            .in('id', data.map((p: any) => p.id))
            .order('created_at', { ascending: false });
          if (enriched) setTrending(enriched as Post[]);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [view, profile]);

  const handleLike = async (postId: string, liked: boolean) => {
    if (!profile) return;
    if (liked) {
      await supabase.from('likes').insert({ post_id: postId, user_id: profile.id });
    } else {
      await supabase.from('likes').delete().match({ post_id: postId, user_id: profile.id });
    }
  };

  return (
    <div className="pb-24 relative min-h-screen bg-[#0F0D0B]">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 pt-4 pb-2 bg-[#0F0D0B]/90 backdrop-blur-md border-b border-[#2E2822]">
        <div className="flex h-10 items-center rounded-xl bg-[#1C1814] px-3 border border-[#2E2822]">
          <Search size={18} className="text-[#8A7F74]" />
          <input
            type="text"
            placeholder="Search Matisa..."
            className="w-full bg-transparent px-3 text-sm text-[#F5F0EA] outline-none placeholder:text-[#8A7F74]"
          />
        </div>
        
        {/* Toggle */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setView('trending')}
            className={`pb-2 text-sm font-semibold transition border-b-2 ${
              view === 'trending' ? 'text-[#F5F0EA] border-[#C8521A]' : 'text-[#8A7F74] border-transparent'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setView('map')}
            className={`pb-2 text-sm font-semibold transition border-b-2 ${
              view === 'map' ? 'text-[#F5F0EA] border-[#C8521A]' : 'text-[#8A7F74] border-transparent'
            }`}
          >
            Nearby
          </button>
          <button
            onClick={() => setView('events')}
            className={`pb-2 text-sm font-semibold transition border-b-2 flex items-center gap-1 ${
              view === 'events' ? 'text-[#F5F0EA] border-[#C8521A]' : 'text-[#8A7F74] border-transparent'
            }`}
          >
            Events
          </button>
        </div>
      </header>

      {/* Content */}
      <main>
        {loading ? (
          <div className="mt-4">{Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}</div>
        ) : view === 'trending' ? (
          <>
            <div className="p-4 border-b border-[#2E2822] flex items-center gap-3">
              <Avatar profile={profile!} size={40} />
              <button 
                onClick={() => setShowCreatePost(true)}
                className="flex-1 bg-[#1C1814] border border-[#2E2822] rounded-full px-4 py-2 text-left text-sm text-[#8A7F74] hover:bg-[#221D18] transition"
              >
                Share what's happening...
              </button>
            </div>
            {trending.length > 0 ? (
              trending.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={(liked) => handleLike(post.id, liked)}
                  onSave={() => toast.success('Post saved')}
                  onRepost={() => toast.success('Reposted')}
                  onComment={() => setCommentPostId(post.id)}
                  onProfile={() => {}}
                />
              ))
            ) : (
              <EmptyState icon={<TrendingUp />} title="No trending posts yet" />
            )}
          </>
        ) : view === 'events' ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#F5F0EA]">Upcoming Events</h2>
            </div>
            
            {eventsLoading ? (
               <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-[#C8521A] border-t-transparent rounded-full animate-spin"></div></div>
            ) : events.length > 0 ? (
              events.map(event => (
                <div key={event.id} className="bg-[#1C1814] rounded-xl border border-[#2E2822] overflow-hidden flex flex-col">
                  {event.cover_url && <img src={event.cover_url} alt={event.title} className="w-full h-32 object-cover" />}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-[#F5F0EA] text-lg">{event.title}</h3>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#2E2822] text-[#E8A055]">
                        {event.event_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#8A7F74] mb-3">
                      <CalendarDays size={14} />
                      <span>{new Date(event.start_time).toLocaleString()}</span>
                    </div>
                    {event.description && <p className="text-sm text-[#F5F0EA] mb-3">{event.description}</p>}
                    <button className="w-full py-2 bg-[#C8521A]/10 text-[#C8521A] font-bold rounded-lg hover:bg-[#C8521A]/20 transition">
                      View Event
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={<CalendarDays />} title="No upcoming events" subtitle="Be the first to host one!" />
            )}
          </div>
        ) : (
          <div className="relative h-[calc(100vh-180px)] w-full bg-[#1C1814] overflow-hidden">
             {/* Map Placeholder */}
             <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
               <MapPin size={48} className="text-[#8A7F74] mb-4 opacity-50" />
               <p className="text-[#F5F0EA] font-medium">Map view is being loaded...</p>
               <p className="text-sm text-[#8A7F74] mt-2">See who is active near you when location is enabled.</p>
             </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Events */}
      {view === 'events' && (
        <button 
          onClick={() => setShowCreateEvent(true)}
          className="fixed bottom-20 right-4 w-12 h-12 bg-[#C8521A] text-white rounded-full flex items-center justify-center shadow-lg shadow-black/50 hover:bg-[#E8A055] transition z-40"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Floating Action Button for Posts */}
      {view === 'trending' && (
        <button 
          onClick={() => setShowCreatePost(true)}
          className="fixed bottom-20 right-4 w-12 h-12 bg-[#C8521A] text-white rounded-full flex items-center justify-center shadow-lg shadow-black/50 hover:bg-[#E8A055] transition z-40"
        >
          <PenSquare size={20} />
        </button>
      )}

      {/* Modals */}
      <CreateEventModal open={showCreateEvent} onOpenChange={setShowCreateEvent} />
      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} onSuccess={() => setShowCreatePost(false)} />}
      {commentPostId && <CommentsModal postId={commentPostId} onClose={() => setCommentPostId(null)} />}
    </div>
  );
}