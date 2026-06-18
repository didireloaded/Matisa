import { supabase } from "@/lib/supabase";
import { Profile } from "@/types";

export interface TopConnection {
  user: Profile;
  score: number;
  last_interaction_at: string;
}

export const SocialGraphService = {
  /**
   * Fetches the top connections for a given user, joining with the profiles table.
   */
  async getTopConnections(userId: string, limitCount = 5): Promise<TopConnection[]> {
    try {
      const { data, error } = await supabase.rpc("get_top_connections", {
        uid: userId,
        limit_count: limitCount,
      });

      if (error) {
        console.error("Error fetching top connections:", error);
        return [];
      }

      if (!data || data.length === 0) return [];

      // Fetch profiles for these connections
      const profileIds = data.map((row: any) => row.connected_user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", profileIds);

      if (profilesError) {
        console.error("Error fetching profiles for connections:", profilesError);
        return [];
      }

      // Map back together
      return data
        .map((row: any) => {
          const profile = profiles.find((p: any) => p.id === row.connected_user_id);
          return {
            user: profile as Profile,
            score: row.score,
            last_interaction_at: row.last_interaction_at,
          };
        })
        .filter((c: any) => c.user !== undefined);
    } catch (e) {
      console.error("Exception in getTopConnections:", e);
      return [];
    }
  },
};
