/**
 * Comprehensive TypeScript type definitions for Matisa
 * Central source of truth for all data models
 */

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  is_verified: boolean;
  is_creator: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface UserProfile extends User {
  is_following: boolean;
  is_followed_by: boolean;
  mutual_followers_count: number;
}

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  phone?: string;
  phone_confirmed_at?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// POST TYPES
// ============================================================================

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
}

export interface Post {
  id: string;
  user_id: string;
  user?: User;
  content: string;
  media: Media[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface Note extends Omit<Post, 'media'> {
  expires_at?: string; // Ephemeral content
}

export interface Story extends Omit<Post, 'content' | 'likes_count' | 'comments_count' | 'shares_count'> {
  expires_at: string;
  views_count: number;
  viewed_by?: string[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user?: User;
  content: string;
  media?: Media[];
  likes_count: number;
  is_liked?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// ============================================================================
// ENGAGEMENT TYPES
// ============================================================================

export interface Like {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  user_id: string; // The user being followed
  follower_id: string; // The user following
  created_at: string;
  deleted_at?: string;
}

// ============================================================================
// MESSAGING TYPES
// ============================================================================

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  user?: User;
  content: string;
  media?: Media[];
  is_edited: boolean;
  read_by: string[]; // Array of user IDs who read this message
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ChatRoom {
  id: string;
  user_id: string;
  recipient_id: string;
  recipient?: User;
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface GroupChatRoom {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  members: User[];
  member_count: number;
  is_muted: boolean;
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface Event {
  id: string;
  user_id: string;
  user?: User;
  title: string;
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  start_at: string;
  end_at: string;
  image_url?: string;
  category: EventCategory;
  capacity?: number;
  current_attendees: number;
  is_attending?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type EventCategory =
  | 'music'
  | 'sports'
  | 'social'
  | 'business'
  | 'education'
  | 'entertainment'
  | 'other';

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  user?: User;
  status: 'attending' | 'interested' | 'declined';
  created_at: string;
}

// ============================================================================
// KARAOKE TYPES
// ============================================================================

export interface KaraokeRoom {
  id: string;
  name: string;
  host_id: string;
  host?: User;
  is_live: boolean;
  current_song?: KaraokeSong;
  current_queue: KaraokeSong[];
  participants: User[];
  max_participants: number;
  created_at: string;
  updated_at: string;
}

export interface KaraokeSong {
  id: string;
  title: string;
  artist: string;
  duration: number;
  added_by: string;
  position_in_queue: number;
  created_at: string;
}

export interface KaraokePerformance {
  id: string;
  room_id: string;
  user_id: string;
  user?: User;
  song_id: string;
  song?: KaraokeSong;
  score?: number;
  duration: number;
  started_at: string;
  ended_at: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'message'
  | 'mention'
  | 'event_reminder'
  | 'event_invite';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id?: string; // User who triggered the notification
  actor?: User;
  related_id?: string; // Post, comment, event ID, etc.
  title: string;
  message: string;
  image_url?: string;
  action_url?: string;
  read_at?: string;
  created_at: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

export type SearchType = 'users' | 'posts' | 'events' | 'hashtags';

export interface SearchResult {
  type: SearchType;
  results: Array<User | Post | Event | Hashtag>;
  total_count: number;
  query: string;
}

export interface Hashtag {
  id: string;
  name: string;
  posts_count: number;
  trending_rank?: number;
  created_at: string;
}

// ============================================================================
// MATCHING TYPES
// ============================================================================

export interface UserMatch {
  user: UserProfile;
  match_score: number; // 0-100
  common_interests: string[];
  mutual_followers_count: number;
}

export interface MatchPreferences {
  user_id: string;
  min_age?: number;
  max_age?: number;
  gender_preference?: string;
  distance_radius_km?: number;
  interests?: string[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ASYNC STATE TYPES
// ============================================================================

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: APIError };

export type PaginatedAsyncState<T> = AsyncState<PaginatedResponse<T>>;

export interface PaginatedResponse<T> {
  data: T[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ============================================================================
// API ERROR TYPES
// ============================================================================

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
  timestamp: string;
}

export interface ValidationError extends APIError {
  field_errors: Record<string, string[]>;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: AuditAction;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  changed_by: string;
  changed_at: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface UserEngagementStats {
  user_id: string;
  total_posts: number;
  total_likes_received: number;
  followers_count: number;
  avg_engagement: number;
  profile_views: number;
  updated_at: string;
}

export interface PostAnalytics {
  post_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
  reach: number;
  updated_at: string;
}

// ============================================================================
// FORM STATE TYPES
// ============================================================================

export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FieldMeta {
  value: unknown;
  error?: string;
  touched: boolean;
  isDirty: boolean;
}
