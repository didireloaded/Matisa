import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useComments } from '../../hooks/useComments';
import { useAuthStore } from '../../store/authStore';
import { Send, Loader2 } from 'lucide-react';
import { AudioPlayer } from '../ui/AudioPlayer';
import { AudioRecorder } from '../ui/AudioRecorder';

interface CommentsModalProps {
  postId: string;
  children: React.ReactNode;
  onCommentCountChange?: (delta: number) => void;
}

export function CommentsModal({ postId, children, onCommentCountChange }: CommentsModalProps) {
  const [open, setOpen] = useState(false);
  const { comments, isLoading, addComment } = useComments(postId);
  const { session } = useAuthStore();
  const [content, setContent] = useState('');
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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length, prevCount, onCommentCountChange]);

  const handleSend = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addComment(content.trim());
      setContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceUpload = async (url: string) => {
    try {
      await addComment(null, url, 'voice');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      {/* Drawer-style modal on mobile, standard dialog on desktop */}
      <DialogContent className="sm:max-w-[425px] bg-background border-border h-[80vh] sm:h-[600px] flex flex-col p-0 absolute bottom-0 sm:relative translate-y-0 sm:translate-y-[-50%] rounded-t-2xl sm:rounded-2xl">
        <DialogHeader className="p-4 border-b border-border sticky top-0 bg-background/90 backdrop-blur-md z-10">
          <DialogTitle className="text-foreground font-display text-center">Comments</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
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
                    src={c.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author_id}`} 
                    alt={c.profiles?.username} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">{c.profiles?.full_name || c.profiles?.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {c.media_type === 'voice' && c.media_url ? (
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
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex items-center gap-1 pb-1">
              {content.trim() ? (
                <button 
                  onClick={handleSend}
                  disabled={isSubmitting}
                  className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                </button>
              ) : (
                <div className="p-1">
                  <AudioRecorder onUploadSuccess={handleVoiceUpload} bucket="voice_notes" />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
