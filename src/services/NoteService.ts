import { supabase } from "../lib/supabase";
import { AnalyticsAI } from "./ai/AnalyticsAI";

export interface Note {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  type?: "text" | "voice";
  audio_url?: string;
  duration_seconds?: number;
  waveform_data?: number[];
  profiles?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  reaction_count?: number;
  reply_count?: number;
}

export const NoteService = {
  /**
   * Fetches the latest notes for the feed
   */
  async getFeedNotes(limit = 20): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select(`
          *,
          profiles!notes_user_id_fkey(id, username, display_name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Failed to fetch feed notes:", err);
      return [];
    }
  },

  /**
   * Creates a new note
   */
  async createNote(
    userId: string,
    content: string,
    type: "text" | "voice" = "text",
    audioUrl?: string,
    durationSeconds?: number,
    waveformData?: number[]
  ): Promise<Note | null> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          user_id: userId,
          content,
          type,
          audio_url: audioUrl,
          duration_seconds: durationSeconds,
          waveform_data: waveformData,
        })
        .select(`*, profiles!notes_user_id_fkey(id, username, display_name, avatar_url)`)
        .single();

      if (error) throw error;
      
      // Track analytics
      AnalyticsAI.trackEvent(userId, "note_created", { type });

      return data;
    } catch (err) {
      console.error("Failed to create note:", err);
      return null;
    }
  },

  /**
   * Deletes a note
   */
  async deleteNote(noteId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .match({ id: noteId, user_id: userId });

      if (error) throw error;

      AnalyticsAI.trackEvent(userId, "note_deleted", { noteId });
      return true;
    } catch (err) {
      console.error("Failed to delete note:", err);
      return false;
    }
  },

  /**
   * Edits a note
   */
  async editNote(noteId: string, userId: string, content: string): Promise<Note | null> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .update({ content })
        .match({ id: noteId, user_id: userId })
        .select(`*, profiles!notes_user_id_fkey(id, username, display_name, avatar_url)`)
        .single();

      if (error) throw error;

      AnalyticsAI.trackEvent(userId, "note_edited", { noteId });
      return data;
    } catch (err) {
      console.error("Failed to edit note:", err);
      return null;
    }
  },

  /**
   * Subscribe to new notes in realtime
   */
  subscribeToNotes(callback: (payload: any) => void) {
    const channel = supabase
      .channel("public:notes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notes" },
        (payload) => callback(payload)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notes" },
        (payload) => callback(payload)
      )
      .subscribe();
      
    return channel;
  },

  unsubscribe(channel: any) {
    if (channel) supabase.removeChannel(channel);
  }
};
