import { useState, useEffect } from "react";
import { ChevronLeft, MessageCircle, Edit, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, Skeleton } from "@/components/common";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { timeAgo } from "@/types";
import type { Conversation } from "@/types";

export function Messages() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="pb-28 min-h-full text-white relative">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-[#FF416C]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-[#8E2DE2]/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 px-6 pt-4 pb-4 bg-[#1A181C]/80 backdrop-blur-xl border-b border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white">Messages</h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#FF416C] to-[#8E2DE2] text-white shadow-lg shadow-[#FF416C]/20 hover:scale-105 transition-transform">
            <Edit size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-5 py-3 focus-within:border-white/30 transition-colors">
          <Search size={18} className="text-white/50" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full bg-transparent text-sm text-white font-medium outline-none placeholder:text-white/40"
          />
        </div>
      </header>

      <main className="pt-2 relative z-10">
        {loading ? (
          <div className="px-6 space-y-4 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center p-2">
                <div className="h-16 w-16 rounded-full bg-white/5 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded" />
                  <div className="h-3 w-3/4 bg-white/5 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="mt-12">
            <PremiumEmptyState
              icon={MessageCircle}
              title="No messages yet"
              description="Start a conversation with friends or discover new people."
              glowColor="primary"
            />
          </div>
        ) : (
          <div className="flex flex-col">
            {conversations.map((conv) => (
              <Link
                to={`/chat/${conv.id}`}
                key={conv.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer group border-b border-white/5"
              >
                {(conv as any).otherProfile ? (
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full border border-white/10 overflow-hidden">
                      <img
                        src={
                          (conv as any).otherProfile.avatar_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${(conv as any).otherProfile.id}`
                        }
                        alt={(conv as any).otherProfile.display_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Online Indicator */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00FF87] border-2 border-[#1A181C] rounded-full shadow-[0_0_10px_rgba(0,255,135,0.5)]" />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 shrink-0 shadow-inner">
                    <MessageCircle size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[16px] font-bold text-white truncate transition-colors">
                      {conv.group_name || (conv as any).otherProfile?.display_name || "User"}
                    </p>
                    {conv.last_message_at && (
                      <span className="text-xs font-semibold text-white/40 flex-shrink-0 ml-2">
                        {timeAgo(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-white/60 truncate leading-relaxed font-medium">
                    {conv.last_message || "No messages yet"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
