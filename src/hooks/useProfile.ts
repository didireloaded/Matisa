import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface ProfileData {
  id: string;
  username: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
}

export function useProfile(userId?: string) {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const targetId = userId || user?.id;
    if (!targetId) {
      setIsLoading(false);
      return;
    }

    // If fetching current user and auth context already has it
    if (targetId === user?.id && authProfile) {
      setProfile(authProfile as any);
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
        if (data) setProfile(data as any);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [userId, user?.id, authProfile]);

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await updateProfile({ avatar_url: data.publicUrl });
      return data.publicUrl;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { profile, isLoading, updateProfile, uploadAvatar };
}
