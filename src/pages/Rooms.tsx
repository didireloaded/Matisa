import { useState, useEffect } from "react";
import { Mic, Radio, Music2, Users, Plus, Play, Sparkles, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/common/Avatar";
import { toast } from "sonner";
import { USERS } from "@/data/dummy";

export function Rooms() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"karaoke" | "voice">("karaoke");
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRooms() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("voice_rooms")
          .select("*, profiles(*)")
          .order("created_at", { ascending: false });
        setRooms(data || []);
      } catch (err) {
        console.error("Failed to load rooms", err);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, []);

  const karaokeRooms = [
    {
      id: "karaoke-1",
      title: "Namibian Hits & Afro-pop Jam",
      song: "Kapana Vibes - Gazzam & Friends",
      singer: USERS[0],
      listeners: 142,
      queueCount: 4,
      isLive: true,
    },
    {
      id: "karaoke-2",
      title: "Late Night R&B Acoustics",
      song: "Midnight Sunset",
      singer: USERS[1],
      listeners: 89,
      queueCount: 2,
      isLive: true,
    },
  ];

  const voiceRooms =
    rooms.length > 0
      ? rooms
      : [
          {
            id: "voice-1",
            title: "Creators & Artists Chill Lounge",
            topic: "Music Production & Visual Arts",
            profiles: USERS[2],
            participant_count: 56,
            isLive: true,
          },
          {
            id: "voice-2",
            title: "Windhoek Weekly Tech Meetup",
            topic: "AI Apps & Product Design",
            profiles: USERS[3],
            participant_count: 38,
            isLive: true,
          },
        ];

  return (
    <div className="flex flex-col min-h-full pb-28 pt-2">
      {/* Top Header Row */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Audio Rooms & Stage</h1>
          <p className="text-xs text-white/50 mt-0.5">
            Join live voice sessions and karaoke stages
          </p>
        </div>
        <button
          onClick={() => toast.info("Create Voice Room modal open")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-tr from-[#FF9D2E] to-[#24A3C7] text-black font-bold text-xs shadow-lg active:scale-95 transition"
        >
          <Plus size={15} strokeWidth={3} />
          <span>Host Room</span>
        </button>
      </div>

      {/* Segmented Tabs: Karaoke vs Voice */}
      <div className="px-5 mb-5">
        <div className="flex rounded-full glass-panel p-1 border border-white/10">
          <button
            onClick={() => setActiveTab("karaoke")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition ${
              activeTab === "karaoke"
                ? "bg-gradient-to-r from-[#FF9D2E] to-[#24A3C7] text-black shadow-md"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Music2 size={15} />
            <span>Karaoke Stage</span>
          </button>

          <button
            onClick={() => setActiveTab("voice")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition ${
              activeTab === "voice"
                ? "bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-white shadow-md"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Radio size={15} />
            <span>Voice Rooms</span>
          </button>
        </div>
      </div>

      {/* Rooms Content */}
      <div className="px-5 flex-1 space-y-4">
        {activeTab === "karaoke" ? (
          /* Karaoke Rooms */
          <div className="space-y-4">
            {karaokeRooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/karaoke/${room.id}`)}
                className="relative overflow-hidden rounded-[24px] glass-panel-elevated p-5 cursor-pointer group hover:border-[#FF9D2E]/50 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9D2E]/15 border border-[#FF9D2E]/40 text-[#FF9D2E] text-[10px] font-bold uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-[#FF9D2E] animate-ping" />
                    KARAOKE LIVE
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <Users size={14} className="text-white/40" />
                    <span>{room.listeners} listening</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#FF9D2E] transition">
                  {room.title}
                </h3>

                <div className="mt-3 flex items-center gap-3 bg-white/[0.04] p-3 rounded-2xl border border-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF9D2E]/20 text-[#FF9D2E]">
                    <Music2 size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{room.song}</p>
                    <p className="text-[11px] text-white/50 truncate">
                      Singing: {room.singer.name}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#35C67A] bg-[#35C67A]/15 px-2.5 py-1 rounded-full border border-[#35C67A]/30">
                    {room.queueCount} in queue
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Voice Rooms */
          <div className="space-y-4">
            {voiceRooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/rooms/${room.id}`)}
                className="relative overflow-hidden rounded-[24px] glass-panel p-5 cursor-pointer group hover:border-[#24A3C7]/50 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#24A3C7]/15 border border-[#24A3C7]/40 text-[#39B7F2] text-[10px] font-bold uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-[#24A3C7] animate-ping" />
                    VOICE ROOM
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <Users size={14} className="text-white/40" />
                    <span>{room.participant_count || 42} inside</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#39B7F2] transition">
                  {room.title}
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  {room.topic || "Open community dialogue"}
                </p>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Avatar
                      size={28}
                      profile={{
                        id: room.profiles?.id || "host",
                        display_name: room.profiles?.display_name || room.profiles?.name || "Host",
                        avatar_url: room.profiles?.avatar_url || room.profiles?.avatar || "",
                      }}
                    />
                    <span className="text-xs text-white/70">
                      Host: {room.profiles?.display_name || room.profiles?.name || "Member"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-black bg-gradient-to-r from-[#FF9D2E] to-[#24A3C7] px-3.5 py-1.5 rounded-full shadow-md">
                    Join Room
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Rooms;
