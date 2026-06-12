import React from "react";
import { useNavigate } from "@/lib/router-compat";
import { Mic, Plus, UserPlus, MessageCircle, Hand } from "lucide-react";
import { STORIES, ME_ID, getProfile, PROFILES } from "../data/mock";

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

// Inline Avatar component
function Avatar({ src, ringColor, className = "", style = {} }: { src: string, ringColor?: string, className?: string, style?: React.CSSProperties }) {
  const ringStyle = ringColor ? { boxShadow: `0 0 0 2px #0F0D0B, 0 0 0 4px ${ringColor}` } : {};
  return (
    <div className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`} style={{ ...ringStyle, ...style }}>
      <img src={src} alt="avatar" className="w-full h-full object-cover" />
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const me = getProfile(ME_ID);
  
  // Filter radar profiles
  const otherProfiles = PROFILES.filter(p => p.id !== ME_ID);
  const nearbyProfiles = otherProfiles.filter(p => p.distance && p.distance < 1000);
  const onlineProfiles = otherProfiles.filter(p => p.online);
  const suggestedProfiles = otherProfiles.filter(p => !p.online && (!p.distance || p.distance >= 1000)).slice(0, 3);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-[#0F0D0B] text-[#F5F0EA] pb-24">
      {/* Header padding */}
      <div className="pt-6 pb-2 px-4" />

      {/* Stories Section */}
      <div className="flex overflow-x-auto hide-scrollbar px-4 pb-6 space-x-4">
        {/* My Story */}
        <div 
          className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer" 
          onClick={() => navigate("/create")}
        >
          <div className="relative mb-1">
            {me && <Avatar src={me.avatar} className="w-16 h-16" />}
            <div className="absolute bottom-0 right-0 rounded-full p-1 bg-[#C8521A] border-2 border-[#0F0D0B]">
              <Plus size={12} color="#F5F0EA" />
            </div>
          </div>
          <span className="text-xs text-[#F5F0EA]">Add Story</span>
        </div>

        {/* Other Stories */}
        {STORIES.map(story => {
          const profile = getProfile(story.userId);
          if (!profile) return null;
          return (
            <div key={story.id} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer">
              <div className="relative mb-1">
                <Avatar 
                  src={profile.avatar} 
                  className="w-16 h-16" 
                  ringColor={story.viewed ? T.border : T.primary} 
                />
                {story.type === "audio" && (
                  <div className="absolute bottom-0 right-0 rounded-full p-1 bg-[#221D18] border-2 border-[#0F0D0B]">
                    <Mic size={10} color="#F5F0EA" />
                  </div>
                )}
              </div>
              <span className="text-xs" style={{ color: story.viewed ? T.muted : T.text }}>
                {(profile.name || '').split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Radar Section */}
      <div className="px-4 mb-4">
        <h2 className="font-display font-bold text-2xl text-[#F5F0EA]">Radar</h2>
        <p className="text-sm mt-1 text-[#8A7F74]">Who's around you</p>
      </div>

      {/* Nearby */}
      {nearbyProfiles.length > 0 && (
        <div className="mb-6">
          <div className="px-4 mb-3 text-sm font-semibold text-[#E8A055]">Nearby</div>
          <div className="flex overflow-x-auto hide-scrollbar px-4 space-x-4 pb-2">
            {nearbyProfiles.map(p => <RadarCard key={`nearby-${p.id}`} profile={p} type="nearby" />)}
          </div>
        </div>
      )}

      {/* Online */}
      {onlineProfiles.length > 0 && (
        <div className="mb-6">
          <div className="px-4 mb-3 text-sm font-semibold text-[#4CAF7D]">Online Now</div>
          <div className="flex overflow-x-auto hide-scrollbar px-4 space-x-4 pb-2">
            {onlineProfiles.map(p => <RadarCard key={`online-${p.id}`} profile={p} type="online" />)}
          </div>
        </div>
      )}

      {/* Suggested */}
      {suggestedProfiles.length > 0 && (
        <div className="mb-6">
          <div className="px-4 mb-3 text-sm font-semibold text-[#F5F0EA]">Suggested</div>
          <div className="flex overflow-x-auto hide-scrollbar px-4 space-x-4 pb-2">
            {suggestedProfiles.map(p => <RadarCard key={`suggested-${p.id}`} profile={p} type="suggested" />)}
          </div>
        </div>
      )}

    </div>
  );
}

function RadarCard({ profile, type }: { profile: any, type: string }) {
  return (
    <div className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border bg-[#1C1814] border-[#2E2822] flex flex-col">
      {/* Top half */}
      <div 
        className="h-20 relative flex items-center justify-center" 
        style={{ background: profile.gradient || `linear-gradient(to right, ${T.primary}, ${T.sand})` }}
      >
        <div className="absolute -bottom-8">
          <Avatar 
            src={profile.avatar} 
            className="w-16 h-16 border-4 border-[#1C1814] bg-[#1C1814]" 
          />
          {profile.online && (
             <div 
               className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1C1814] bg-[#4CAF7D]" 
             />
          )}
        </div>
      </div>
      
      {/* Bottom half */}
      <div className="p-3 pt-10 flex flex-col items-center text-center flex-1">
        <h3 className="font-semibold text-[#F5F0EA] truncate w-full">{profile.name}</h3>
        <p className="text-xs text-[#8A7F74] truncate w-full">@{profile.username}</p>
        
        {type === 'nearby' && profile.distance && (
          <p className="text-xs mt-1 font-medium text-[#E8A055]">{profile.distance}m away</p>
        )}

        <div className="flex flex-row gap-2 mt-3 justify-center w-full">
          <button className="rounded-full bg-[#C8521A] text-white p-2 flex items-center justify-center transition-colors hover:bg-opacity-90">
            <UserPlus size={16} />
          </button>
          <button className="rounded-full bg-[#2E2822] text-[#F5F0EA] p-2 flex items-center justify-center transition-colors hover:bg-opacity-90">
            <MessageCircle size={16} />
          </button>
          <button className="rounded-full bg-[#2E2822] text-[#F5F0EA] p-2 flex items-center justify-center transition-colors hover:bg-opacity-90">
            <Hand size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
