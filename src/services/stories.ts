import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";

export type StoryType = "image" | "video" | "text" | "voice";

export interface CreateStoryPayload {
  userId: string;
  mediaType: StoryType;
  file?: File; // The actual file (if image/video/voice)
  content?: string; // Text content if it's a text story, or caption
  backgroundGradient?: string; // For text/voice stories
  musicTrackId?: string; // Optional attached music
}

export const StoryService = {
  /**
   * Creates a new story, handling file uploads if necessary.
   */
  async createStory(payload: CreateStoryPayload) {
    let mediaUrl = "";

    // 1. Upload file if present
    if (payload.file && ["image", "video", "voice"].includes(payload.mediaType)) {
      const fileExt = payload.file.name.split(".").pop();
      const fileName = `${payload.userId}/${uuidv4()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("stories")
        .upload(fileName, payload.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("stories").getPublicUrl(fileName);

      mediaUrl = publicUrl;
    }

    // 2. Insert into DB
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

    const { data, error } = await supabase
      .from("stories")
      .insert({
        user_id: payload.userId,
        media_url: mediaUrl,
        media_type: payload.mediaType,
        text_content: payload.content || null,
        background_color: payload.backgroundGradient || null,
        expires_at: expiresAt,
        privacy: "public", // Could be 'close_friends' later
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetches active stories for the current user's feed
   * Combines following and algorithmically suggested stories.
   */
  async getFeedStories() {
    // For now, simply fetch active public stories, ordered by creation.
    // In a production app, this would use an RPC call or complex join to get
    // stories from people you follow, grouped by user.
    const { data, error } = await supabase
      .from("stories")
      .select("*, profiles!stories_user_id_fkey(username, display_name, avatar_url, full_name)")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};
