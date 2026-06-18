# MATISA V2 DATABASE + AI + BACKEND OVERHAUL

## OBJECTIVE
Transform Matisa from a CRUD social app into an intelligent social platform.
The backend should understand users, interests, relationships, communities, opportunities, events, rooms, and creators.

---

# NEW DATABASE MODULES
## USER INTELLIGENCE
Tables: user_interests, user_behavior, user_activity_patterns, user_relationships, user_preferences, user_traits
Create a living profile of each user.

## INTEREST GRAPH
Table: user_interests
Fields: user_id, interest, score, confidence, updated_at

## RELATIONSHIP GRAPH
Table: user_relationships
Fields: user_a, user_b, relationship_score, message_score, event_score, room_score, voice_score, mutual_score

## OPPORTUNITY GRAPH
Tables: opportunities, opportunity_applications, opportunity_matches, talent_profiles
Power Jobs, Collaborations, Casting Calls, Crew Finder.

## VOICE INTELLIGENCE
Tables: voice_activity, voice_preferences, voice_interactions, voice_statistics

## ROOM INTELLIGENCE
Tables: room_statistics, room_membership_history, room_recommendations

## CREATOR INTELLIGENCE
Tables: creator_scores, creator_growth, creator_analytics, creator_audience

## EVENT INTELLIGENCE
Tables: event_scores, event_recommendations, event_engagement, event_predictions

---

# AI DATABASE LAYER
## USER EMBEDDINGS
Table: user_embeddings
Purpose: Store vector representation of users for pgvector similarity search.

## CONTENT EMBEDDINGS
Tables: note_embeddings, voice_embeddings, event_embeddings, room_embeddings, creator_embeddings

## SMART SEARCH
Semantic Search using pgvector to understand intent.

---

# BACKEND SERVICES
Create in `services/`:
AuthService, ProfileService, DiscoveryService, VoiceService, RoomService, KaraokeService, EventService, OpportunityService, RecommendationService, SearchService, SafetyService, AnalyticsService, NotificationService, CreatorService, RelationshipService

## RECOMMENDATION & DISCOVERY ENGINES
RecommendationService & DiscoveryService

## AI LAYER (Invisible)
Modules: DiscoveryAI, RecommendationAI, SearchAI, CreatorAI, SafetyAI, RetentionAI, OpportunityAI, RelationshipAI

---

# SAFETY ENGINE
Tables: risk_scores, safety_flags, moderation_queue, spam_signals, bot_signals

# RETENTION ENGINE
Table: retention_scores

# NOTIFICATION INTELLIGENCE
Tables: notification_behavior, notification_preferences

# ANALYTICS OVERHAUL
Track everything: Profile Views, Voice Plays, Room Joins, Event Attendance, Karaoke Participation, Discovery Clicks, Search Queries, Opportunity Applications.

---

# EDGE FUNCTIONS
New Functions:
calculateRelationshipScore, generateRecommendations, generateDiscoveryFeed, recommendEvents, recommendRooms, recommendCreators, recommendOpportunities, calculateCreatorScore, calculateTrustScore, predictRetentionRisk, detectFakeAccounts, generateUserEmbedding, generateContentEmbedding, semanticSearch

# FUTURE PGVECTOR
Prepare database now for pgvector support, vector indexes, embedding storage, semantic retrieval, and similarity search.
