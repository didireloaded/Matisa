import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface DiscoveryNote {
  id: string;
  user_id: string;
  content: string;
  type: string;
  audio_url: string;
  duration_seconds: number;
  heart_count: number;
  fire_count: number;
  laugh_count: number;
  created_at: string;
  discovery_score: number;
  profiles: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    level: number;
    trust_score: number;
  };
}

export function useDiscoveryFeed() {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<DiscoveryNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      if (!profile) return;
      setLoading(true);

      try {
        // Fallback or explicit call
        const { data, error } = await supabase.rpc("get_discovery_feed", {
          viewer_id: profile.id,
          limit_count: 50,
        });

        if (error) {
          console.error("Discovery Engine Error:", error);
          throw error;
        }

        // Map the flat RPC response back into the nested structure Home.tsx expects
        if (data) {
          const mappedNotes = data.map((row: any) => ({
            id: row.note_id,
            user_id: row.user_id,
            content: row.content,
            type: row.type,
            audio_url: row.audio_url,
            duration_seconds: row.duration_seconds,
            heart_count: row.heart_count,
            fire_count: row.fire_count,
            laugh_count: row.laugh_count,
            created_at: row.created_at,
            discovery_score: row.discovery_score,
            profiles: {
              id: row.user_id,
              username: row.author_username,
              display_name: row.author_display_name,
              avatar_url: row.author_avatar_url,
              level: row.author_level,
              trust_score: row.author_trust_score,
            },
          }));

          setNotes(mappedNotes);
        }
      } catch (err) {
        console.warn("Failed to fetch discovery feed", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();

    // Subscribe to new notes globally to keep feed somewhat fresh, though ordering requires recalculation
    const channel = supabase
      .channel("public:notes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notes" }, () => {
        // Debounce or just refetch top
        fetchFeed();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  return { notes, loading };
}
