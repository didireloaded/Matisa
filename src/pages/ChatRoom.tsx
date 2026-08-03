// src/pages/ChatRoom.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mic, Image, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const mockMessages = [
  {
    id: '1',
    sender: 'them',
    text: 'Hey! I saw your profile and love your work.',
    time: '2:30 PM',
  },
  {
    id: '2',
    sender: 'me',
    text: 'Thanks! Appreciate that. What do you create?',
    time: '2:32 PM',
  },
  {
    id: '3',
    sender: 'them',
    text: 'Mostly photography and short films around Windhoek.',
    time: '2:33 PM',
  },
  {
    id: '4',
    sender: 'me',
    text: "That's awesome. We should collab on something!",
    time: '2:35 PM',
  },
  {
    id: '5',
    sender: 'them',
    text: "For sure! I'm hosting a meetup this weekend. You should come through.",
    time: '2:36 PM',
  },
];

export default function ChatRoom() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && typeof scrollRef.current.scrollTo === "function") {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate('/chat')}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
            alt="Hanna"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Hanna Dowie</p>
            <p className="text-green-400 text-xs">Online</p>
          </div>
          <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <Phone className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                msg.sender === 'me'
                  ? 'bg-gradient-to-br from-[#E94560] to-[#9D4EDD] rounded-br-sm'
                  : 'bg-white/[0.06] rounded-bl-sm'
              }`}
            >
              <p className="text-white text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-white/50' : 'text-white/30'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-black border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
            <Mic className="w-5 h-5 text-white/40" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
            <Image className="w-5 h-5 text-white/40" />
          </button>
          <div className="flex-1 bg-white/5 rounded-full px-4 py-2.5 border border-white/[0.06]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              className="w-full bg-transparent text-white text-sm placeholder-white/30 outline-none"
            />
          </div>
          <button className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00D9C0] to-[#00B4D8] flex items-center justify-center flex-shrink-0">
            <Send className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
