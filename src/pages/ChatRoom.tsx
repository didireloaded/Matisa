// src/pages/ChatRoom.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mic, Image as ImageIcon, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { VoiceNoteRecorderModal } from "@/components/voice/VoiceNoteRecorderModal";
import { SkeletonList } from "@/components/common/SkeletonLoader";

const DEMO_CHAT_MESSAGES: Record<string, any[]> = {
  "conv-demo-1": [
    {
      id: "m1",
      sender_id: "them",
      content: "Hey! I saw your profile and love your work.",
      created_at: "2:30 PM",
    },
    {
      id: "m2",
      sender_id: "me",
      content: "Thanks! Appreciate that. What do you create?",
      created_at: "2:32 PM",
    },
    {
      id: "m3",
      sender_id: "them",
      content: "Mostly photography and short films around Windhoek.",
      created_at: "2:33 PM",
    },
    {
      id: "m4",
      sender_id: "me",
      content: "That's awesome. We should collab on something!",
      created_at: "2:35 PM",
    },
    {
      id: "m5",
      sender_id: "them",
      content: "For sure! I'm hosting a meetup this weekend. You should come through.",
      created_at: "2:36 PM",
    },
  ],
};

export default function ChatRoom() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { profile, session } = useAuth();
  const activeUserId = session?.user?.id || profile?.id || "demo-user-123";

  const { messages, isLoading, sendMessage } = useMessages(conversationId);
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync demo messages if using demo conversation ID
  useEffect(() => {
    if (conversationId && DEMO_CHAT_MESSAGES[conversationId]) {
      setLocalMessages(DEMO_CHAT_MESSAGES[conversationId]);
    } else {
      setLocalMessages([]);
    }
  }, [conversationId]);

  const activeMessages = messages.length > 0 ? messages : localMessages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    const text = input.trim();
    setInput("");

    try {
      if (conversationId.startsWith("conv-demo-")) {
        const demoMsg = {
          id: `demo-${Date.now()}`,
          sender_id: activeUserId,
          content: text,
          created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setLocalMessages((prev) => [...prev, demoMsg]);
        toast.success("Message sent");
      } else {
        await sendMessage(text);
        toast.success("Message sent");
      }
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;
    toast.success(`Image attached: ${file.name}`);

    const demoMsg = {
      id: `img-${Date.now()}`,
      sender_id: activeUserId,
      content: `📷 ${file.name}`,
      created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setLocalMessages((prev) => [...prev, demoMsg]);
  };

  return (
    <div className="min-h-screen bg-[#06101D] text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#06101D]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate("/inbox")}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition active:scale-95 text-white"
            aria-label="Back to inbox"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
            alt="Participant"
            className="w-9 h-9 rounded-full object-cover border border-white/15 shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">Hanna Dowie</p>
            <p className="text-emerald-400 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </p>
          </div>
          <button
            onClick={() => toast.info("Voice call connecting...")}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition active:scale-95 text-white"
            aria-label="Start voice call"
          >
            <Phone className="w-4 h-4 text-white/80" />
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />

      {/* Messages Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {isLoading && activeMessages.length === 0 ? (
          <SkeletonList />
        ) : (
          activeMessages.map((msg) => {
            const isMe = msg.sender_id === activeUserId || msg.sender_id === "me";
            const timeText = msg.created_at
              ? msg.created_at.includes("T")
                ? new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : msg.created_at
              : "Now";

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-white rounded-br-xs shadow-md"
                      : "bg-white/10 text-white/90 rounded-bl-xs border border-white/10"
                  }`}
                >
                  {msg.media_type === "voice" || msg.media_url?.includes("voice") ? (
                    <div className="flex items-center gap-2 py-0.5">
                      <Mic className="w-4 h-4 text-[#24A3C7]" />
                      <span className="font-semibold text-xs">Voice Message</span>
                      {msg.media_url && (
                        <audio src={msg.media_url} controls className="h-7 w-44 mt-1 block" />
                      )}
                    </div>
                  ) : msg.media_type === "image" || msg.media_url?.includes("image") ? (
                    <div className="space-y-1">
                      {msg.media_url && (
                        <img
                          src={msg.media_url}
                          alt="Attached"
                          className="max-w-full rounded-xl max-h-48 object-cover"
                        />
                      )}
                      <p>{msg.content}</p>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}

                  <p
                    className={`text-[10px] mt-1 text-right font-mono ${
                      isMe ? "text-white/70" : "text-white/40"
                    }`}
                  >
                    {timeText}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Composer Bar */}
      <div className="px-4 py-3 bg-[#06101D] border-t border-white/10 sticky bottom-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 hover:bg-white/20 transition active:scale-95 text-white/80"
            aria-label="Voice message"
          >
            <Mic className="w-5 h-5 text-[#24A3C7]" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 hover:bg-white/20 transition active:scale-95 text-white/80"
            aria-label="Attach photo"
          >
            <ImageIcon className="w-5 h-5 text-white/60" />
          </button>

          <div className="flex-1 bg-white/10 rounded-full px-4 py-2 border border-white/15 focus-within:border-[#24A3C7]">
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
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#24A3C7] to-[#6139F2] hover:opacity-90 flex items-center justify-center flex-shrink-0 transition active:scale-95 text-white shadow-lg disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Message Recorder Modal */}
      {isVoiceModalOpen && (
        <VoiceNoteRecorderModal
          open={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          conversationId={conversationId}
          mode="message"
          onPublished={(url) => {
            if (url) {
              sendMessage("🎤 Voice message", url, "voice");
              toast.success("Voice message sent!");
            }
            setIsVoiceModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
