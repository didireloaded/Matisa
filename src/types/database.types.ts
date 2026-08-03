export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          full_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          banner_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          type: "text" | "voice";
          note_kind: "temporary" | "permanent";
          audio_url: string | null;
          duration_seconds: number | null;
          waveform_data: Json | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: string;
          type?: "text" | "voice";
          note_kind?: "temporary" | "permanent";
          audio_url?: string | null;
          duration_seconds?: number | null;
          waveform_data?: Json | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          type?: "text" | "voice";
          note_kind?: "temporary" | "permanent";
          audio_url?: string | null;
          duration_seconds?: number | null;
          waveform_data?: Json | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          status: "pending" | "accepted";
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          status?: "pending" | "accepted";
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          status?: "pending" | "accepted";
          created_at?: string;
        };
      };
      saves: {
        Row: {
          id: string;
          user_id: string;
          note_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          note_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          note_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          note_id: string;
          author_id: string;
          content: string | null;
          media_url: string | null;
          media_type: "voice" | "image" | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          author_id: string;
          content?: string | null;
          media_url?: string | null;
          media_type?: "voice" | "image" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          author_id?: string;
          content?: string | null;
          media_url?: string | null;
          media_type?: "voice" | "image" | null;
          created_at?: string;
        };
      };
      reactions: {
        Row: {
          id: string;
          user_id: string;
          target_type:
            | "note"
            | "story"
            | "message"
            | "voice"
            | "room"
            | "karaoke_performance"
            | "event";
          target_id: string;
          reaction_type: "heart" | "fire" | "laugh" | "applause";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type:
            | "note"
            | "story"
            | "message"
            | "voice"
            | "room"
            | "karaoke_performance"
            | "event";
          target_id: string;
          reaction_type: "heart" | "fire" | "laugh" | "applause";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          target_type?:
            | "note"
            | "story"
            | "message"
            | "voice"
            | "room"
            | "karaoke_performance"
            | "event";
          target_id?: string;
          reaction_type?: "heart" | "fire" | "laugh" | "applause";
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          actor_id: string;
          type: "like" | "reply" | "voice_reply" | "follow" | "follow_request" | "system";
          related_id: string | null;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          actor_id: string;
          type: "like" | "reply" | "voice_reply" | "follow" | "follow_request" | "system";
          related_id?: string | null;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          actor_id?: string;
          type?: "like" | "reply" | "voice_reply" | "follow" | "follow_request" | "system";
          related_id?: string | null;
          title?: string;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
      };
    };
    Functions: {
      follow_user: {
        Args: { p_follower: string; p_following: string };
        Returns: void;
      };
      unfollow_user: {
        Args: { p_follower: string; p_following: string };
        Returns: void;
      };
      get_unified_notes_feed: {
        Args: { p_limit?: number; p_offset?: number; p_user_id?: string | null };
        Returns: {
          id: string;
          user_id: string;
          content: string;
          type: string;
          note_kind: string;
          audio_url: string | null;
          duration_seconds: number | null;
          waveform_data: Json | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
          author_id: string;
          author_username: string;
          author_display_name: string | null;
          author_avatar_url: string | null;
          reaction_count: number;
          reply_count: number;
          user_has_reacted: boolean;
          user_has_saved: boolean;
        }[];
      };
    };
  };
}
