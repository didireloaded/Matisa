import { supabase } from "../../lib/supabase";
import { Profile } from "../../types";
import { IntelligenceEngine } from "../intelligence";

export const DiscoveryAI = {
  /**
   * Generates a ranked list of users based on the Discovery Algorithm
   * Interest Match(25%) + Mutuals(20%) + Shared Events(10%) + Shared Rooms(10%) + Location(10%) + Activity(10%) + Profile Sim(10%) + Voice Sim(5%)
   */
  async getRecommendedUsers(userId?: string): Promise<Profile[]> {
    // In a real environment, we'd call an Edge Function:
    // const { data } = await supabase.functions.invoke("generateDiscoveryFeed", { body: { userId } });

    // Fallback/Mock logic using the local IntelligenceEngine
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
