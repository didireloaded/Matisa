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
  Image as ImageIcon,
  Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { MessageService } from "../services/messages";
import { VoicePlayer } from "@/components/ui/VoicePlayer";
import { Avatar } from "@/components/common/Avatar";
import { Input } from "@/components/ui/input";

export function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast.error("Failed to send message");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile || !id) return;

    // For simplicity, treating all files as images here.
    try {
      await MessageService.sendMediaMessage(id, profile.id, file, "image");
    } catch (err) {
      toast.error("Failed to upload image");
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--color-background)] relative">
      {/* HEADER */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 pt-12 pb-4 bg-[var(--color-background)]/80 backdrop-blur-2xl border-b border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-white hover:bg-[var(--color-surface-3)] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3 cursor-pointer">
            <Avatar
              size={44}
              isOnline={true}
              profile={{
                id: otherUser?.id || "unknown",
                display_name: otherUser?.display_name || "Loading...",
                avatar_url: otherUser?.avatar_url || "",
              }}
            />
            <div className="flex flex-col justify-center">
              <h2 className="font-bold text-[17px] leading-tight text-white tracking-tight">
                {otherUser?.display_name || "Loading..."}
              </h2>
              <p className="text-[13px] font-semibold text-[var(--color-success)]">Active now</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Video calling coming soon")}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-white transition-colors"
          >
            <Video size={22} />
          </button>
          <button
            onClick={() => toast.info("Audio calling coming soon")}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-white transition-colors"
          >
            <Phone size={22} />
          </button>
        </div>
      </div>

      {/* MESSAGE LIST */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 z-10 no-scrollbar">
        {messages.map((msg, index) => {
          const isMe = msg.user_id === profile?.id;
          const showAvatar = !isMe && (index === 0 || messages[index - 1].user_id !== msg.user_id);
          const isVoice = msg.type === "voice" || msg.content?.includes("🎤"); // simple heuristic

          return (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {!isMe && (
                  <div className="w-8 shrink-0">
                    {showAvatar && (
                      <Avatar
                        size={32}
                        profile={{
                          id: otherUser?.id || "unknown",
                          display_name: otherUser?.display_name || "User",
                          avatar_url: otherUser?.avatar_url || "",
                        }}
                      />
                    )}
                  </div>
                )}

                <div
                  className={`relative px-5 py-3.5 shadow-md ${
                    isMe
                      ? "bg-gradient-to-br from-[var(--color-primary)] to-[#c026d3] text-white rounded-2xl rounded-br-sm"
                      : "bg-[var(--color-surface-2)] text-white rounded-2xl rounded-bl-sm border border-[var(--color-border)]"
                  }`}
                >
                  {msg.kind === "image" ? (
                    <div className="w-48 h-48 rounded-lg overflow-hidden">
                      <img
                        src={msg.media_url}
                        alt="Sent image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : isVoice ? (
                    <div className="w-48">
                      <VoicePlayer
                        audioUrl={msg.media_url}
                        duration="0:12"
                        waveform={[4, 8, 12, 24, 18, 12, 8, 20, 30, 15, 10, 5]}
                      />
                    </div>
                  ) : (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <span
                    className={`block text-[10px] mt-1.5 font-medium ${
                      isMe ? "text-white/70 text-right" : "text-[var(--color-text-muted)] text-left"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* COMPOSER */}
      <div className="sticky bottom-0 z-20 px-4 pb-safe pt-2 bg-gradient-to-t from-[var(--color-background)] to-transparent">
        <div className="flex items-center gap-2 p-2 bg-[var(--color-surface-2)] rounded-full border border-[var(--color-border)] shadow-lg mb-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-white transition-colors">
            <Plus size={22} />
          </button>

          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message..."
            className="flex-1 bg-transparent text-white placeholder-[var(--color-text-muted)] focus:outline-none text-[15px]"
          />

          <AnimatePresence mode="popLayout">
            {inputText.trim() ? (
              <motion.button
                key="send"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleSend}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]"
              >
                <Send size={18} className="ml-0.5" />
              </motion.button>
            ) : (
              <motion.div key="actions" className="flex items-center gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-white transition-colors"
                >
                  <ImageIcon size={20} />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                  <Mic size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Chat;
