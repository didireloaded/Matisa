export type Region =
  | "Khomas" | "Erongo" | "Hardap" | "//Karas" | "Kavango East" | "Kavango West"
  | "Kunene" | "Ohangwena" | "Omaheke" | "Omusati" | "Oshana" | "Oshikoto"
  | "Otjozondjupa" | "Zambezi";

export type CreatorBadge =
  | "Photographer" | "Videographer" | "Model" | "DJ" | "Musician"
  | "Event Planner" | "Makeup Artist" | "Filmmaker" | "Designer";

export type Interest =
  | "Photography" | "Film" | "Music" | "Cars" | "Sports"
  | "Fashion" | "Business" | "Gaming" | "Tech" | "Travel" | "Art" | "Food";

export type GhostMode = "hidden" | "approximate" | "exact";

export type PostType = "text" | "voice" | "photo" | "video" | "reel" | "poll" | "location";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  gradient: string;
  region: Region;
  city: string;
  mood: string;
  interests: Interest[];
  creator_badge?: CreatorBadge;
  is_creator: boolean;
  is_verified: boolean;
  is_plus: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  distance?: number;
  bearing?: number;
  song_title?: string;
  song_artist?: string;
  voice_intro_url?: string;
  voice_intro_duration?: number;
  joined_date: string;
  ghost_mode: GhostMode;
  online: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  content?: string;
  type: PostType;
  media_url?: string;
  media_urls?: string[];
  voice_duration?: number;
  region: Region;
  created_at: string;
  profiles: Profile;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  saves_count: number;
  liked?: boolean;
  saved?: boolean;
}

export interface Story {
  id: string;
  user_id: string;
  kind: "image" | "video" | "audio";
  caption?: string;
  media_url: string;
  gradient: string;
  viewed?: boolean;
  expires_at: string;
}

export interface EventItem {
  id: string;
  created_by: string;
  title: string;
  description: string;
  location_name: string;
  region: Region;
  date: string;
  time: string;
  rsvp_count: number;
  interested_count: number;
  is_free: boolean;
  price?: number;
  gradient: string;
  has_tickets: boolean;
  has_event_chat: boolean;
  attendee_ids: string[];
  category: string;
  rsvpd?: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
  post_count: number;
  today_posts: number;
  active_users: number;
  gradient: string;
  is_region: boolean;
  region?: Region;
  category?: string;
  joined?: boolean;
}

export interface Playlist {
  id: string;
  user_id: string;
  title: string;
  description: string;
  track_count: number;
  followers_count: number;
  gradient: string;
  is_public: boolean;
  votes: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  kind: "text" | "voice" | "image" | "video" | "gif";
  voice_duration?: number;
  created_at: string;
  read: boolean;
  reactions?: string[];
}

export interface Conversation {
  id: string;
  is_group: boolean;
  group_name?: string;
  member_ids: string[];
  last_message: string;
  last_message_at: string;
  unread: number;
}

export interface AppNotification {
  id: string;
  type: "like" | "comment" | "follow" | "repost" | "rsvp" | "mention" | "view" | "event_invite";
  actor_id: string;
  recipient_id: string;
  body: string;
  when: string;
  bucket: "today" | "week" | "earlier";
  read: boolean;
}

export interface TrendingItem {
  id: string;
  title: string;
  subtitle: string;
  type: "event" | "community" | "topic" | "creator";
  entity_id: string;
  engagement: number;
}
