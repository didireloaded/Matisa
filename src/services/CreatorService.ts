import { supabase } from "@/lib/supabase";
import { Analytics } from "@/services/analytics";

export interface CreatorProfile {
  id: string;
  user_id: string;
  is_verified: boolean;
  creator_badge: string | null;
  stripe_account_id: string | null;
  monetization_enabled: boolean;
  subscription_price: number | null;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string;
    followers_count: number;
    username: string;
    bio: string;
    location: string;
  };
}

export const CreatorService = {
  /**
   * Fetches trending creators ordered by follower count.
   */
  async getTrendingCreators(limit = 20): Promise<CreatorProfile[]> {
    try {
      const { data, error } = await supabase
        .from("creator_profiles")
        .select(`
          *,
          profiles(display_name, avatar_url, follower_count, username, bio, location)
        `)
        .order("created_at", { ascending: false }) // Or we can order by profiles.follower_count if we had an RPC or joined view
        .limit(limit);

      if (error) throw error;
      // Sort by follower_count client-side since we can't order by foreign table directly without RPC
      const sortedData = (data as any[]).sort((a, b) => {
        const followersA = a.profiles?.follower_count || 0;
        const followersB = b.profiles?.follower_count || 0;
        return followersB - followersA;
      });

      return sortedData as CreatorProfile[];
    } catch (err) {
      console.error("Failed to load trending creators:", err);
      return [];
    }
  },

  /**
   * Fetches a spotlight creator (e.g., highly rated or verified)
   */
  async getSpotlightCreator(): Promise<CreatorProfile | null> {
    try {
      // Prioritize verified creators with the most followers
      const { data, error } = await supabase
        .from("creator_profiles")
        .select(`
          *,
          profiles(display_name, avatar_url, follower_count, username, bio, location, cover_url)
        `)
        .eq("is_verified", true)
        .limit(5);

      if (error) throw error;

      if (!data || data.length === 0) {
        // Fallback to any creator if no verified ones exist
        const { data: fallbackData } = await supabase
          .from("creator_profiles")
          .select(`*, profiles(display_name, avatar_url, follower_count, username, bio, location, cover_url)`)
          .limit(1);
        
        return fallbackData?.[0] as CreatorProfile || null;
      }

      // Pick the one with the most followers
      const sortedData = (data as any[]).sort((a, b) => {
        const followersA = a.profiles?.follower_count || 0;
        const followersB = b.profiles?.follower_count || 0;
        return followersB - followersA;
      });

      return sortedData[0] as CreatorProfile;
    } catch (err) {
      console.error("Failed to load spotlight creator:", err);
      return null;
    }
  },

  /**
   * Enrolls a user as a creator
   */
  async becomeCreator(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("creator_profiles")
        .insert({
          user_id: userId,
          is_verified: false,
          monetization_enabled: false,
        });

      if (error) {
        // If they are already a creator, it might throw a unique constraint error (23505)
        if (error.code === '23505') return true; 
        throw error;
      }

      // Update their profile is_creator status (if we have an RPC or if the backend handles it)
      // Since is_creator is often inferred or tracked via this table, inserting might be enough.
      // But let's also try to update the `profiles` or `users` table if `is_creator` column exists.
      
      Analytics.track("became_creator", { user_id: userId });
      
      return true;
    } catch (err) {
      console.error("Failed to enroll creator:", err);
      return false;
    }
  }
};
