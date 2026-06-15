import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFollow(targetUserId: string | undefined) {
  const { profile } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkStatus() {
      if (!profile?.id || !targetUserId || profile.id === targetUserId) {
        if (mounted) setIsFollowing(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", profile.id)
        .eq("following_id", targetUserId)
        .maybeSingle();
      
      if (mounted) {
        setIsFollowing(!!data && !error);
      }
    }
    checkStatus();
    return () => { mounted = false; };
  }, [profile?.id, targetUserId]);

  const toggleFollow = async () => {
    if (!profile?.id || !targetUserId) {
      toast.error("You need to be signed in to follow users.");
      return;
    }
    if (profile.id === targetUserId) return;
    
    setLoading(true);
    const newStatus = !isFollowing;
    setIsFollowing(newStatus); // optimistic update
    
    try {
      if (newStatus) {
        const { error } = await supabase.rpc("follow_user", {
          p_follower: profile.id,
          p_following: targetUserId
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc("unfollow_user", {
          p_follower: profile.id,
          p_following: targetUserId
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update follow status.");
      setIsFollowing(!newStatus); // revert
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, toggleFollow, loading };
}
