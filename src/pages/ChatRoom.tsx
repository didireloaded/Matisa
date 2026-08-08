// src/pages/ChatRoom.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mic, Image, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const mockMessages = [
  {
    id: "1",
    sender: "them",
    text: "Hey! I saw your profile and love your work.",
    time: "2:30 PM",
  },
  {
    id: "2",
    sender: "me",
    text: "Thanks! Appreciate that. What do you create?",
    time: "2:32 PM",
  },
  {
    id: "3",
    sender: "them",
    text: "Mostly photography and short films around Windhoek.",
    time: "2:33 PM",
  },
  {
    id: "4",
    sender: "me",
    text: "That's awesome. We should collab on something!",
    time: "2:35 PM",
  },
  {
    id: "5",
    sender: "them",
    text: "For sure! I'm hosting a meetup this weekend. You should come through.",
    time: "2:36 PM",
  },
];

export default function ChatRoom() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && typeof scrollRef.current.scrollTo === "function") {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const newMessage = {
      id: String(Date.now()),
      sender: "me",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate("/inbox")}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition active:scale-95"
            aria-label="Back to inbox"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
            alt="Hanna"
            className="w-9 h-9 rounded-full object-cover border border-white/10"
          />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Hanna Dowie</p>
            <p className="text-emerald-400 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </p>
          </div>
          <button
            onClick={() => toast.info("Voice call starting...")}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition active:scale-95"
            aria-label="Start voice call"
          >
            <Phone className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                msg.sender === "me"
                  ? "bg-gradient-to-br from-[#24A3C7] to-[#6139F2] text-white rounded-br-sm shadow-md"
                  : "bg-white/[0.08] text-white rounded-bl-sm border border-white/5"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p
                className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-white/70" : "text-white/40"}`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Composer Bar */}
      <div className="px-4 py-3 bg-black border-t border-white/[0.06] sticky bottom-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Hold to record voice message")}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition active:scale-95"
            aria-label="Voice message"
          >
            <Mic className="w-5 h-5 text-white/60" />
          </button>
          <button
            onClick={() => toast.info("Select photo to attach")}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition active:scale-95"
            aria-label="Attach photo"
          >
            <Image className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex-1 bg-white/5 rounded-full px-4 py-2.5 border border-white/[0.1]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full bg-transparent text-white text-sm placeholder-white/40 outline-none"
            />
          </div>
          <button
            onClick={handleSendMessage}
            className="w-10 h-10 rounded-full bg-[#24A3C7] hover:bg-[#1faec0] flex items-center justify-center flex-shrink-0 transition active:scale-95 text-white shadow-lg"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
