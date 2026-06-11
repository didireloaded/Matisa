import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface ProfileData {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  avatarUrl?: string;
  location?: string;
  ghost_mode?: boolean;
  privacy_level?: string;
}

export function useProfile(userId?: string) {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    const targetId = userId || user?.id;
    if (!targetId) {
      setIsLoading(false);
      return;
    }

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
          location: data.location,
          ghost_mode: data.ghost_mode,
          privacy_level: data.privacy_level,
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId, user?.id]);

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) return;
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.username !== undefined) dbUpdates.username = updates.username;
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.ghost_mode !== undefined) dbUpdates.ghost_mode = updates.ghost_mode;
      if (updates.privacy_level !== undefined) dbUpdates.privacy_level = updates.privacy_level;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) throw error;
      
      // Optimistically update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateProfile({ avatarUrl: urlData.publicUrl });
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      throw err;
    }
  };

  return { profile, isLoading, refetch: fetchProfile, updateProfile, uploadAvatar };
}
