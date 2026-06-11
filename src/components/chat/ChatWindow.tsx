import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Phone, Video, Info, Mic } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useChat } from '../../hooks/useMessages';
import { useAuthStore } from '../../store/authStore';
import { AudioPlayer } from '../ui/AudioPlayer';
import { AudioRecorder } from '../ui/AudioRecorder';

interface ChatWindowProps {
  conversationId: string;
  otherUser: any;
  onBack: () => void;
}

export function ChatWindow({ conversationId, otherUser, onBack }: ChatWindowProps) {
  const { session } = useAuthStore();
  const { messages, isLoading, sendMessage } = useChat(conversationId);
  const [inputText, setInputText] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage(inputText);
    setInputText('');
  };

  const handleVoiceUpload = async (url: string) => {
    await sendMessage('', url);
    setShowRecorder(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background z-50 fixed inset-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 cursor-pointer">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src={otherUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.id}`} />
              <Avata
<truncated 5157 bytes>