import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from "@/contexts/AuthContext";

export interface Event {
  id: string;
  title: string;
  description: string;
  cover_url: string | null;
  event_type: 'in_person' | 'karaoke' | 'virtual';
  location_name: string | null;
  start_time: string;
  end_time: string | null;
  created_by: string;
  community_id: string | null;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  communities?: {
    name: string;
  };
}

export function useEvents(communityId?: string) {
  const { session } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          profiles!events_created_by_fkey (username, full_name, avatar_url),
          communities (name)
        `)
        .gte('start_time', new Date().toISOString()) // Only upcoming
        .order('start_time', { ascending: true });

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [communityId]);

  const createEvent = async (eventData: {
    title: string;
    description: string;
    event_type: 'in_person' | 'karaoke' | 'virtual';
    start_time: string;
    location_name?: string;
    community_id?: string;
    coverFile?: File;
  }) => {
    if (!session?.user) throw new Error('Must be logged in');

    try {
      let cover_url = null;

      // Upload cover image if provided
      if (eventData.coverFile) {
        const fileExt = eventData.coverFile.name.split('.').pop();
        const fileName = `event-${Date.now()}.${fileExt}`;
        const filePath = `events/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, eventData.coverFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
          
        cover_url = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_type: eventData.event_type,
          start_time: eventData.start_time,
          location_name: eventData.location_name,
          community_id: eventData.community_id,
          cover_url,
          created_by: session.user.id
        });

      if (error) throw error;
      
      // Refresh list
      await fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  };

  return { events, isLoading, createEvent, fetchEvents };
}
