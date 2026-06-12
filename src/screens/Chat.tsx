import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, Plus, Mic, Send, Image, Play, Smile } from "lucide-react";
import { CONVERSATIONS, MESSAGES, getProfile, ME_ID } from "../data/mock";

const T = { bg: "#0F0D0B", surface: "#1C1814", s2: "#221D18", border: "#2E2822", text: "#F5F0EA", muted: "#8A7F74", primary: "#C8521A", sand: "#E8A055", sky: "#2D7DD2", success: "#4CAF7D" };

export function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = CONVERSATIONS.find(c => c.id === id);
  // Default to a profile if conversation not found to prevent crashing
  const otherParticipantId = conversation?.participants.find(p => p !== ME_ID) || "u2";
  const otherUser = getProfile(otherParticipantId);
  const messages = MESSAGES.filter(m => m.conversation_id === id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const Waveform = () => (
    <div className="flex items-center gap-1 h-6">
      {[4, 8, 12, 16, 12, 8, 14, 10, 6, 12, 18, 14, 8, 4].map((height, i) => (
        <div
          key={i}
          className="w-1 bg-current rounded-full"
          style={{ height: `${height}px`, opacity: 0.7 }}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: T.bg }}>
      {/* HEADER */}
      <div 
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: T.surface, borderColor: T.border }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full" style={{ color: T.text }}>
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <img 
              src={otherUser?.avatar_url} 
              alt={otherUser?.display_name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-bold text-[16px] leading-tight" style={{ color: T.text }}>
                {otherUser?.display_name}
              </h2>
              <p className="text-[12px]" style={{ color: T.success }}>
                online
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4" style={{ color: T.primary }}>
          <button><Video size={24} /></button>
          <button><Phone size={24} /></button>
          <button style={{ color: T.text }}><MoreVertical size={24} /></button>
        </div>
      </div>

      {/* MESSAGE LIST */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {messages.map(msg => {
          const isMe = msg.sender_id === ME_ID;
          
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : ''}`}
            >
              <div 
                className={`px-4 py-3 rounded-2xl ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                style={{ 
                  backgroundColor: isMe ? T.primary : T.s2,
                  color: isMe ? "#FFFFFF" : T.text
                }}
              >
                {msg.kind === "text" && (
                  <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                )}
                
                {msg.kind === "audio" && (
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                      <Play size={20} fill="currentColor" />
                    </button>
                    <div className="flex-1">
                      <Waveform />
                    </div>
                    <span className="text-[12px] opacity-80">0:14</span>
                  </div>
                )}
              </div>
              <span 
                className="text-[11px] mt-1 px-1" 
                style={{ color: T.muted }}
              >
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* INPUT BAR */}
      <div 
        className="sticky bottom-0 px-3 py-3 border-t flex items-center gap-3"
        style={{ backgroundColor: T.surface, borderColor: T.border }}
      >
        <button 
          className="p-2 rounded-full flex-shrink-0" 
          style={{ color: T.text }}
        >
          <Plus size={24} />
        </button>

        <div 
          className="flex-1 flex items-center px-4 py-2 rounded-full gap-2"
          style={{ backgroundColor: T.border }}
        >
          <input 
            type="text" 
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[15px]"
            style={{ color: T.text }}
          />
          <button style={{ color: T.muted }}>
            <Smile size={20} />
          </button>
        </div>

        {inputText.trim().length > 0 ? (
          <button 
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: T.primary, color: "#FFFFFF" }}
          >
            <Send size={20} className="ml-1" />
          </button>
        ) : (
          <button 
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: T.primary, color: "#FFFFFF" }}
          >
            <Mic size={22} />
          </button>
        )}
      </div>
    </div>
  );
}
