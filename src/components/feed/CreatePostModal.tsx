import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Mic, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

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
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground fo
<truncated 1271 bytes>