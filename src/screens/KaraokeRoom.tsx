import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@/lib/router-compat";
import { X, Mic, MicOff, Settings2, Gift, MessageCircle, Users } from "lucide-react";
import { LISTENING_SESSIONS, PROFILES, ME_ID } from "../data/mock";

export function KaraokeRoom() {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  
  // Try to find a listening session matching the id, or fallback
  const session = LISTENING_SESSIONS.find(s => s.id === id) || LISTENING_SESSIONS[0] || {};
  
  // Use mock data
  const roomTitle = session.title || "Amapiano Sundays";
  const hostName = session.host?.displayName || "Host Name";
  
  // Safely get up to 4 singers
  const singers = Object.values(PROFILES).slice(0, 4);

  const [activeSingerIndex, setActiveSingerIndex] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(true);

  const lyrics = [
    "I see the sun rising over the dunes",
    "Golden hour in the city",
    "We are young, we are free",
    "Let the music take control",
    "Feel the beat in your soul",
    "Amapiano in the night",
    "Everything is gonna be alright"
  ];

  useEffect(() => {
    if (singers.length === 0) return;
    const singerInterval = setInterval(() => {
      setActiveSingerIndex((prev) => (prev + 1) % singers.length);
    }, 4000);
    return () => clearInterval(singerInterval);
  }, [singers.length]);

  useEffect(() => {
    if (lyrics.length === 0) return;
    const lyricInterval = setInterval(() => {
      setCurrentLyricIndex((prev) => (prev + 1) % lyrics.length);
    }, 3000);
    return () => clearInterval(lyricInterval);
  }, [lyrics.length]);

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#1C1814] via-[#0F0D0B] to-[#2E2822] text-[#F5F0EA] flex flex-col font-sans">
      {/* Background Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#C8521A] rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#2D7DD2] rounded-full mix-blend-screen filter blur-[128px] opacity-30 pointer-events-none"></div>

      {/* Header */}
      <div className="flex-none bg-black/20 backdrop-blur-md pt-12 pb-4 px-4 flex items-center justify-between z-10 border-b border-[#2E2822]">
        <button onClick={() => navigate(-1)} className="p-2 bg-[#2E2822] rounded-full text-[#F5F0EA]">
          <X size={20} />
        </button>
        <div className="text-center px-4 max-w-[200px]">
          <h1 className="font-display font-bold text-lg leading-tight truncate">{roomTitle}</h1>
          <p className="text-[#8A7F74] text-xs truncate">Host: {hostName}</p>
        </div>
        <div className="bg-[#1C1814] px-3 py-1.5 rounded-full flex items-center gap-2 border border-[#2E2822]">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          <Users size={14} className="text-[#8A7F74]" />
          <span className="text-xs font-semibold">{session.listenerCount || 142}</span>
        </div>
      </div>

      {/* Stage */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-8">
        <div className="grid grid-cols-2 gap-x-16 gap-y-12">
          {singers.map((singer, index) => {
            const isActive = index === activeSingerIndex;
            return (
              <div key={singer.id} className="relative flex flex-col items-center">
                <div className="relative w-28 h-28">
                  {isActive && (
                    <>
                      <div className="absolute inset-[-8px] rounded-full border-2 border-[#C8521A] opacity-50 animate-ping"></div>
                      <div className="absolute inset-[-12px] rounded-full border-2 border-dashed border-[#C8521A] opacity-40 animate-spin" style={{ animationDuration: '4s' }}></div>
                    </>
                  )}
                  <img
                    src={singer.avatarUrl}
                    alt={singer.displayName}
                    className="w-full h-full rounded-full object-cover border-4 border-[#1C1814] z-10 relative shadow-xl"
                  />
                  <div className="absolute bottom-0 right-0 bg-[#221D18] p-2 rounded-full border-2 border-[#1C1814] z-20 shadow-lg">
                    {isActive ? <Mic size={14} className="text-[#C8521A]" /> : <MicOff size={14} className="text-[#8A7F74]" />}
                  </div>
                </div>
                <span className="mt-4 text-sm font-semibold tracking-wide drop-shadow-md">{singer.displayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lyrics Engine */}
      <div 
        className="h-32 flex-none relative z-10 flex flex-col overflow-hidden px-8 mb-8" 
        style={{ 
          maskImage: 'linear-gradient(transparent, black 30%, black 70%, transparent)', 
          WebkitMaskImage: 'linear-gradient(transparent, black 30%, black 70%, transparent)' 
        }}
      >
        <div 
          className="flex flex-col w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(${44 - currentLyricIndex * 40}px)` }}
        >
          {lyrics.map((lyric, idx) => {
            const isCurrent = idx === currentLyricIndex;
            const distance = Math.abs(idx - currentLyricIndex);
            
            return (
              <div key={idx} className="h-[40px] flex items-center justify-center w-full">
                <p 
                  className={`text-center font-display text-lg sm:text-xl font-bold transition-all duration-300 w-full truncate ${
                    isCurrent 
                      ? "text-[#E8A055] scale-110 drop-shadow-[0_0_8px_rgba(232,160,85,0.4)]" 
                      : distance === 1 
                        ? "text-[#F5F0EA] opacity-60 scale-100" 
                        : "text-[#8A7F74] opacity-30 scale-90"
                  }`}
                >
                  {lyric}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Deck */}
      <div className="flex-none bg-[#1C1814]/80 backdrop-blur-xl border-t border-[#2E2822] pb-safe z-10">
        <div className="px-6 py-5 flex items-center justify-between">
          <button className="p-3.5 bg-[#221D18] rounded-full text-[#F5F0EA] hover:bg-[#2E2822] transition-colors">
            <Settings2 size={24} />
          </button>
          
          <button 
            onClick={() => setIsMicMuted(!isMicMuted)}
            className={`w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isMicMuted ? 'bg-[#2E2822] text-[#F5F0EA] border-2 border-[#1C1814]' : 'bg-[#C8521A] text-white shadow-[0_0_24px_rgba(200,82,26,0.5)] border-2 border-[#C8521A]'
            }`}
          >
            {isMicMuted ? <MicOff size={32} /> : <Mic size={32} />}
          </button>
          
          <div className="flex items-center gap-3">
            <button className="p-3.5 bg-[#221D18] rounded-full text-[#E8A055] hover:bg-[#2E2822] transition-colors">
              <Gift size={24} />
            </button>
            <button className="p-3.5 bg-[#221D18] rounded-full text-[#F5F0EA] relative hover:bg-[#2E2822] transition-colors">
              <MessageCircle size={24} />
              <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#C8521A] rounded-full border-2 border-[#221D18]"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
