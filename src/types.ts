export type Region =
  | 'Khomas' | 'Erongo' | 'Hardap' | '//Karas' | 'Kavango East' | 'Kavango West'
  | 'Kunene' | 'Ohangwena' | 'Omaheke' | 'Omusati' | 'Oshana' | 'Oshikoto'
  | 'Otjozondjupa' | 'Zambezi';

export const REGIONS: Region[] = [
  'Khomas','Erongo','Hardap','//Karas','Kavango East','Kavango West',
  'Kunene','Ohangwena','Omaheke','Omusati','Oshana','Oshikoto','Otjozondjupa','Zambezi',
];

export type Interest =
  | 'Photography' | 'Film' | 'Music' | 'Cars' | 'Sports'
  | 'Fashion' | 'Business' | 'Gaming' | 'Tech' | 'Travel' | 'Art' | 'Food';

export const INTERESTS: Interest[] = [
  'Photography','Film','Music','Cars','Sports','Fashion',
  'Business','Gaming','Tech','Travel','Art','Food',
];

export type GhostMode = 'hidden' | 'approximate' | 'exact';
export type PostType   = 'text' | 'photo' | 'video' | 'voice';
export type MediaType  = 'image' | 'video' | 'audio';

export interface Profile {
  id:              string;
  username:        string;
  display_name:    string;
  bio:             string | null;
  avatar_url:      string | null;
  cover_url:       string | null;
  region:          Region | null;
  city:            string | null;
  mood:            string | null;
  song_title:      string | null;
  song_artist:     string | null;
  is_verified:     boolean;
  ghost_mode:      GhostMode;
  follower_count:  number;
  following_count: number;
  post_count:      number;
  interests?:      Interest[];
  created_at:      string;
  // transient (set client-side from radar/follow queries)
  distance?:       number;
  is_following?:   boolean;
}

export interface Post {
  id:               string;
  user_id:          string;
  content:          string | null;
  type:             PostType;
  media_urls:       string[] | null;
  voice_url:        string | null;
  voice_duration:   number | null;
  region:           Region | null;
  location_name:    string | null;
  like_count:       number;
  comment_count:    number;
  repost_count:     number;
  save_count:       number;
  is_repost:        boolean;
  original_post_id: string | null;
  created_at:       string;
  profiles:         Profile;
  liked?:           boolean;
  saved?:           boolean;
}

export interface Comment {
  id:         string;
  post_id:    string;
  user_id:    string;
  content:    string;
  like_count: number;
  created_at: string;
  profiles:   Profile;
  liked?:     boolean;
}

export interface Story {
  id:         string;
  user_id:    string;
  media_url:  string;
  media_type: MediaType;
  caption:    string | null;
  expires_at: string;
  view_count: number;
  created_at: string;
  profiles:   Profile;
  viewed?:    boolean;
}

export interface Event {
  id:            string;
  created_by:    string;
  title:         string;
  description:   string | null;
  cover_url:     string | null;
  location_name: string | null;
  region:        Region | null;
  starts_at:     string;
  ends_at:       string | null;
  rsvp_count:    number;
  is_free:       boolean;
  ticket_price:  number | null;
  ticket_link:   string | null;
  category:      string | null;
  created_at:    string;
  profiles:      Profile;
  rsvpd?:        boolean;
}

export interface Community {
  id:           string;
  name:         string;
  slug:         string;
  description:  string | null;
  cover_url:    string | null;
  region:       Region | null;
  category:     string | null;
  member_count: number;
  post_count:   number;
  created_at:   string;
  joined?:      boolean;
}

export interface Conversation {
  id:              string;
  is_group:        boolean;
  group_name:      string | null;
  group_avatar:    string | null;
  created_by:      string | null;
  last_message:    string | null;
  last_message_at: string | null;
  created_at:      string;
  members:         Profile[];
  unread_count?:   number;
}

export interface Message {
  id:              string;
  conversation_id: string;
  sender_id:       string;
  content:         string | null;
  media_url:       string | null;
  media_type:      string | null;
  gif_url:         string | null;
  reply_to_id:     string | null;
  is_edited:       boolean;
  is_deleted:      boolean;
  created_at:      string;
  profiles:        Profile;
}

export interface Notification {
  id:           string;
  recipient_id: string;
  actor_id:     string;
  type:         'like' | 'comment' | 'follow' | 'repost' | 'mention' | 'message' | 'event_rsvp' | 'community_post';
  entity_id:    string | null;
  entity_type:  string | null;
  body:         string | null;
  is_read:      boolean;
  created_at:   string;
  profiles:     Profile;
}

export interface RadarUser {
  id:           string;
  username:     string;
  display_name: string;
  avatar_url:   string | null;
  region:       string | null;
  city:         string | null;
  mood:         string | null;
  ghost_mode:   GhostMode;
  distance_m:   number;
}

export interface SearchResults {
  profiles: Profile[];
  posts:    Post[];
}

// Utility
export function fmtCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export function timeAgo(ts: string): string {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (d < 60)       return `${d}s`;
  if (d < 3600)     return `${Math.floor(d / 60)}m`;
  if (d < 86400)    return `${Math.floor(d / 3600)}h`;
  if (d < 604800)   return `${Math.floor(d / 86400)}d`;
  return `${Math.floor(d / 604800)}w`;
}
