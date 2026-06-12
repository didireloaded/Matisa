import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Users, MapPin, Hash, MessageCircle, Play, Calendar, Mic, Headphones } from "lucide-react";
import { COMMUNITIES, POSTS, EVENTS, getProfile, fmt, LISTENING_SESSIONS } from "../data/mock";

const T = { 
  bg: "#0F0D0B", 
  surface: "#1C1814", 
  s2: "#221D18", 
  border: "#2E2822", 
  text: "#F5F0EA", 
  muted: "#8A7F74", 
  primary: "#C8521A", 
  sand: "#E8A055", 
  sky: "#2D7DD2", 
  success: "#4CAF7D" 
};

// Local component for rendering simple posts in the Feed tab
const PostCard = ({ post }: { post: any }) => {
  const profile = getProfile(post.authorId) || getProfile("user_1");
  return (
    <div className="p-4 mb-4 rounded-xl" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-3 mb-3">
        <img src={profile?.avatar} alt={profile?.handle} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <h4 className="font-medium text-sm text-[#F5F0EA]">{profile?.name}</h4>
          <p className="text-xs text-[#8A7F74]">@{profile?.handle} • {fmt.time(post.timestamp)}</p>
        </div>
      </div>
      <p className="text-sm text-[#F5F0EA] mb-3">{post.content}</p>
      {post.media && post.media.length > 0 && (
        <div className="mb-3 rounded-lg overflow-hidden h-48">
          <img src={post.media[0].url} alt="Post media" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex items-center gap-4 text-[#8A7F74] text-xs">
        <div className="flex items-center gap-1">
          <span>👍</span> {fmt.num(post.likes)}
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={14} /> {fmt.num(post.comments)}
        </div>
      </div>
    </div>
  );
};

export function CommunityDetail() {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Feed");
  const [isJoined, setIsJoined] = useState(false);

  // Fallback to first community if unknown ID is passed
  const community = COMMUNITIES.find((c) => c.id === id) || COMMUNITIES[0];

  if (!community) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: T.bg, color: T.text }}>
      {/* 1. HEADER */}
      <div className="h-48 relative flex flex-col justify-between p-4" style={{ background: `linear-gradient(to bottom right, ${T.primary}40, ${T.bg})`, borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between z-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full" style={{ backgroundColor: `${T.surface}99` }}>
            <ArrowLeft size={20} color={T.text} />
          </button>
          <button className="p-2 rounded-full" style={{ backgroundColor: `${T.surface}99` }}>
            <MoreHorizontal size={20} color={T.text} />
          </button>
        </div>
        
        <div className="z-10 mt-auto flex flex-row items-end justify-between">
          <div className="flex-1 pr-4">
            <h1 className="text-2xl font-display font-bold mb-1">{community.name}</h1>
            <p className="text-sm mb-2 line-clamp-2" style={{ color: T.muted }}>{community.description}</p>
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: T.muted }}>
              <Users size={14} /> {fmt.num(community.members)} members
            </div>
          </div>
          <button 
            onClick={() => setIsJoined(!isJoined)}
            className="px-5 py-2 rounded-full text-sm font-bold transition-colors shrink-0"
            style={{ 
              backgroundColor: isJoined ? T.surface : T.primary,
              color: isJoined ? T.text : "#FFFFFF",
              border: isJoined ? `1px solid ${T.border}` : `1px solid ${T.primary}`
            }}
          >
            {isJoined ? "Joined" : "Join"}
          </button>
        </div>
      </div>

      {/* 2. TABS */}
      <div className="sticky top-0 z-20 flex overflow-x-auto hide-scrollbar" style={{ backgroundColor: T.bg, borderBottom: `1px solid ${T.border}` }}>
        {["Feed", "Chat", "Events", "Rooms"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 text-sm font-medium whitespace-nowrap px-4 border-b-2 transition-colors"
            style={{ 
              borderColor: activeTab === tab ? T.primary : "transparent",
              color: activeTab === tab ? T.text : T.muted
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT */}
      <div className="flex-1 p-4 pb-24 overflow-y-auto hide-scrollbar">
        {activeTab === "Feed" && (
          <div className="flex flex-col gap-4">
            {POSTS.slice(0, 3).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {activeTab === "Chat" && (
          <div className="flex flex-col gap-6">
            <div className="rounded-xl p-4 flex flex-col gap-4" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-xs text-center" style={{ color: T.muted }}>Welcome to the {community.name} general chat!</p>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs" style={{ backgroundColor: T.sand, color: T.bg }}>A</div>
                <div className="p-3 rounded-2xl rounded-tl-sm text-sm" style={{ backgroundColor: T.s2 }}>
                  Hey everyone! So excited to be part of this community. Any recommendations on where to start?
                </div>
              </div>
              
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs" style={{ backgroundColor: T.primary, color: T.text }}>M</div>
                <div className="p-3 rounded-2xl rounded-tr-sm text-sm" style={{ backgroundColor: T.s2 }}>
                  Welcome! Check out the events tab, we have a meetup this weekend! 🎉
                </div>
              </div>
            </div>
            
            <button className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2" style={{ backgroundColor: T.primary, color: "#FFFFFF" }}>
              <MessageCircle size={18} /> Open Community Chat
            </button>
          </div>
        )}

        {activeTab === "Events" && (
          <div className="flex flex-col gap-4">
            {EVENTS.slice(0, 2).map((event) => (
              <div key={event.id} className="p-4 rounded-xl flex gap-4" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
                <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: T.s2 }}>
                  <span className="text-xs font-bold" style={{ color: T.primary }}>MAY</span>
                  <span className="text-xl font-bold">24</span>
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-sm mb-1">{event.title}</h4>
                  <div className="flex items-center gap-1 text-xs mb-1" style={{ color: T.muted }}>
                    <MapPin size={12} /> {event.location}
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: T.muted }}>
                    <Users size={12} /> {fmt.num(event.attendees)} attending
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Rooms" && (
          <div className="flex flex-col gap-4">
            <button className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-2" style={{ backgroundColor: T.surface, border: `1px solid ${T.primary}`, color: T.primary }}>
              <Mic size={18} /> Start Room
            </button>
            
            {LISTENING_SESSIONS.slice(0, 2).map((session) => (
              <div
                key={session.id}
                className="p-5 rounded-2xl border relative overflow-hidden"
                style={{ 
                  backgroundColor: T.surface, 
                  borderColor: T.border 
                }}
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full opacity-50"
                  style={{ background: session.gradient }}
                />
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: session.gradient }}
                  >
                    <Mic size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg truncate mb-1">{session.title}</div>
                    <div className="text-sm truncate flex items-center gap-2" style={{ color: T.muted }}>
                      <span>Host: {session.host}</span>
                      <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                      <span className="flex items-center gap-1" style={{ color: T.primary }}>
                        <Headphones size={12} />
                        {session.listeners}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/room/${session.id}`)}
                  className="w-full mt-4 py-3 rounded-xl font-bold transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: T.primary, color: "#fff" }}
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
