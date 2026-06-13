import { useState, useEffect } from 'react';
import { ChevronLeft, MessageCircle, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { T, Avatar, EmptyState, Skeleton } from "@/components/common";
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
        .from('conversation_participants')
        .select('conversation_id, conversations(*)')
        .eq('user_id', profile.id);

      if (data) {
        // Need to extract the nested conversations and then ideally fetch the other members.
        // For simple UI display:
        const convs = data.map(d => d.conversations) as any;
        setConversations(convs);
      }
      setLoading(false);
    }
    loadConversations();
  }, [profile]);

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-40 px-4 py-4 bg-[#0F0D0B]/90 backdrop-blur-md border-b border-[#2E2822] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[#8A7F74] hover:text-[#F5F0EA] transition">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-[#F5F0EA]">Messages</h1>
        </div>
        <button className="text-[#F5F0EA]">
          <Edit size={20} />
        </button>
      </header>

      <main>
        {loading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState icon={<MessageCircle />} title="No messages yet" subtitle="Start a conversation with friends." />
        ) : (
          <div className="divide-y divide-[#2E2822]">
            {conversations.map((conv) => (
              <Link to={`/chat/${conv.id}`} key={conv.id} className="flex items-center gap-3 p-4 hover:bg-[#1C1814] transition cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-[#2E2822] flex items-center justify-center text-[#8A7F74]">
                  {/* Placeholder for conversation avatar */}
                  <MessageCircle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#F5F0EA] truncate">
                      {conv.group_name || 'Conversation'}
                    </p>
                    {conv.last_message_at && (
                      <span className="text-xs text-[#8A7F74] flex-shrink-0 ml-2">
                        {timeAgo(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#8A7F74] truncate mt-0.5">
                    {conv.last_message || 'No messages yet'}
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
