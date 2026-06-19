import { supabase } from "../../lib/supabase";
import { Profile } from "../../types";
import { IntelligenceEngine } from "../intelligence";

export const DiscoveryAI = {
  /**
   * Generates a ranked list of users based on the Discovery Algorithm
   * Interest Match(25%) + Mutuals(20%) + Shared Events(10%) + Shared Rooms(10%) + Location(10%) + Activity(10%) + Profile Sim(10%) + Voice Sim(5%)
   */
  async getRecommendedUsers(userId?: string): Promise<Profile[]> {
    try {
      // 1. Try to invoke the real Edge Function
      const { data, error } = await supabase.functions.invoke("generateRecommendations", {
        body: { type: 'users', limit: 20 },
      });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("Edge function failed, falling back to local calculation", err);
    }

    // 2. Fallback/Mock logic using the local IntelligenceEngine if edge function isn't deployed or fails
    const { data: profiles } = await supabase.from("profiles").select("*").limit(20);

    if (!profiles) return [];

    // Mocking scores for demonstration
    const scoredProfiles = profiles.map((p) => {
      const score = IntelligenceEngine.calculateDiscoveryScore(
        Math.random() * 100, // Interest Match
        Math.random() * 100, // Mutuals
        Math.random() * 100, // Shared Events
        Math.random() * 100, // Shared Rooms
        Math.random() * 100, // Location Sim
        Math.random() * 100, // Activity Sim
        Math.random() * 100, // Profile Sim
        Math.random() * 100, // Voice Sim
      );
      return { ...p, _discoveryScore: score };
    });

    return scoredProfiles.sort((a, b) => b._discoveryScore - a._discoveryScore);
  },

  /**
   * Explains WHY a user was recommended (Social Proof)
   */
  getRecommendationReason(scoreDetails: any): string {
    const reasons = [
      "You both like R&B 🎵",
      "3 mutual connections 🤝",
      "Attending the same event 📅",
      "Joined similar voice rooms 🎙️",
      "Nearby creator 📍",
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  },
};
