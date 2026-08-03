import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface Comment {
  id: string;
  note_id: string;
  post_id?: string;
  author_id: string;
  content: string | null;
  media_url: string | null;
  media_type: "voice" | null;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export function useComments(noteId: string) {
  const { session } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!noteId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          note_id,
          author_id,
          content,
          media_url,
          media_type,
          created_at,
          profiles:author_id (
            username,
            full_name,
            avatar_url
          )
        `,
        )
        .or(`note_id.eq.${noteId},post_id.eq.${noteId}`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data) setComments(data as any as Comment[]);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchComments();

    if (!noteId) return;

    // Realtime subscription
    const channel = supabase
      .channel(`comments:${noteId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
        },
        async (payload) => {
          if (payload.new.note_id === noteId || payload.new.post_id === noteId) {
            const { data: newComment } = await supabase
              .from("comments")
              .select(
                `
                id,
                note_id,
                author_id,
                content,
                media_url,
                media_type,
                created_at,
                profiles:author_id (
                  username,
                  full_name,
                  avatar_url
                )
              `,
              )
              .eq("id", payload.new.id)
              .single();

            if (newComment) {
              setComments((prev) => [...prev, newComment as any as Comment]);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [noteId, fetchComments]);

  const addComment = async (content: string | null, mediaUrl?: string, mediaType?: "voice") => {
    if (!session?.user) throw new Error("Must be logged in to comment");

    try {
      const { error } = await supabase.from("comments").insert({
        note_id: noteId,
        author_id: session.user.id,
        content,
        media_url: mediaUrl,
        media_type: mediaType,
      });

      if (error) throw error;

      // Fetch the note author to send them a notification
      const { data: noteData } = await supabase
        .from("notes")
        .select("author_id")
        .eq("id", noteId)
        .maybeSingle();

      if (noteData && noteData.author_id !== session.user.id) {
        // Insert notification with type 'reply' (valid enum value)
        try {
          await supabase.from("notifications").insert({
            user_id: noteData.author_id,
            actor_id: session.user.id,
            type: "reply",
            content: content ? content : "🎤 Voice note reply",
          });
        } catch (err) {
          console.error("Notification insert error:", err);
        }

        supabase.functions
          .invoke("send-notification", {
            body: {
              userId: noteData.author_id,
              title: `New reply on your Note`,
              body: `${session.user.user_metadata?.full_name || "Someone"} replied: ${content ? content : "🎤 Voice note"}`,
              data: { url: `/` },
            },
          })
          .catch(console.error);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      throw err;
    }
  };

  return {
    comments,
    isLoading,
    addComment,
    refreshComments: fetchComments,
  };
}
