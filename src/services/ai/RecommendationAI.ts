import { supabase } from "../../lib/supabase";
import { IntelligenceEngine } from "../intelligence";

export const RecommendationAI = {
  /**
   * Fetches personalized event recommendations.
   */
  async getRecommendedEvents(userId?: string) {
    // const { data } = await supabase.functions.invoke("recommendEvents", { body: { userId } });

    // Mock local logic
    const score = IntelligenceEngine.calculateEventScore(
      Math.random() * 100, // Interest Match
      Math.random() * 100, // Friend Attendance
      Math.random() * 100, // Creator Attendance
      Math.random() * 100, // Location
      Math.random() * 100, // Community Relevance
    );

    return [{ id: "ev_1", title: "R&B Karaoke Night", score, is_recommended: true }];
  },

  /**
   * Fetches personalized opportunity recommendations.
   */
  async getRecommendedOpportunities(userId?: string) {
    // const { data } = await supabase.functions.invoke("recommendOpportunities", { body: { userId } });

    const score = IntelligenceEngine.calculateOpportunityScore(
      Math.random() * 100, // Skill Match
      Math.random() * 100, // Availability
      Math.random() * 100, // Location
      Math.random() * 100, // Trust Score
      Math.random() * 100, // Activity
    );

    return [{ id: "opp_1", title: "Looking for a Videographer", score, is_recommended: true }];
  },
};
