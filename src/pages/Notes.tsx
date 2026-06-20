import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit3, Image, Mic, AlignLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { useNotes } from "@/hooks/useNotes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function FeedCard({ note }: { note: any }) {
  // Simple version of FeedCard for Notes page, ideally this would be imported
  return (
    <Card variant="glass" className="mb-4 p-4 border border-[var(--color-border)]">
      <div className="flex items-start gap-3">
        <Avatar size={40} profile={note.profiles} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">{note.profiles?.display_name}</span>
            <span className="text-[var(--color-text-muted)] text-xs">
              {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
  const { notes, loading, createNote } = useNotes();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() || !profile) return;
    setSubmitting(true);
    const newNote = await createNote(content.trim(), "text");
    if (newNote) {
      toast.success("Note posted");
      setContent("");
    }
    setSubmitting(false);
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
            <Avatar
              size={40}
              profile={profile}
            />
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
              <button className="p-2 rounded-full hover:bg-[var(--color-surface-3)] transition">
                <Image size={18} />
              </button>
              <button className="p-2 rounded-full hover:bg-[var(--color-surface-3)] transition">
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
          <div className="flex justify-center py-10">
             <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
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
          <div className="mt-6">
            {notes.map(note => (
              <FeedCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fixed bottom-[88px] right-5 w-14 h-14 bg-gradient-to-br from-[#FF416C] to-[#8E2DE2] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform z-40">
        <Plus size={24} />
      </button>
    </div>
  );
}

export default Notes;
