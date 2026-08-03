import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Video, PhoneCall, Plus, Mic, Send, Play } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { USERS } from "@/data/dummy";
import { toast } from "sonner";
import { VoiceNoteRecorderModal } from "@/components/voice/VoiceNoteRecorderModal";

export function Chat() {
  const { conversationId, id } = useParams<{ conversationId?: string; id?: string }>();
  const targetId = conversationId || id || "";
  const navigate = useNavigate();

  // Find target user dynamically from URL params or fallback to USERS[0]
  const matchedUser = USERS.find((u) => u.id === targetId || u.username === targetId) || USERS[0];

  const [inputText, setInputText] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: "m-1",
      sender: "them",
      avatar: matchedUser.avatar,
      text: `Hi 😁 I'm ${matchedUser.name}.`,
      type: "text",
    },
    {
      id: "m-2",
      sender: "them",
      avatar: matchedUser.avatar,
      text: "It seems we have a lot in common and share similar interests in voice content! 🎙️",
      type: "text",
    },
    {
      id: "m-3",
      sender: "them",
      avatar: matchedUser.avatar,
      audioUrl: "#",
      duration: "0:24",
      type: "voice",
    },
    {
      id: "m-4",
      sender: "me",
      text: "Awesome concepts! Let's collaborate.",
      type: "text",
    },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "me",
        text: inputText.trim(),
        type: "text",
      },
    ]);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#030712] text-white relative overflow-hidden">
      {/* 1. Reelio Chat Header */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-10 pb-4 glass-header border-b border-white/10">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition active:scale-95 shrink-0"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative shrink-0">
            <Avatar
              size={40}
              profile={{
                id: matchedUser.id,
                display_name: matchedUser.name,
                avatar_url: matchedUser.avatar,
              }}
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#35C67A] border-2 border-[#030712]" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-white leading-tight truncate">
              {matchedUser.name}
            </h1>
            <span className="text-[11px] text-[#35C67A] font-semibold block truncate">Online</span>
          </div>
        </div>

        {/* Top Right Action Triggers */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => toast.info(`Starting video call with ${matchedUser.name}...`)}
            className="flex h-9 w-9 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition active:scale-95"
            aria-label="Video Call"
          >
            <Video size={17} />
          </button>
          <button
            onClick={() => toast.info(`Calling ${matchedUser.name}...`)}
            className="flex h-9 w-9 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition active:scale-95"
            aria-label="Phone Call"
          >
            <PhoneCall size={17} />
          </button>
        </div>
      </div>

      {/* 2. Chat Messages Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 no-scrollbar">
        {messages.map((m) => {
          if (m.sender === "them") {
            return (
              <div key={m.id} className="flex items-start gap-3">
                <Avatar
                  size={36}
                  profile={{
                    id: "them",
                    display_name: matchedUser.name,
                    avatar_url: m.avatar || matchedUser.avatar,
                  }}
                />
                {m.type === "voice" ? (
                  /* Reelio Voice Note Bubble */
                  <div
                    onClick={() => {
                      setIsPlayingAudio(!isPlayingAudio);
                      toast.info(isPlayingAudio ? "Audio paused" : "Playing voice note...");
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-[22px] glass-panel-elevated border border-white/15 max-w-[260px] cursor-pointer hover:border-white/30 transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#39B7F2] text-white shadow-md">
                      <Play size={16} fill="white" className="ml-0.5" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <span
                            key={i}
                            className="w-0.5 rounded-full bg-[#39B7F2]"
                            style={{ height: `${(i % 5) * 4 + 6}px` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-white/60 font-semibold">{m.duration}</span>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-[22px] glass-panel text-xs text-white max-w-[260px] leading-relaxed">
                    {m.text}
                  </div>
                )}
              </div>
            );
          }

          /* Sent Message Bubble */
          return (
            <div key={m.id} className="flex justify-end">
              <div className="px-4 py-3 rounded-[22px] bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-xs font-semibold text-white max-w-[260px] shadow-lg">
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Reelio Bottom Input Capsule */}
      <div className="p-4 pb-safe glass-header">
        <div className="flex items-center gap-2 rounded-full glass-panel-elevated p-2 border border-white/20">
          <button
            onClick={() => toast.info("Attach image or media file")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/10"
          >
            <Plus size={16} />
            <span>New</span>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type Message.."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none"
          />

          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:text-white transition"
            aria-label="Voice Message"
          >
            <Mic size={18} />
          </button>

          <button
            onClick={handleSend}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#24A3C7] text-white shadow-md active:scale-90 transition"
            aria-label="Send"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </div>
      </div>

      {isVoiceModalOpen && (
        <VoiceNoteRecorderModal
          open={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onPublished={() => {
            setMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                sender: "me",
                text: "🎙️ Sent voice note",
                type: "text",
              },
            ]);
            setIsVoiceModalOpen(false);
          }}
          mode="voicemail"
        />
      )}
    </div>
  );
}

export default Chat;
