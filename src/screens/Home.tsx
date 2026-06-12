import React from "react";
import { useNavigate } from 'react-router-dom';
import { Mic, Plus, UserPlus, MessageCircle, Hand } from "lucide-react";
import { STORIES, ME_ID, getProfile, PROFILES } from "../data/mock";
import { RadarCanvas } from "../components/radar/RadarCanvas";

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

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#0F0D0B] text-[#F5F0EA] pb-20">
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

      {/* Full Screen Radar */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <RadarCanvas />
      </div>
    </div>
  );
}
