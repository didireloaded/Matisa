import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, Info, Send, Loader2, Mic } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useMessages } from '../hooks/useMessages';
import { AudioPlayer } from '../components/ui/AudioPlayer';
import { AudioRecorder } from '../components/ui/AudioRecorder';

export function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { messages, isLoading, sendMessage } = useMessages(id);
  
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(content.trim());
      setContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleVoiceUpload = async (url: string) => {
    try {
      await sendMessage(null, url, 'voice');
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5
<truncated 3927 bytes>