import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ArrowLeft, Send, Smile } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { MESSAGES, USERS } from "./data";

function getUserById(id: string) {
  return USERS.find((u) => u.id === id) || USERS[0];
}

interface ChatThread {
  userId: string;
  messages: { id: string; from: "me" | "them"; text: string; time: string }[];
}

const CHAT_THREADS: Record<string, ChatThread["messages"]> = {
  "2": [
    {
      id: "1",
      from: "them",
      text: "Yo the set was fire last night! You coming to the next one?",
      time: "2m",
    },
    { id: "2", from: "me", text: "Obviously!! What time does it start?", time: "1m" },
  ],
  "5": [
    { id: "1", from: "them", text: "Yes! I'll be there. Can you add me to the list?", time: "15m" },
    { id: "2", from: "me", text: "Done! Your name is on the door 🔥", time: "14m" },
  ],
  "3": [
    { id: "1", from: "them", text: "Check out these shots from Sossusvlei 😍", time: "1h" },
    { id: "2", from: "me", text: "These are insane!! Send them over please", time: "58m" },
  ],
};

function ChatView({ userId, onBack }: { userId: string; onBack: () => void }) {
  const user = getUserById(userId);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState(CHAT_THREADS[userId] || []);

  const send = () => {
    if (!input.trim()) return;
    setMsgs((m) => [...m, { id: String(Date.now()), from: "me", text: input, time: "now" }]);
    setInput("");
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-40 flex flex-col bg-[#0B0B0B]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
        >
          <ArrowLeft size={16} className="text-white" />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <ImageWithFallback
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-white text-sm" style={{ fontWeight: 600 }}>
            {user.name}
          </p>
          <p className="text-white/40 text-xs">@{user.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {msgs.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
              style={{
                background:
                  msg.from === "me" ? "linear-gradient(135deg, #FF9D2E, #FF6B35)" : "#1a1a1a",
                color: msg.from === "me" ? "#0B0B0B" : "rgba(255,255,255,0.85)",
                borderBottomRightRadius: msg.from === "me" ? "4px" : undefined,
                borderBottomLeftRadius: msg.from === "them" ? "4px" : undefined,
                fontWeight: msg.from === "me" ? 600 : 400,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-4 border-t border-white/5">
        <button>
          <Smile size={20} className="text-white/40" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message…"
          className="flex-1 bg-[#1a1a1a] text-white placeholder:text-white/30 rounded-full px-4 py-2.5 text-sm outline-none border border-white/5"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={send}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: input.trim() ? "#FF9D2E" : "#1a1a1a" }}
        >
          <Send size={16} className={input.trim() ? "text-black" : "text-white/30"} />
        </motion.button>
      </div>
    </motion.div>
  );
}

export function MessagesPage() {
  const [search, setSearch] = useState("");
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const filtered = MESSAGES.filter(() => true); // all for now

  return (
    <div className="min-h-full pb-28 relative">
      <div className="px-4 pt-4 pb-2">
        <h1
          className="text-white text-2xl mb-1"
          style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
        >
          Messages
        </h1>
      </div>

      <div className="px-4 py-2">
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full bg-[#1a1a1a] text-white placeholder:text-white/30 rounded-2xl pl-9 pr-4 py-2.5 text-sm outline-none border border-white/5"
          />
        </div>
      </div>

      <div className="mt-2">
        {filtered.map((msg, i) => {
          const user = getUserById(msg.userId);
          return (
            <motion.button
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setActiveChat(msg.userId)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/3 border-b border-white/5 text-left transition"
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <ImageWithFallback
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {msg.unread > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#FF9D2E] flex items-center justify-center">
                    <span className="text-[10px] text-black font-bold">{msg.unread}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="text-white text-sm"
                    style={{ fontWeight: msg.unread > 0 ? 700 : 500 }}
                  >
                    {user.name}
                  </span>
                  <span className="text-white/30 text-xs">{msg.time}</span>
                </div>
                <p className="text-white/40 text-xs truncate">{msg.lastMsg}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {activeChat && <ChatView userId={activeChat} onBack={() => setActiveChat(null)} />}
      </AnimatePresence>
    </div>
  );
}
