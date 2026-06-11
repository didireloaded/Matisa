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
    
<truncated 4073 bytes>