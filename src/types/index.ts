export type Region =
  | "Khomas"
  | "Erongo"
  | "Hardap"
  | "//Karas"
  | "Kavango East"
  | "Kavango West"
  | "Kunene"
  | "Ohangwena"
  | "Omaheke"
  | "Omusati"
  | "Oshana"
  | "Oshikoto"
  | "Otjozondjupa"
  | "Zambezi";

export const REGIONS: Region[] = [
  "Khomas",
  "Erongo",
  "Hardap",
  "//Karas",
  "Kavango East",
  "Kavango West",
  "Kunene",
  "Ohangwena",
  "Omaheke",
  "Omusati",
  "Oshana",
  "Oshikoto",
  "Otjozondjupa",
  "Zambezi",
];

export type Interest =
  | "Photography"
  | "Film"
  | "Music"
  | "Cars"
  | "Sports"
  | "Fashion"
  | "Business"
  | "Gaming"
  | "Tech"
  | "Travel"
  | "Art"
  | "Food";

export const INTERESTS: Interest[] = [
  "Photography",
  "Film",
  "Music",
  "Cars",
  "Sports",
  "Fashion",
  "Business",
  "Gaming",
  "Tech",
  "Travel",
  "Art",
  "Food",
];

export type GhostMode = "hidden" | "approximate" | "exact";
export type PostType = "text" | "photo" | "video" | "voice" | "reel" | "poll" | "location";
export type MediaType = "image" | "video" | "audio" | "gif";

export type CreatorBadge =
  | "Photographer"
  | "Videographer"
  | "Model"
  | "DJ"
  | "Musician"
  | "Event Planner"
  | "Makeup Artist"
  | "Filmmaker"
  | "Designer";

export interface Profile {
  id: string;
  username: string;
  display_name?: string; // supabase
  full_name?: string; // mock
  bio: string | null;
  avatar_url: string | null;
  cover_url?: string | null;
  gradient?: string; // mock
  region: Region | null;
  city: string | null;
  mood: string | null;
  interests?: Interest[];
  creator_badge?: CreatorBadge; // mock
  is_creator?: boolean; // mock
  is_verified: boolean;
  is_plus?: boolean; // mock
  follower_count?: number; // supabase
  follower_count?: number; // mock
  following_count: number;
  post_count?: number; // supabase
  posts_count?: number; // mock
  song_title?: string | null;
  song_artist?: string | null;
  voice_intro_url?: string | null;
  voice_intro_duration?: number | null;
  joined_date?: string; // mock
  created_at?: string; // supabase
  ghost_mode: GhostMode;
  online?: boolean; // mock
  distance?: number;
  bearing?: number; // mock
  is_following?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  type: PostType;
  media_url?: string | null; // mock
  media_urls: string[] | null;
  voice_url?: string | null; // supabase
  voice_duration?: number | null;
  region: Region | null;
  location_name?: string | null; // supabase
  like_count?: number; // supabase
  likes_count?: number; // mock
  comment_count?: number; // supabase
  comments_count?: number; // mock
  repost_count?: number; // supabase
  reposts_count?: number; // mock
  save_count?: number; // supabase
  saves_count?: number; // mock
  is_repost?: boolean; // supabase
  original_post_id?: string | null; // supabase
  created_at: string;
  profiles: Profile;
  liked?: boolean;
  saved?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  like_count: number;
  created_at: string;
  profiles: Profile;
  liked?: boolean;
}

export interface Story {
  id: string;
  user_id: string;
  kind?: MediaType; // mock
  media_type?: MediaType; // supabase
  media_url: string;
  caption: string | null;
  gradient?: string; // mock
  expires_at: string;
  view_count?: number; // supabase
  created_at?: string; // supabase
  profiles?: Profile; // supabase
  viewed?: boolean;
}

export interface EventItem {
  // Merged Event & EventItem
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  cover_url?: string | null; // supabase
  location_name: string | null;
  region: Region | null;
  date?: string; // mock
  time?: string; // mock
  starts_at?: string; // supabase
  ends_at?: string | null; // supabase
  rsvp_count: number;
  interested_count?: number; // mock
  is_free: boolean;
  price?: number; // mock
  ticket_price?: number | null; // supabase
  ticket_link?: string | null; // supabase
  gradient?: string; // mock
  has_tickets?: boolean; // mock
  has_event_chat?: boolean; // mock
  attendee_ids?: string[]; // mock
  category: string | null;
  created_at?: string; // supabase
  profiles?: Profile; // supabase
  rsvpd?: boolean;
}

export interface Community {
  id: string;
  name: string;
  slug?: string; // supabase
  description: string | null;
  cover_url?: string | null; // supabase
  gradient?: string; // mock
  member_count: number;
  post_count: number;
  today_posts?: number; // mock
  active_users?: number; // mock
  is_region?: boolean; // mock
  region: Region | null;
  category: string | null;
  created_at?: string; // supabase
  joined?: boolean;
}

export interface Conversation {
  id: string;
  is_group: boolean;
  group_name: string | null;
  group_avatar?: string | null; // supabase
  created_by?: string | null; // supabase
  member_ids?: string[]; // mock
  members?: Profile[]; // supabase
  last_message: string | null;
  last_message_at: string | null;
  created_at?: string; // supabase
  unread?: number; // mock
  unread_count?: number; // supabase
}

export interface ChatMessage {
  // Merged Message & ChatMessage
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  kind?: "text" | "voice" | "image" | "video" | "gif"; // mock
  media_url?: string | null; // supabase
  media_type?: string | null; // supabase
  gif_url?: string | null; // supabase
  voice_duration?: number | null;
  reply_to_id?: string | null; // supabase
  is_edited?: boolean; // supabase
  is_deleted?: boolean; // supabase
  created_at: string;
  read?: boolean; // mock
  reactions?: string[]; // mock
  profiles?: Profile; // supabase
}

export interface AppNotification {
  // Merged Notification & AppNotification
  id: string;
  recipient_id: string;
  actor_id: string;
  type:
    | "like"
    | "comment"
    | "follow"
    | "repost"
    | "mention"
    | "message"
    | "event_rsvp"
    | "community_post"
    | "rsvp"
    | "view"
    | "event_invite";
  entity_id?: string | null; // supabase
  entity_type?: string | null; // supabase
  body: string | null;
  when?: string; // mock
  bucket?: "today" | "week" | "earlier"; // mock
  is_read?: boolean; // supabase
  read?: boolean; // mock
  created_at?: string; // supabase
  profiles?: Profile; // supabase
}

export interface Playlist {
  id: string;
  user_id: string;
  title: string;
  description: string;
  track_count: number;
  follower_count?: number; // mock
  gradient: string; // mock
  is_public: boolean;
  votes: number;
  created_at?: string;
}

export interface TrendingItem {
  id: string;
  title: string;
  subtitle: string;
  type: "event" | "community" | "topic" | "creator";
  entity_id: string;
  engagement: number;
}

export interface SearchResults {
  profiles: Profile[];
  posts: Post[];
}

export function fmtCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function timeAgo(ts: string): string {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (d < 60) return `${d}s`;
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  if (d < 604800) return `${Math.floor(d / 86400)}d`;
  return `${Math.floor(d / 604800)}w`;
}
