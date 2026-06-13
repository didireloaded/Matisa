import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Phone, Video, Info, Mic } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useChat } from '../../hooks/useMessages';
import { useAuthStore } from "@/stores/authStore";
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
              <AvatarFallback>{otherUser?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-foreground text-sm">{otherUser?.full_name || otherUser?.username}</h2>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <button className="p-2 rounded-full hover:bg-secondary transition-colors"><Phone className="w-5 h-5" /></button>
          <button className="p-2 rounded-full hover:bg-secondary transition-colors"><Video className="w-5 h-5" /></button>
          <button className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground"><Info className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">Loading chat...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Avatar className="w-20 h-20 mb-4 opacity-50">
              <AvatarImage src={otherUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.id}`} />
              <AvatarFallback>{otherUser?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <p>Say hi to {otherUser?.full_name?.split(' ')[0] || otherUser?.username}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === session?.user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[75%] flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`px-4 py-2.5 rounded-2xl ${
                      isMine 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-card border border-border text-foreground rounded-tl-sm'
                    }`}
                  >
                    {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                    {msg.voice_url && (
                      <div className="mt-1">
                        <AudioPlayer url={msg.voice_url} />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-background border-t border-border pb-safe">
        {showRecorder ? (
          <div className="flex items-center gap-2 px-2 bg-secondary/30 rounded-2xl border border-border py-1">
            <button 
              onClick={() => setShowRecorder(false)} 
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full"
            >
              Cancel
            </button>
            <div className="flex-1 flex justify-center">
              <AudioRecorder onUploadSuccess={handleVoiceUpload} bucket="voice_notes" />
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-2 bg-secondary/30 rounded-3xl border border-border px-4 py-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
            <button 
              onClick={() => setShowRecorder(true)}
              className="p-2 -ml-2 text-primary hover:bg-primary/10 rounded-full transition-colors shrink-0"
            >
              <Mic className="w-5 h-5" />
            </button>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message..."
              className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none focus:ring-0 resize-none py-2 text-sm text-foreground placeholder:text-muted-foreground"
              rows={1}
            />
            {inputText.trim() && (
              <button 
                onClick={handleSend}
                className="p-2 -mr-2 text-primary hover:bg-primary/10 rounded-full transition-colors shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
