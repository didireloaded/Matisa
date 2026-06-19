import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/common/Avatar";
import { useVoice } from "@/contexts/VoiceContext";

interface VoiceRoom {
  id: string;
  title: string;
  created_by: string;
  profiles: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
}

export function LiveRoomsBanner() {
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const navigate = useNavigate();
  const { activeRoomId } = useVoice();

  useEffect(() => {
    async function fetchRooms() {
      const { data, error } = await supabase
        .from("voice_rooms")
        .select("*, profiles(*)")
        .eq("status", "active")
        .eq("is_private", false)
        .order("started_at", { ascending: false });
        
      if (!error && data) {
        setRooms(data as VoiceRoom[]);
      }
    }
    
    fetchRooms();
    
    const channel = supabase
      .channel("public:voice_rooms")
      .on("postgres_changes", { event: "*", schema: "public", table: "voice_rooms" }, () => {
        fetchRooms();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (rooms.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Voice Rooms</h3>
      </div>
      
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {rooms.map((room) => {
          const isActive = activeRoomId === room.id;
          return (
            <motion.div
              key={room.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/room/${room.id}`)}
              className={`flex-shrink-0 w-[240px] p-3 rounded-2xl border cursor-pointer transition-colors ${
                isActive 
                  ? "bg-[#00E5FF]/10 border-[#00E5FF]/30" 
                  : "bg-[#151515] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <Avatar profile={room.profiles} size={36} />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-tr from-[#FF416C] to-[#8E2DE2] rounded-full flex items-center justify-center border border-black">
                    <Mic size={8} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{room.title}</h4>
                  <p className="text-[10px] text-white/50 truncate">by {room.profiles?.display_name || "Anonymous"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold">
                  <Users size={12} />
                  <span>Join Room</span>
                </div>
                {isActive && (
                  <span className="text-[9px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full">
                    LISTENING
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
