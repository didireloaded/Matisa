import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { timeAgo } from "@/types";
import type { Conversation } from "@/types";

export function Messages() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadConversations() {
      if (!profile) return;
      const { data } = await supabase
        .from("conversation_participants")
        .select(
          `
          conversation_id, 
          conversations (
            *,
            conversation_participants (
              user_id,
              profiles (
                id,
                username,
                display_name,
                avatar_url
              )
            )
          )
        `,
        )
        .eq("user_id", profile.id);

      if (data) {
        const convs = data
          .map((d) => {
            const conv = d.conversations as any;
            if (!conv) return null;
            // Find the other participant
            const otherParticipant = conv.conversation_participants?.find(
              (p: any) => p.user_id !== profile.id,
            );
            return {
              ...conv,
              otherProfile: otherParticipant?.profiles || null,
            };
          })
          .filter(Boolean);
        setConversations(convs);
      }
      setLoading(false);
    }
    loadConversations();
  }, [profile]);

  const filtered = conversations.filter(conv => {
    if (!search) return true;
    const name = conv.group_name || (conv as any).otherProfile?.display_name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-full pb-28 relative">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-white text-2xl mb-1 font-extrabold tracking-tight">Messages</h1>
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
        {loading ? (
          <div className="px-4 space-y-4 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center py-2">
                <div className="h-12 w-12 rounded-full bg-white/5 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded" />
                  <div className="h-3 w-3/4 bg-white/5 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 mt-8 text-center text-white/50 text-sm">
            No conversations found.
          </div>
        ) : (
          filtered.map((conv, i) => {
            const other = (conv as any).otherProfile;
            const name = conv.group_name || other?.display_name || "User";
            const avatar = other?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.id}`;
            const unread = 0; // Replace with actual unread count if available

            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={`/chat/${conv.id}`}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 border-b border-white/5 text-left transition"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <ImageWithFallback src={avatar} alt={name} className="w-full h-full object-cover" />
                    </div>
                    {unread > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#FF9D2E] flex items-center justify-center">
                        <span className="text-[10px] text-black font-bold">{unread}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-white text-sm" style={{ fontWeight: unread > 0 ? 700 : 500 }}>{name}</span>
                      <span className="text-white/30 text-xs">
                        {conv.last_message_at ? timeAgo(conv.last_message_at) : ""}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs truncate">
                      {conv.last_message || "No messages yet"}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
