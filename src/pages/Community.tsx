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
        <h1 className="text-lg font-bold font-display text-foreground truncat
<truncated 2125 bytes>