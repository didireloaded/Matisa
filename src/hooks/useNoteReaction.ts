import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Analytics } from "@/lib/analytics";

type ReactionType = "heart" | "fire" | "laugh";

export function useNoteReaction(
  noteId: string,
  initialHeartCount = 0,
  initialFireCount = 0,
  initialLaughCount = 0,
) {
  const { profile } = useAuth();

  const [reacted, setReacted] = useState<ReactionType | null>(null);
  const [counts, setCounts] = useState({
    heart: initialHeartCount,
    fire: initialFireCount,
    laugh: initialLaughCount,
  });

  useEffect(() => {
    let mounted = true;
    async function fetchReaction() {
      if (!profile?.id || !noteId) return;
      const { data } = await supabase
        .from("note_reactions")
        .select("reaction_type")
        .eq("note_id", noteId)
        .eq("user_id", profile.id)
        .maybeSingle();

      if (mounted && data) {
        setReacted(data.reaction_type as ReactionType);
      }
    }
    fetchReaction();
    return () => {
      mounted = false;
    };
  }, [noteId, profile?.id]);

  const toggleReaction = async (type: ReactionType) => {
    if (!profile?.id) return;

    const prevReacted = reacted;
    const isRemoving = prevReacted === type;
    const isChanging = prevReacted && prevReacted !== type;

    setReacted(isRemoving ? null : type);
    setCounts((prev) => {
      const newCounts = { ...prev };
      if (prevReacted) {
        newCounts[prevReacted] = Math.max(0, newCounts[prevReacted] - 1);
      }
      if (!isRemoving) {
        newCounts[type] = newCounts[type] + 1;
      }
      return newCounts;
    });

    try {
      if (isRemoving) {
        await supabase
          .from("note_reactions")
          .delete()
          .match({ note_id: noteId, user_id: profile.id, reaction_type: type });
      } else {
        if (isChanging) {
          await supabase
            .from("note_reactions")
            .delete()
            .match({ note_id: noteId, user_id: profile.id, reaction_type: prevReacted });
        }
        await supabase.from("note_reactions").insert({
          note_id: noteId,
          user_id: profile.id,
          reaction_type: type,
        });
        Analytics.track("Note Reacted", { noteId, type });
      }
    } catch (err) {
      console.error("Failed to toggle reaction", err);
      setReacted(prevReacted);
    }
  };

  return { reacted, counts, toggleReaction };
}
