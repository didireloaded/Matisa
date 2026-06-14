# Feature Specifications

This document outlines the intended behavior for Matisa's core features in the new architecture.

## 1. People Discovery (Explore)
- **Goal:** Surface relevant connections without relying on a literal map interface.
- **Mechanics:** An algorithm (Invisible AI) evaluates mutual interests, location (city/region), and activity scores to generate a grid/list of recommended profiles.
- **UI:** High-quality avatar cards, "Add Friend" or "Follow" actions.

## 2. Stories
- **Goal:** Ephemeral, authentic day-to-day sharing.
- **Mechanics:** 24-hour expiration. Photos or short 15s videos. 
- **UI:** Horizontal bubbles at the top of `Home.tsx`. Fullscreen immersive viewer upon tap.

## 3. Notes
- **Goal:** Text-centric, low-friction thoughts or updates.
- **Mechanics:** Replaces legacy heavy posts for simple status updates. Supports gradient backgrounds.
- **UI:** Clean, typography-focused cards in the main feed.

## 4. Karaoke Rooms
- **Goal:** Real-time social audio entertainment.
- **Mechanics:** Powered by LiveKit (WebRTC). Users join a room, select a track, and take the stage. 
- **UI:** A stage view for speakers/singers, and an audience grid below. Synchronized lyrics display.

## 5. Invisible AI Layer
- **Goal:** Supercharge the platform without the user knowing they are interacting with AI.
- **Mechanics:** 
  - **Matchmaking:** Embeddings generated from user bios and interactions.
  - **Safety:** Automated toxic content filtering via Edge Functions.
  - **Ranking:** Intelligent feed sorting beyond strict chronological order.
- **UI:** Completely invisible. AI decisions only manifest as better content surfacing.
