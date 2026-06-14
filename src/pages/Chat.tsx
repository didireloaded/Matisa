import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Plus,
  Mic,
  Send,
  Image,
  Play,
  Smile,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { MessageService } from "../services/messages";

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
      setMessages((prev) => [...prev, newMsg]);
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
    <div className="flex items-center gap-[3px] h-6">
      {[4, 8, 12, 16, 12, 8, 14, 10, 6, 12, 18, 14, 8, 4].map((height, i) => (
        <div
          key={i}
          className="w-1 bg-current rounded-full"
          style={{ height: `${height}px`, opacity: 0.8 }}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-[#1A181C] text-white relative">
      {/* Decorative gradient for header area */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-0" />

      {/* HEADER */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 pt-14 pb-4 bg-[#1A181C]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-sm">
              {otherUser?.avatar_url ? (
                <img
                  src={otherUser.avatar_url}
                  alt={otherUser.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.id}`}
                  alt={otherUser?.display_name}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Online Indicator */}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00FF87] border-2 border-[#1A181C] rounded-full shadow-[0_0_8px_rgba(0,255,135,0.6)]" />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="font-bold text-[17px] leading-tight text-white tracking-tight">
                {otherUser?.display_name || "Loading..."}
              </h2>
              <p className="text-[13px] font-semibold text-[#00FF87]">Active now</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toast.info("Video calling coming soon")}
            className="w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Video size={22} className="text-[#8E2DE2]" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toast.info("Audio calling coming soon")}
            className="w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Phone size={22} className="text-[#FF416C]" />
          </motion.button>
        </div>
      </div>

      {/* MESSAGE LIST */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 z-10 no-scrollbar">
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === profile?.id;
          const showAvatar =
            !isMe &&
            (index === messages.length - 1 || messages[index + 1]?.sender_id === profile?.id);

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} w-full group`}
            >
              {!isMe && (
                <div className="w-8 shrink-0 mr-2 flex flex-col justify-end">
                  {showAvatar && (
                    <img
                      src={
                        otherUser?.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.id}`
                      }
                      className="w-8 h-8 rounded-full border border-white/10 object-cover"
                      alt=""
                    />
                  )}
                </div>
              )}

              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                <div
                  className={`px-5 py-3 shadow-lg ${
                    isMe
                      ? "rounded-3xl rounded-br-sm bg-gradient-to-tr from-[#FF416C] to-[#8E2DE2] text-white shadow-[#FF416C]/20"
                      : "rounded-3xl rounded-bl-sm bg-white/10 border border-white/5 text-white backdrop-blur-md"
                  }`}
                >
                  {msg.kind === "text" && (
                    <p className="text-[15px] leading-relaxed break-words font-medium">
                      {msg.content}
                    </p>
                  )}

                  {msg.kind === "audio" && (
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <button
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isMe ? "bg-white/20 text-white hover:bg-white/30" : "bg-[#FF416C] text-white hover:bg-[#FF416C]/90"} transition-colors shadow-sm`}
                      >
                        <Play size={18} className="fill-current ml-1" />
                      </button>
                      <div className="flex-1">
                        <Waveform />
                      </div>
                      <span className="text-xs font-bold opacity-80">0:14</span>
                    </div>
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold text-white/30 mt-1.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "text-right" : "text-left"}`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING INPUT DOCK */}
      <div className="p-4 z-20 pb-8 bg-gradient-to-t from-[#1A181C] via-[#1A181C]/90 to-transparent">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full p-1.5 shadow-2xl">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0">
            <Plus size={20} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message..."
            className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-2 text-[15px] text-white font-medium outline-none placeholder:text-white/40"
          />

          {inputText.trim() ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#FF416C] to-[#8E2DE2] text-white shadow-lg shrink-0"
            >
              <Send size={18} className="ml-1" />
            </motion.button>
          ) : (
            <div className="flex items-center gap-1 pr-1 shrink-0">
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-white/50 hover:text-white transition-colors">
                <Smile size={20} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF416C]/20 text-[#FF416C] hover:bg-[#FF416C]/30 transition-colors">
                <Mic size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
