import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useComments } from "../../hooks/useComments";
import { useAuth } from "../../contexts/AuthContext";
import { Send, Loader2, Mic } from "lucide-react";
import { AudioPlayer } from "../ui/AudioPlayer";
import { VoiceNoteRecorderModal } from "@/components/voice/VoiceNoteRecorderModal";

interface CommentsModalProps {
  postId: string;
  children: React.ReactNode;
  onCommentCountChange?: (delta: number) => void;
  onClose?: () => void;
}

export function CommentsModal({
  postId,
  children,
  onCommentCountChange,
  onClose,
}: CommentsModalProps) {
  const [open, setOpen] = useState(true);
  const [voiceReplyOpen, setVoiceReplyOpen] = useState(false);
  const { comments, isLoading, addComment } = useComments(postId);
  const { profile: session } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track previous length to notify parent of changes
  const [prevCount, setPrevCount] = useState(comments.length);

  useEffect(() => {
    if (comments.length > prevCount) {
      if (onCommentCountChange) {
        onCommentCountChange(comments.length - prevCount);
      }
      setPrevCount(comments.length);
      // Auto-scroll to bottom on new comment
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments.length, prevCount, onCommentCountChange]);

  const handleSend = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addComment(content.trim());
      setContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceUpload = async (url: string) => {
    try {
      await addComment(null, url, "voice");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val && onClose) onClose();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* Drawer-style modal on mobile, standard dialog on desktop */}
      <DialogContent className="z-[120] w-full max-w-none sm:max-w-[425px] bg-[#06101D] border-t border-white/20 h-[80vh] sm:h-[600px] flex flex-col p-0 fixed top-auto bottom-0 left-0 right-0 sm:left-[50%] sm:top-[50%] translate-x-0 sm:translate-x-[-50%] translate-y-0 sm:translate-y-[-50%] rounded-t-[32px] sm:rounded-2xl shadow-2xl">
        <DialogHeader className="p-4 border-b border-border sticky top-0 bg-background/90 backdrop-blur-md z-10">
          <DialogTitle className="text-foreground font-display text-center">Comments</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <p>No comments yet.</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                  <img
                    src={
                      c.profiles?.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author_id}`
                    }
                    alt={c.profiles?.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">
                      {c.profiles?.full_name || c.profiles?.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {c.media_type === "voice" && c.media_url ? (
                    <div className="w-[200px]">
                      <AudioPlayer url={c.media_url} />
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/90 break-words">{c.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-border bg-card">
          <div className="flex items-end gap-2 bg-background border border-border rounded-3xl p-1 pl-4 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent py-3 text-sm focus:outline-none resize-none max-h-32 min-h-[44px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex items-center gap-1 pb-1">
              <button
                onClick={() => setVoiceReplyOpen(true)}
                title="Send Private Voice Reply to Author"
                className="p-2 text-white/60 hover:text-white transition"
              >
                <Mic className="w-5 h-5 text-[#24A3C7]" />
              </button>
              <button
                onClick={handleSend}
                disabled={!content.trim() || isSubmitting}
                className="p-2 bg-[#24A3C7] text-white rounded-full hover:opacity-90 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {voiceReplyOpen && (
          <VoiceNoteRecorderModal
            open={voiceReplyOpen}
            onClose={() => setVoiceReplyOpen(false)}
            mode="reply"
            targetId={postId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
