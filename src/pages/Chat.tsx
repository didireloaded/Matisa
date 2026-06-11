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
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-bold text-sm">Conversation</h2>
              <span className="text-xs text-primary">Live Sync</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-muted transition-colors text-primary">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-muted transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        <p className="text-center text-xs text-muted-foreground my-4">This is the start of your conversation.</p>
        
        {messages.map((msg) => {
          const isMe = msg.sender_id === session?.user?.id;
          
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-auto mb-1">
                  <img src={msg.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-foreground rounded-bl-sm'}`}>
                  {msg.media_type === 'voice' && msg.media_url ? (
                    <div className="w-[200px]">
                      <AudioPlayer url={msg.media_url} />
                    </div>
                  ) : (
                    <p className="text-sm break-words">{msg.content}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border">
        <div className="flex items-end gap-2 bg-card border border-border rounded-3xl p-1 pl-4 relative">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Message..." 
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
                disabled={isSending}
                className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
              </button>
            ) : (
              <div className="p-1">
                <AudioRecorder onUploadSuccess={handleVoiceUpload} bucket="voice_notes" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
