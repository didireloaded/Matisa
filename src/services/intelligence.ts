// MATISA INTELLIGENCE ENGINE V1
// Core Engine logic for ranking, scoring, and algorithmic recommendation.

import { supabase } from "../lib/supabase";
import { Profile } from "../types";

export class IntelligenceEngine {
  /**
   * HOME RANKING ALGORITHM
   * Discovery(35%) + Activity(15%) + Voice(15%) + Trust(10%) + Creator(10%) + Social(10%) + Freshness(5%)
   */
  static calculateHomeScore(
    discoveryScore: number,
    activityScore: number,
    voiceScore: number,
    trustScore: number,
    creatorScore: number,
    socialScore: number,
    freshnessScore: number,
  ): number {
    return (
      discoveryScore * 0.35 +
      activityScore * 0.15 +
      voiceScore * 0.15 +
      trustScore * 0.1 +
      creatorScore * 0.1 +
      socialScore * 0.1 +
      freshnessScore * 0.05
    );
  }

  /**
   * TRENDING ENGINE
   * Velocity × Engagement × Freshness
   * Freshness Decay: 1h=100%, 6h=90%, 12h=75%, 24h=50%, 48h=25%, 72h=10%
   */
  static calculateTrendingScore(velocity: number, engagement: number, hoursOld: number): number {
    let freshnessMultiplier = 1.0;
    if (hoursOld >= 72) freshnessMultiplier = 0.1;
    else if (hoursOld >= 48) freshnessMultiplier = 0.25;
    else if (hoursOld >= 24) freshnessMultiplier = 0.5;
    else if (hoursOld >= 12) freshnessMultiplier = 0.75;
    else if (hoursOld >= 6) freshnessMultiplier = 0.9;
    else freshnessMultiplier = 1.0;

    return velocity * engagement * freshnessMultiplier;
  }

  /**
   * DISCOVERY ALGORITHM
   * Interest Match(25%) + Mutuals(20%) + Shared Events(10%) + Shared Rooms(10%) + Location(10%) + Activity(10%) + Profile Sim(10%) + Voice Sim(5%)
   */
  static calculateDiscoveryScore(
    interestMatch: number,
    mutuals: number,
    sharedEvents: number,
    sharedRooms: number,
    locationSim: number,
    activitySim: number,
    profileSim: number,
    voiceSim: number,
  ): number {
    return (
      interestMatch * 0.25 +
      mutuals * 0.2 +
      sharedEvents * 0.1 +
      sharedRooms * 0.1 +
      locationSim * 0.1 +
      activitySim * 0.1 +
      profileSim * 0.1 +
      voiceSim * 0.05
    );
  }

  /**
   * KARAOKE ALGORITHM
   * Audience Rating(40%) + Engagement(20%) + Participation(20%) + Growth(10%) + Consistency(10%)
   */
  static calculatePerformanceScore(
    audienceRating: number,
    engagement: number,
    participation: number,
    growth: number,
    consistency: number,
  ): number {
    return (
      audienceRating * 0.4 +
      engagement * 0.2 +
      participation * 0.2 +
      growth * 0.1 +
      consistency * 0.1
    );
  }

  /**
   * EVENT RECOMMENDATION ENGINE
   * Interest Match(40%) + Friend Attendance(20%) + Creator Attendance(15%) + Location(15%) + Community Relevance(10%)
   */
  static calculateEventScore(
    interestMatch: number,
    friendAttendance: number,
    creatorAttendance: number,
    location: number,
    communityRelevance: number,
  ): number {
    return (
      interestMatch * 0.4 +
      friendAttendance * 0.2 +
      creatorAttendance * 0.15 +
      location * 0.15 +
      communityRelevance * 0.1
    );
  }

  /**
   * OPPORTUNITY ALGORITHM
   * Skill Match(40%) + Availability(20%) + Location(15%) + Trust Score(15%) + Activity(10%)
   */
  static calculateOpportunityScore(
    skillMatch: number,
    availability: number,
    location: number,
    trustScore: number,
    activity: number,
  ): number {
    return (
      skillMatch * 0.4 + availability * 0.2 + location * 0.15 + trustScore * 0.15 + activity * 0.1
    );
  }

  /**
   * TRUST SCORE
   * Base + Positive Signals - Negative Signals
   */
  static calculateTrustScore(
    verification: number, // 0-20
    profileQuality: number, // 0-20
    accountAge: number, // 0-20
    behaviorQuality: number, // 0-40
    riskFactors: number, // 0-100
  ): number {
    const rawScore = verification + profileQuality + accountAge + behaviorQuality - riskFactors;
    return Math.max(0, Math.min(100, rawScore));
  }
}
