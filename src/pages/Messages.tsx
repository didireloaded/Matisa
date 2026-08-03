import { useState, useEffect } from "react";
import { ArrowLeft, MoreVertical, Plus, Mic, Send, BellOff, Bell, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/common/Avatar";
import { USERS } from "@/data/dummy";
import { VoiceNoteRecorderModal } from "@/components/voice/VoiceNoteRecorderModal";
import { VoicePlayer } from "@/components/ui/VoicePlayer";
import { toast } from "sonner";

export function Messages() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"inbox" | "unread" | "requests" | "voicemail">(
    "inbox",
  );
  const [isVoicemailModalOpen, setIsVoicemailModalOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    async function loadConvs() {
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
              profiles (id, username, display_name, avatar_url)
            )
          )
        `,
        )
        .eq("user_id", profile.id);

      if (data && data.length > 0) {
        const parsed = data
          .map((d) => {
            const conv = d.conversations as any;
            if (!conv) return null;
            const other = conv.conversation_participants?.find(
              (p: any) => p.user_id !== profile.id,
            );
            return {
              ...conv,
              otherProfile: other?.profiles || null,
            };
          })
          .filter(Boolean);
        setConversations(parsed);
      } else {
        setConversations([
          {
            id: "conv-1",
            otherProfile: {
              id: USERS[0].id,
              display_name: "Jenny Wilson",
              username: USERS[0].username,
              avatar_url: USERS[0].avatar,
            },
            last_message: "Sure, I'll be there in 5 mins...",
            time: "2mins ago",
            unread: true,
            muted: false,
          },
          {
            id: "conv-2",
            otherProfile: {
              id: USERS[1].id,
              display_name: "Guy Hawkins",
              username: USERS[1].username,
              avatar_url: USERS[1].avatar,
            },
            last_message: "I'll get back to you on the track...",
            time: "08:24",
            unread: false,
            muted: true,
          },
          {
            id: "conv-3",
            otherProfile: {
              id: USERS[2].id,
              display_name: "Kristin Watson",
              username: USERS[2].username,
              avatar_url: USERS[2].avatar,
            },
            last_message: "Keep you in the loop!",
            time: "09:12",
            unread: false,
            muted: false,
          },
          {
            id: "conv-4",
            otherProfile: {
              id: USERS[3].id,
              display_name: "Arlene McCoy",
              username: USERS[3].username,
              avatar_url: USERS[3].avatar,
            },
            last_message: "I'll take a peek, but not sure...",
            time: "Yesterday",
            unread: false,
            muted: true,
          },
        ]);
      }
    }
    loadConvs();
  }, [profile]);

  const displayConversations = conversations.filter((c) => {
    if (activeTab === "unread") return c.unread;
    if (activeTab === "requests") return c.is_request;
    return true; // inbox
  });

  return (
    <div className="flex flex-col min-h-full pb-28 pt-2">
      {/* 1. Reelio Inbox Top Header */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition border border-white/15 active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-xl font-bold text-white tracking-tight font-display">Message</h1>

        <button
          onClick={() => toast.info("Message inbox options")}
          className="flex h-10 w-10 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition border border-white/15 active:scale-95"
          aria-label="Options"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* 2. Reelio Circular Story Avatar Ring ("Add note" badge) */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-center gap-3 overflow-x-auto no-scrollbar py-2">
          {USERS.slice(0, 5).map((u, idx) => {
            if (idx === 2) {
              return (
                <div key={u.id} className="relative flex flex-col items-center">
                  <span className="absolute -top-3.5 z-20 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#6139F2] to-[#24A3C7] text-[9px] font-bold text-white shadow-lg border border-white/20 whitespace-nowrap">
                    Add note
                  </span>
                  <div className="relative h-14 w-14 rounded-full p-0.5 border-2 border-[#24A3C7]">
                    <Avatar
                      size={52}
                      profile={{
                        id: u.id,
                        display_name: u.name,
                        avatar_url: u.avatar,
                      }}
                      className="w-full h-full"
                    />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-black text-[10px] font-bold border border-black shadow">
                      +
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div key={u.id} className="h-12 w-12 rounded-full p-0.5 border border-white/20">
                <Avatar
                  size={44}
                  profile={{
                    id: u.id,
                    display_name: u.name,
                    avatar_url: u.avatar,
                  }}
                  className="w-full h-full opacity-80"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Reelio Filter Tabs (Inbox 26, Unread, Voicemail, Requests) */}
      <div className="px-5 mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 ${
            activeTab === "inbox"
              ? "bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-white shadow-md border border-white/20"
              : "glass-panel text-white/50 hover:text-white"
          }`}
        >
          Inbox 26
        </button>

        <button
          onClick={() => setActiveTab("unread")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 ${
            activeTab === "unread"
              ? "bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-white shadow-md border border-white/20"
              : "glass-panel text-white/50 hover:text-white"
          }`}
        >
          Unread
        </button>

        <button
          onClick={() => setActiveTab("voicemail" as any)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
            (activeTab as string) === "voicemail"
              ? "bg-gradient-to-r from-[#FF9D2E] to-[#24A3C7] text-white shadow-md border border-white/20"
              : "glass-panel text-white/50 hover:text-white"
          }`}
        >
          <Mic size={13} className="text-[#FF9D2E]" />
          <span>Voicemail (2)</span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 ${
            activeTab === "requests"
              ? "bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-white shadow-md border border-white/20"
              : "glass-panel text-white/50 hover:text-white"
          }`}
        >
          Requests
        </button>
      </div>

      {/* 4. Chat Conversation / Voicemail List Rows */}
      <div className="px-5 space-y-2.5 flex-1">
        {activeTab === "voicemail" ? (
          <div className="space-y-3">
            <button
              onClick={() => setIsVoicemailModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-[22px] bg-gradient-to-r from-[#FF9D2E]/20 to-[#24A3C7]/20 border border-[#24A3C7]/30 text-white font-bold text-xs hover:border-[#24A3C7]/60 transition active:scale-95 shadow-md"
            >
              <Mic size={16} className="text-[#FF9D2E]" />
              <span>Leave a Voicemail</span>
            </button>

            {/* Dummy Voicemail Cards */}
            <div className="glass-panel p-4 rounded-[22px] border border-white/15 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    size={36}
                    profile={{
                      id: USERS[0].id,
                      display_name: USERS[0].name,
                      avatar_url: USERS[0].avatar,
                    }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{USERS[0].name}</h4>
                    <p className="text-[10px] text-white/50">Voicemail • 10m ago</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF9D2E]/20 text-[#FF9D2E] border border-[#FF9D2E]/30">
                  New
                </span>
              </div>
              <VoicePlayer duration="0:24" />
            </div>

            <div className="glass-panel p-4 rounded-[22px] border border-white/15 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    size={36}
                    profile={{
                      id: USERS[1].id,
                      display_name: USERS[1].name,
                      avatar_url: USERS[1].avatar,
                    }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{USERS[1].name}</h4>
                    <p className="text-[10px] text-white/50">Voicemail • Yesterday</p>
                  </div>
                </div>
              </div>
              <VoicePlayer duration="0:45" />
            </div>
          </div>
        ) : (
          displayConversations.map((c) => {
            const other = c.otherProfile || USERS[0];
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/messages/${c.id}`)}
                className="flex items-center justify-between glass-panel p-3.5 rounded-[22px] cursor-pointer hover:border-white/20 transition group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative">
                    <Avatar
                      size={46}
                      profile={{
                        id: other.id,
                        display_name: other.display_name || other.name,
                        avatar_url: other.avatar_url || other.avatar || "",
                      }}
                    />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#35C67A] border-2 border-[#06101D]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white truncate">
                      {other.display_name || other.name}
                    </h3>
                    <p className="text-xs text-white/60 truncate mt-0.5">{c.last_message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-[11px] text-white/40 ml-2">
                  <span>{c.time || "2m ago"}</span>
                  {c.muted ? (
                    <BellOff size={14} className="text-white/30" />
                  ) : (
                    <Bell size={14} className="text-white/30" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Reelio Bottom Input / Floating Capsule */}
      <div className="px-5 mt-4">
        <div className="flex items-center justify-between glass-panel-elevated p-2 rounded-full border border-white/20 backdrop-blur-2xl">
          <button
            onClick={() => navigate("/messages/new")}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold text-white hover:bg-white/10"
          >
            <Plus size={16} />
            <span>New</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoicemailModalOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:text-white"
            >
              <Mic size={18} />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#24A3C7] text-white shadow-md active:scale-90 transition">
              <Send size={16} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {isVoicemailModalOpen && (
        <VoiceNoteRecorderModal
          open={isVoicemailModalOpen}
          onClose={() => setIsVoicemailModalOpen(false)}
          mode="voicemail"
        />
      )}
    </div>
  );
}

export default Messages;
