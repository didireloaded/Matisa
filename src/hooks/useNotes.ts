import { useState, useEffect, useCallback } from "react";
import { NoteService, Note } from "@/services/NoteService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useNotes() {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NoteService.getFeedNotes();
      setNotes(data);
    } catch (err: any) {
      setError(err);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();

    const channel = NoteService.subscribeToNotes((payload) => {
      if (payload.eventType === "INSERT") {
        // If a new note is created, and we want to show it immediately with its profile, 
        // we might need to refetch or manually fetch the profile.
        // For simplicity, we trigger a refetch or insert if we can get the profile data.
        // Doing a soft refetch is safest for DB relationships:
        fetchNotes();
      } else if (payload.eventType === "DELETE") {
        setNotes((prev) => prev.filter((n) => n.id !== payload.old.id));
      }
    });

    return () => {
      NoteService.unsubscribe(channel);
    };
  }, [fetchNotes]);

  const createNote = async (
    content: string,
    type: "text" | "voice" = "text",
    audioUrl?: string,
    durationSeconds?: number,
    waveformData?: number[]
  ) => {
    if (!profile) return null;
    const newNote = await NoteService.createNote(
      profile.id,
      content,
      type,
      audioUrl,
      durationSeconds,
      waveformData
    );
    // Realtime subscription should pick it up, but we can do an optimistic insert:
    if (newNote) {
      setNotes((prev) => [newNote, ...prev]);
    }
    return newNote;
  };

  const deleteNote = async (noteId: string) => {
    if (!profile) return false;
    const success = await NoteService.deleteNote(noteId, profile.id);
    if (success) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
    } else {
      toast.error("Failed to delete note");
    }
    return success;
  };

  const editNote = async (noteId: string, content: string) => {
    if (!profile) return null;
    const updatedNote = await NoteService.editNote(noteId, profile.id, content);
    if (updatedNote) {
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updatedNote : n)));
      toast.success("Note updated");
    } else {
      toast.error("Failed to update note");
    }
    return updatedNote;
  };

  return {
    notes,
    loading,
    error,
    createNote,
    deleteNote,
    editNote,
    refreshNotes: fetchNotes,
  };
}
