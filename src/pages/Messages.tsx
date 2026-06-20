import { useState, useEffect } from "react";
import { Search, PenSquare, Mic, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { PremiumEmptyState as EmptyState } from "@/components/common/PremiumEmptyState";
import { timeAgo } from "@/lib/utils";
import { DiscoveryAI } from "@/services/ai";
import type { Conversation } from "@/types";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/common/Avatar";

export function Messages() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadConversations() {
      if (!profile) {
        setLoading(false);
        return;
      }
      try {
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

          // Fetch unread counts
          const convIds = convs.map((c) => c.id);
          if (convIds.length > 0) {
            const { data: msgs } = await supabase
              .from("messages")
              .select("id, conversation_id")
              .in("conversation_id", convIds)
              .neq("sender_id", profile.id);

            const { data: reads } = await supabase
              .from("message_reads")
              .select("message_id")
              .eq("user_id", profile.id);

            const readMsgIds = new Set(reads?.map((r) => r.message_id) || []);
            const counts: Record<string, number> = {};

            msgs?.forEach((m) => {
              if (!readMsgIds.has(m.id)) {
                counts[m.conversation_id] = (counts[m.conversation_id] || 0) + 1;
              }
            });
            setUnreadCounts(counts);
          }
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, [profile]);

  const filtered = conversations.filter((conv) => {
    if (!search) return true;
    const name = conv.group_name || (conv as any).otherProfile?.display_name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-background)]">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-white text-3xl font-display font-bold tracking-tight">Messages</h1>
        <button className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-white hover:bg-[var(--color-surface-3)] transition-colors">
          <PenSquare size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <Tabs
          variant="pill"
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "all", label: "All" },
            { id: "primary", label: "Primary", badge: Object.values(unreadCounts).reduce((a, b) => a + b, 0) },
            { id: "requests", label: "Requests" },
          ]}
        />
      </div>

      {/* Search */}
      <div className="px-5 mb-6">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages..."
          icon={<Search size={18} />}
          className="h-12 rounded-full border-none bg-[var(--color-surface-2)]"
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 px-5">
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-14 w-14 rounded-full bg-[var(--color-surface-2)] animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-[var(--color-surface-2)] animate-pulse rounded" />
                  <div className="h-3 w-3/4 bg-[var(--color-surface-2)] animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={MessageSquare}
              title={search ? "No matches found" : "No messages yet"}
              description={
                search
                  ? "Try a different search term."
                  : "Start a conversation by reaching out to someone."
              }
              glowColor="primary"
            />
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {filtered.map((conv, i) => {
              const other = (conv as any).otherProfile;
              const name = conv.group_name || other?.display_name || "User";
              const avatar =
                other?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.id}`;
              const unread = unreadCounts[conv.id] || 0;

              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/chat/${conv.id}`} className="flex items-center gap-4 py-3 group">
                    <Avatar
                      size={56}
                      isOnline={i % 3 === 0}
                      profile={{
                        id: other?.id || "unknown",
                        display_name: name,
                        avatar_url: avatar,
                      }}
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-base truncate ${unread > 0 ? "text-white font-bold" : "text-white/90 font-semibold"}`}
                        >
                          {name}
                        </span>
                        <span
                          className={`text-xs whitespace-nowrap ${unread > 0 ? "text-[var(--color-primary)] font-bold" : "text-[var(--color-text-muted)] font-medium"}`}
                        >
                          {conv.last_message_at ? timeAgo(conv.last_message_at) : "Just now"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm truncate pr-4 flex items-center gap-1.5 ${unread > 0 ? "text-white font-medium" : "text-[var(--color-text-muted)]"}`}
                        >
                          {i === 1 ? (
                            <>
                              <Mic size={14} className="text-[var(--color-primary)]" />
                              <span className="text-[var(--color-primary)] font-medium">
                                Sent a voice note
                              </span>
                            </>
                          ) : (
                            conv.last_message?.content || "Started a conversation"
                          )}
                        </p>
                        {unread > 0 && (
                          <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                            <span className="text-[10px] text-white font-bold">{unread}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
