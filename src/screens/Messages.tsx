import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Search, Edit, Mic, Image, Users, Check, CheckCheck } from "lucide-react";
import { CONVERSATIONS, getProfile, fmt, ME_ID } from "../data/mock";

const T = { bg: "#0F0D0B", surface: "#1C1814", s2: "#221D18", border: "#2E2822", text: "#F5F0EA", muted: "#8A7F74", primary: "#C8521A", sand: "#E8A055", sky: "#2D7DD2", success: "#4CAF7D" };

export function Messages() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"Direct" | "Groups">("Direct");

  const filteredConversations = CONVERSATIONS.filter(c => 
    activeTab === "Groups" ? c.is_group : !c.is_group
  );

  return (
    <div className="min-h-screen w-full pb-20" style={{ backgroundColor: T.bg, color: T.text }}>
      {/* HEADER */}
      <div className="px-4 pt-6 pb-2 sticky top-0 z-10" style={{ backgroundColor: T.bg }}>
        <div className="flex justify-between items-end mb-2">
          <h1 className="text-3xl font-display font-bold">Messages</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full" style={{ backgroundColor: T.surface }}>
              <Search size={20} color={T.text} />
            </button>
            <button className="p-2 rounded-full" style={{ backgroundColor: T.surface }}>
              <Edit size={20} color={T.text} />
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex px-4 mb-4 border-b" style={{ borderColor: T.border }}>
        <button 
          className="flex-1 pb-3 font-semibold relative transition-colors"
          style={{ color: activeTab === "Direct" ? T.primary : T.muted }}
          onClick={() => setActiveTab("Direct")}
        >
          Direct
          {activeTab === "Direct" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: T.primary }} />
          )}
        </button>
        <button 
          className="flex-1 pb-3 font-semibold relative transition-colors"
          style={{ color: activeTab === "Groups" ? T.primary : T.muted }}
          onClick={() => setActiveTab("Groups")}
        >
          Groups
          {activeTab === "Groups" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: T.primary }} />
          )}
        </button>
      </div>

      {/* CONVERSATION LIST */}
      <div className="px-4 flex flex-col gap-1">
        {filteredConversations.map((conv) => {
          let avatar = "";
          let name = "";
          
          if (conv.is_group) {
            name = conv.group_name || "Group";
          } else {
            // Find the other user
            const otherUserId = (conv.member_ids || conv.participants || []).find((p: string) => p !== ME_ID && p !== "u1");
            const profile = otherUserId ? getProfile(otherUserId) : null;
            if (profile) {
              name = profile.name;
              avatar = profile.avatar_url;
            } else {
              name = "Unknown User";
            }
          }

          const isVoiceNote = conv.last_message.toLowerCase().includes("voice note");
          const isImage = conv.last_message.toLowerCase().includes("image");
          
          // Mocking "sent by me" if unread === 0
          const sentByMe = conv.unread === 0;

          return (
            <div 
              key={conv.id} 
              className="flex items-center gap-3 py-3 active:opacity-70 cursor-pointer transition-opacity"
              onClick={() => navigate(`/messages/${conv.id}`)}
            >
              {/* AVATAR */}
              <div className="relative shrink-0">
                {conv.is_group ? (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#C8521A] to-[#E8A055]">
                    <Users size={24} color="#FFF" />
                  </div>
                ) : (
                  <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover" style={{ backgroundColor: T.surface }} />
                )}
              </div>

              {/* CONTENT */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-base truncate" style={{ color: T.text }}>{name}</h3>
                  <span className="text-xs shrink-0 ml-2" style={{ color: conv.unread > 0 ? T.primary : T.muted }}>
                    {fmt.time(conv.updated_at)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
                    {sentByMe && (
                      <CheckCheck size={16} color={T.sky} className="shrink-0" />
                    )}
                    {isVoiceNote && <Mic size={14} color={T.primary} className="shrink-0" />}
                    {isImage && <Image size={14} color={T.muted} className="shrink-0" />}
                    
                    <p 
                      className="text-sm truncate"
                      style={{ 
                        color: conv.unread > 0 ? T.text : T.muted,
                        fontWeight: conv.unread > 0 ? 600 : 400
                      }}
                    >
                      {conv.last_message}
                    </p>
                  </div>

                  {conv.unread > 0 && (
                    <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: T.primary, color: "#FFF" }}>
                      {conv.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredConversations.length === 0 && (
          <div className="py-10 text-center" style={{ color: T.muted }}>
            No messages here yet.
          </div>
        )}
      </div>
    </div>
  );
}
