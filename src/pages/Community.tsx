import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Hash, Users, MapPin, Loader2 } from 'lucide-react';

export function Community() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCommunity = async () => {
      try {
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setCommunity(data);
      } catch (err) {
        console.error('Error fetching community:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunity();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Community not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-semibold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-bold font-display text-foreground truncate">{community.name}</h1>
      </div>

      {/* Cover / Info */}
      <div className="relative h-48 bg-secondary flex items-center justify-center overflow-hidden">
        {community.cover_url ? (
          <img src={community.cover_url} alt={community.name} className="w-full h-full object-cover" />
        ) : (
          <Hash className="w-16 h-16 text-muted-foreground/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-4">
          <h2 className="text-3xl font-black text-white drop-shadow-md">{community.name}</h2>
          <div className="flex items-center gap-3 text-white/80 mt-1 text-sm font-medium">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" /> 1.2K members
            </div>
            {community.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Local
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs & Area */}
      <div className="p-4">
        {community.description && (
          <p className="text-sm text-foreground/90 mb-6 bg-card p-3 rounded-xl border border-border">
            {community.description}
          </p>
        )}
        
        <div className="flex border-b border-border mb-4">
          <button className="flex-1 py-2 text-sm font-bold border-b-2 border-primary text-foreground">Posts</button>
          <button className="flex-1 py-2 text-sm font-bold border-b-2 border-transparent text-muted-foreground">Events</button>
          <button className="flex-1 py-2 text-sm font-bold border-b-2 border-transparent text-muted-foreground">Members</button>
        </div>

        <div className="text-center py-10 text-muted-foreground">
          <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No posts in this community yet.</p>
        </div>
      </div>
    </div>
  );
}
