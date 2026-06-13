import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { RadarUser } from "@/types";

export function useRadar() {
  const { profile } = useAuth();
  const [nearbyUsers, setNearbyUsers] = useState<RadarUser[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 1. Fetch nearby users
  useEffect(() => {
    async function fetchNearby() {
      if (!true /* profile.location mock */) {
        setLoading(false);
        return;
      }
      
      // In a real postgis setup, you'd extract lat/lng from profile.location
      // Assuming a mock or simple structure for now if postgis isn't perfectly wired
      const lat = 0; // Replace with actual extraction if needed
      const lng = 0;
      
      // Using the RPC from schema
      const { data, error } = await supabase.rpc('find_nearby_users', {
        user_lat: lat,
        user_lng: lng,
        radius_meters: 50000 // 50km
      });
      
      if (!error && data) {
        setNearbyUsers(data as RadarUser[]);
      } else {
        // Fallback if RPC is missing (e.g. 404) or fails
        console.warn('find_nearby_users RPC failed, falling back to basic profiles fetch.', error);
        const { data: fallbackData } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, region, city, mood, ghost_mode')
          .limit(20);
          
        if (fallbackData) {
          const mapped = fallbackData.map((p: any) => ({
            ...p,
            distance_m: Math.floor(Math.random() * 5000) // Mock distance
          }));
          setNearbyUsers(mapped as RadarUser[]);
        }
      }
      setLoading(false);
    }
    
    fetchNearby();
  }, [profile]);

  // 2. Realtime Presence for "Online"
  useEffect(() => {
    const channel = supabase.channel('room:radar');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineIds = new Set<string>();
        for (const key in state) {
          state[key].forEach((presence: any) => {
            if (presence.user_id) onlineIds.add(presence.user_id);
          });
        }
        setOnlineUserIds(onlineIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUserIds(prev => {
          const next = new Set(prev);
          newPresences.forEach((p: any) => p.user_id && next.add(p.user_id));
          return next;
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setOnlineUserIds(prev => {
          const next = new Set(prev);
          leftPresences.forEach((p: any) => p.user_id && next.delete(p.user_id));
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && profile) {
          await channel.track({ user_id: profile.id, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  return { nearbyUsers, onlineUserIds, loading };
}
