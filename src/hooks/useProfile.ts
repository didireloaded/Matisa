import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from "@/stores/authStore";

export interface ProfileData {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  avatarUrl?: string;
  location?: string;
}

export function useProfile(userId?: string) {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const targetId = userId || user?.id;
    if (!targetId) {
      setIsLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();

        if (error) throw error;

        if (data) {
          setProfile({
            id: data.id,
            username: data.username,
            fullName: data.full_name,
            bio: data.bio,
            avatarUrl: data.avatar_url,
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [userId, user?.id]);

  return { profile, isLoading };
}
