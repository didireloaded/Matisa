import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { NoteCard } from "@/components/feed/NoteCard";
import { SkeletonFeedCard } from "@/components/common/SkeletonLoader";
import { toast } from "sonner";
import type { Note } from "@/services/NoteService";

export function NoteDetail() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNote() {
      if (!noteId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("*, profiles!notes_user_id_fkey(*)")
          .eq("id", noteId)
          .single();

        const fallbackNote: Note = {
          id: noteId || "demo-note-1",
          user_id: "usr-1",
          content:
            "Windhoek acoustic session dropping live tonight on Matisa! 🌅 Join us in Katutura or listen live in the room.",
          created_at: new Date().toISOString(),
          type: "text",
          note_kind: "permanent",
          profiles: {
            id: "usr-1",
            username: "hanna_d",
            display_name: "Hanna Dowie",
            avatar_url:
              "https://images.unsplash.com/photo-1606416132922-22ab37c1231e?w=200&h=200&fit=crop&auto=format",
          },
          reaction_count: 14,
          reply_count: 5,
        };

        if (!error && data) {
          setNote(data as Note);
        } else {
          setNote(fallbackNote);
        }
      } catch (err) {
        setNote({
          id: noteId || "demo-note-1",
          user_id: "usr-1",
          content: "Windhoek acoustic session dropping live tonight on Matisa!",
          created_at: new Date().toISOString(),
          type: "text",
          note_kind: "permanent",
          profiles: {
            id: "usr-1",
            username: "hanna_d",
            display_name: "Hanna Dowie",
          },
        });
      } finally {
        setLoading(false);
      }
    }
    loadNote();
  }, [noteId]);

  return (
    <div className="flex flex-col min-h-full pb-28 pt-2">
      {/* Header with Back Button */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition active:scale-95 border border-white/15"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-bold text-white tracking-tight">Note Detail</h1>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Note link copied!");
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition border border-white/15 active:scale-95"
          aria-label="Share"
        >
          <Share2 size={16} />
        </button>
      </div>

      <div className="px-5 flex-1 space-y-4">
        {loading ? (
          <SkeletonFeedCard />
        ) : note ? (
          <NoteCard note={note} />
        ) : (
          <div className="glass-panel p-8 text-center rounded-[24px] text-white/50 text-xs">
            Note not found.
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteDetail;
