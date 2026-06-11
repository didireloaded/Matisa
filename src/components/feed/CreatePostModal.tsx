import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Mic, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { VoiceRecorderModal } from './VoiceRecorderModal';

interface CreatePostModalProps {
  children: React.ReactNode;
  onPostCreated?: () => void;
}

export function CreatePostModal({ children, onPostCreated }: CreatePostModalProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('posts').insert([
        {
          author_id: user.id,
          content: content.trim(),
        }
      ]);

      if (error) throw error;
      
      toast.success("Post created successfully!");
      setContent('');
      setOpen(false);
      if (onPostCreated) onPostCreated();
    } catch (error: any) {
      toast.error(error.message || "Failed to create post.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground font-display">Create Post</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:ring-2 focus:ring-primary outline-none min-h-[120px] resize-none"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="p-2 text-muted-foreground hover:text-primary transition-colors bg-background rounded-full border border-border">
                <ImageIcon className="w-5 h-5" />
              </button>
              <VoiceRecorderModal onPostCreated={() => { setOpen(false); if (onPostCreated) onPostCreated(); }}>
                <button className="p-2 text-muted-foreground hover:text-primary transition-colors bg-background rounded-full border border-border">
                  <Mic className="w-5 h-5" />
                </button>
              </VoiceRecorderModal>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
