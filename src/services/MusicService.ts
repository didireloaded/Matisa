import { supabase } from "@/lib/supabase";

export interface Album {
  id: string;
  creator_id: string;
  title: string;
  cover_url: string;
  release_date: string;
}

export interface Song {
  id: string;
  album_id: string;
  creator_id: string;
  title: string;
  cover_url: string;
  audio_url: string;
  duration: string;
  plays: number;
  profiles?: {
    display_name: string;
    username: string;
  };
}

export const MusicService = {
  /**
   * Fetches the top trending tracks globally.
   */
  async getTopTracks(): Promise<Song[]> {
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*, profiles(display_name, username)")
        .order("plays", { ascending: false })
        .limit(20);

      if (error) {
        // If the table doesn't exist yet, return empty
        if (error.code === "42P01") return [];
        throw error;
      }
      return data || [];
    } catch (err) {
      console.error("Failed to load top tracks:", err);
      return [];
    }
  },

  /**
   * Fetches featured albums.
   */
  async getFeaturedAlbums(): Promise<Album[]> {
    try {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        if (error.code === "42P01") return [];
        throw error;
      }
      return data || [];
    } catch (err) {
      console.error("Failed to load featured albums:", err);
      return [];
    }
  },
};
