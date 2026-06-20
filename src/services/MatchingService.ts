import { supabase } from "@/lib/supabase";
import { Analytics } from "@/services/analytics";

export interface MatchingProfile {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  tags: string[];
  distance: string;
}

export const MatchingService = {
  /**
   * Fetches potential profiles for matching.
   * Excludes users we've already swiped on.
   */
  async getPotentialMatches(userId: string): Promise<MatchingProfile[]> {
    try {
      // Get IDs we've already swiped on
      const { data: swipes } = await supabase
        .from("creator_swipes")
        .select("swipee_id")
        .eq("swiper_id", userId);

      const swipedIds = (swipes || []).map((s) => s.swipee_id);

      // Fetch profiles that are not the user and not already swiped
      let query = supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio, role, location, tags")
        .neq("id", userId)
        .limit(20);

      if (swipedIds.length > 0) {
        query = query.not("id", "in", `(${swipedIds.join(",")})`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.id,
        name: p.display_name || "Unknown",
        role: p.role || "Creator",
        image:
          p.avatar_url || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800&q=80",
        bio: p.bio || "No bio available.",
        tags: Array.isArray(p.tags) ? p.tags : [],
        distance: p.location ? `In ${p.location}` : "Location unknown",
      }));
    } catch (err) {
      console.error("Failed to load potential matches:", err);
      return [];
    }
  },

  /**
   * Records a swipe on a profile.
   */
  async recordSwipe(swiperId: string, swipeeId: string, isRightSwipe: boolean): Promise<boolean> {
    try {
      const { error } = await supabase.from("creator_swipes").insert({
        swiper_id: swiperId,
        swipee_id: swipeeId,
        is_right_swipe: isRightSwipe,
      });

      if (error) {
        // Ignore unique constraint if they somehow swiped twice
        if (error.code === "23505") return true;
        throw error;
      }

      Analytics.track("swipe_creator", {
        direction: isRightSwipe ? "right" : "left",
        target: swipeeId,
      });
      return true;
    } catch (err) {
      console.error("Failed to record swipe:", err);
      return false;
    }
  },
};
