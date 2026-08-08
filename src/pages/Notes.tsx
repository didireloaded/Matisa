import { useState, useRef } from "react";
import { Plus, Image, Mic, AlignLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/Button";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { SkeletonList } from "@/components/common/SkeletonLoader";
import { useNotes } from "@/hooks/useNotes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { VoiceNoteRecorderModal } from "@/components/voice/VoiceNoteRecorderModal";
import { CreateSheet } from "@/components/create/CreateSheet";
import { NoteCard } from "@/components/feed/NoteCard";

function FeedCard({ note }: { note: any }) {
  return (
    <Card variant="glass" className="mb-4 p-4 border border-[var(--color-border)]">
      <div className="flex items-start gap-3">
        <Avatar size={40} profile={note.profiles} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">
              {note.profiles?.display_name || note.profiles?.username || "Creator"}
            </span>
            <span className="text-[var(--color-text-muted)] text-xs">
              {new Date(note.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="text-white text-sm mt-1">{note.content}</p>
        </div>
      </div>
    </Card>
  );
}

export function Notes() {
  const { profile } = useAuth();
  const { notes, loading, createNote, refreshNotes } = useNotes();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePost = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    const newNote = await createNote(content.trim(), "text");
    if (newNote) {
      toast.success("Note posted!");
      setContent("");
      refreshNotes();
    }
    setSubmitting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      toast.success(`Image attached: ${e.target.files[0].name}`);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-background)] pb-28">
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-white text-3xl font-display font-bold tracking-tight">Notes</h1>
      </div>

      <div className="flex-1 px-5 space-y-6 pt-4">
        {/* Composer */}
        <Card variant="solid" className="p-4">
          <div className="flex gap-3 mb-3">
            <Avatar size={40} profile={profile || undefined} />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 bg-transparent border-none text-white text-sm resize-none focus:outline-none placeholder:text-[var(--color-text-muted)]"
              rows={2}
            />
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
            <div className="flex gap-2 text-[var(--color-text-muted)]">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-[var(--color-surface-3)] text-white/70 hover:text-white transition"
                aria-label="Add image"
              >
                <Image size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="p-2 rounded-full hover:bg-[var(--color-surface-3)] text-white/70 hover:text-white transition"
                aria-label="Record voice note"
              >
                <Mic size={18} />
              </button>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="font-bold px-5"
              onClick={handlePost}
              disabled={submitting || !content.trim()}
            >
              Post
            </Button>
          </div>
        </Card>

        {loading ? (
          <SkeletonList />
        ) : notes.length === 0 ? (
          <div className="mt-8">
            <PremiumEmptyState
              icon={AlignLeft}
              title="It's quiet here"
              description="Be the first to share a note."
              glowColor="primary"
            />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onRefresh={refreshNotes} />
            ))}
          </div>
        )}
      </div>

      {isVoiceModalOpen && (
        <VoiceNoteRecorderModal
          open={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onPublished={() => {
            refreshNotes();
            setIsVoiceModalOpen(false);
          }}
          mode="note"
        />
      )}

      {isCreateSheetOpen && (
        <CreateSheet open={isCreateSheetOpen} onClose={() => setIsCreateSheetOpen(false)} />
      )}
    </div>
  );
}

export default Notes;
