import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, Plus, Mic, Send, Image, Play, Smile } from "lucide-react";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { T } from "@/components/common";

import { MessageService } from '../services/messages';

export function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile || !id) return;
    
    async function loadConv() {
      const other = await MessageService.getOtherUser(id!, profile!.id);
      if (other) setOtherUser(other);
    }

    async function loadMessages() {
      const data = await MessageService.getMessages(id!);
      setMessages(data);
    }

    loadConv();
    loadMessages();

    // Subscribe to new messages
    const channel = MessageService.subscribeToMessages(id, (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });

    return () => {
      MessageService.unsubscribe(channel);
    };
  }, [id, profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !profile || !id) return;

    const content = inputText.trim();
    setInputText("");

    try {
      await MessageService.sendTextMessage(id, profile.id, content);
    } catch (err) {
      // Handle error visually if necessary
    }
  };

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
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-black/20" style={{ color: T.text }}>
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2E2822] flex items-center justify-center overflow-hidden">
              {otherUser?.avatar_url ? (
                <img 
                  src={otherUser.avatar_url} 
                  alt={otherUser.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#8A7F74] font-bold text-lg">{otherUser?.display_name?.charAt(0) || '?'}</span>
              )}
            </div>
            <div>
              <h2 className="font-bold text-[16px] leading-tight" style={{ color: T.text }}>
                {otherUser?.display_name || 'Loading...'}
              </h2>
              <p className="text-[12px]" style={{ color: T.success }}>
                online
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4" style={{ color: T.primary }}>
          <motion.button whileTap={{ scale: 0.8 }} onClick={() => toast.info('Video calling coming soon (Phase 5)')}><Video size={24} /></motion.button>
          <motion.button whileTap={{ scale: 0.8 }} onClick={() => toast.info('Audio calling coming soon (Phase 5)')}><Phone size={24} /></motion.button>
          <motion.button whileTap={{ scale: 0.8 }} style={{ color: T.text }}><MoreVertical size={24} /></motion.button>
        </div>
      </div>

      {/* MESSAGE LIST */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {messages.map(msg => {
          const isMe = msg.sender_id === profile?.id;
          
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
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            className="flex-1 bg-transparent border-none outline-none text-[15px]"
            style={{ color: T.text }}
          />
          <button style={{ color: T.muted }}>
            <Smile size={20} />
          </button>
        </div>

        {inputText.trim().length > 0 ? (
          <button 
            onClick={handleSend}
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
