---
name: matisa-intelligence-engine
description: Rules for building and integrating AI, Discovery, and Intelligence algorithms in the Matisa App (V1).
---

# Matisa Intelligence Engine Guidelines

When adding new feed or recommendation logic to Matisa, you must route the ranking through the centralized Intelligence algorithms. Do not build simple CRUD sorts (e.g., `ORDER BY created_at DESC`).

## 1. The Central Intelligence Engine
All scoring mathematics should be managed via `src/services/intelligence.ts`. 
Do not hardcode ranking weights in UI components. Call the specific algorithm function (e.g., `calculateDiscoveryScore`, `calculateHomeScore`).

## 2. Core Scoring Models
When building features, adhere to these inputs:
- **Trust Score (0-100):** Verification + Profile Quality + Account Age + Behavior Quality - Risk Factors.
- **Discovery Algorithm:** Interest Match (25%) + Mutuals (20%) + Shared Events (10%) + Shared Rooms (10%) + Location Sim (10%) + Activity Sim (10%) + Profile Sim (10%) + Voice Sim (5%).
- **Home Ranking:** Combines Discovery, Activity, Voice, Trust, Creator, and Social Scores with a Freshness multiplier.
- **Trending Decay:** Freshness must decay logarithmically (e.g., 1h = 100%, 24h = 50%, 72h = 10%).

## 3. Explaining Recommendations
Do not build "black box" algorithms. Whenever returning an AI-ranked list (Users, Events, Rooms), always provide an `explanation` or `reason` (e.g., "You both like R&B", "3 mutual connections") to satisfy the UX Social Proof requirement.

## 4. Edge Function Fallbacks
The primary intelligence algorithms run via Supabase Edge Functions. If the Edge Function fails or is not yet implemented, provide a robust local calculation fallback in the client-side `IntelligenceEngine` using randomized or local metrics for demonstration.
