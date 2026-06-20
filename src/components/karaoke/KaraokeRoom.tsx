import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Users,
  Share2,
  Settings,
  Plus,
  Loader2,
  ArrowLeft,
  Heart,
  Search,
  ListMusic,
  LogOut,
  Video,
  Trophy,
  Star,
} from "lucide-react";
import { Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GiftingModal, type GiftItem } from "@/components/common/GiftingModal";
import { useAuth } from "../../contexts/AuthContext";
import { KaraokeService } from "@/services/karaoke";
import type { UserProfile } from "@/types";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { useVoice } from "@/contexts/VoiceContext";
import { supabase } from "@/lib/supabase";
import { AnalyticsAI } from "@/services/ai/AnalyticsAI";

// MOCK: In a real app, this would use LiveKit logic. For this UI overhaul, we're building the aesthetic.
export function KaraokeRoom() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { joinRoom, leaveRoom, isMuted: isContextMuted, toggleMute } = useVoice();
  const [roomData, setRoomData] = useState<any>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isGiftingOpen, setIsGiftingOpen] = useState(false);
  const [floatingGifts, setFloatingGifts] = useState<{ id: string; gift: GiftItem }[]>([]);
  const [audience, setAudience] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);

  const handleSendGift = async (gift: GiftItem) => {
    if (!profile) return;
    const recipientId = roomData?.profiles?.id;
    if (!recipientId) return;

    try {
      const { data, error } = await supabase.rpc("send_gift", {
        p_sender_id: profile.id,
        p_receiver_id: recipientId,
        p_amount: gift.cost,
      });

      if (error) throw error;

      setWalletBalance((prev) => prev - gift.cost);
      AnalyticsAI.trackEvent(profile.id, "send_gift", recipientId, {
        amount: gift.cost,
        gift_name: gift.name,
      });

      // Add floating animation
      const id = Math.random().toString(36).substr(2, 9);
      setFloatingGifts((prev) => [...prev, { id, gift }]);
      setTimeout(() => {
        setFloatingGifts((prev) => prev.filter((g) => g.id !== id));
      }, 2000);
    } catch (err) {
      console.error("Failed to send gift:", err);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    async function loadRoom() {
      if (profile) {
        AnalyticsAI.trackEvent(profile.id, "join_room", roomId);

        const { data: walletData } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", profile.id)
          .single();
        if (walletData) setWalletBalance(walletData.balance);
      }

      const { data } = await supabase
        .from("voice_rooms")
        .select("*, profiles(*)")
        .eq("id", roomId)
        .single();

      if (data) {
        setRoomData(data);
        joinRoom(roomId as string, data.title);
      }

      // Load participants
      const { data: participantsData } = await supabase
        .from("karaoke_participants")
        .select("*, profiles(*)")
        .eq("room_id", roomId);

      if (participantsData) {
        setAudience(participantsData);
      }
    }
    loadRoom();
  }, [roomId, profile]);

  const handleLeave = () => {
    leaveRoom();
    navigate(-1);
  };

  const room = {
    performers: roomData?.profiles
      ? [roomData.profiles]
      : [{ id: "speaker", display_name: "Loading...", avatar_url: "" }],
    host: roomData?.profiles || { id: "host", display_name: "Loading...", avatar_url: "" },
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#0B0B0B] to-[#2a081a] opacity-80" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[400px] bg-[#8B5CF6]/20 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg leading-tight">
              {roomData?.title || "Creator Lounge"}
            </h1>
            <p className="text-[11px] font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" /> Live Now
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors">
            <Users size={18} />
          </button>
        </div>
      </div>

      {/* Main Stage */}
      <div className="relative z-10 flex-1 px-5 flex flex-col justify-center">
        {/* Performers (Central Area) */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <AnimatePresence>
            {room.performers.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`relative flex flex-col items-center ${i === 0 ? "z-20" : "z-10 -ml-12 opacity-80 scale-90"}`}
              >
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-primary)] shadow-[0_0_30px_rgba(255,157,46,0.3)]">
                    <Avatar size={128} profile={p} className="w-full h-full" />
                  </div>
                  {/* Singer indicator */}
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#FF416C] to-[#8E2DE2] rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                    <Mic className="w-5 h-5 text-white" />
                  </div>

                  {/* Floating Gifts Animation */}
                  <AnimatePresence>
                    {floatingGifts.map((fg) => {
                      const Icon = fg.gift.icon;
                      return (
                        <motion.div
                          key={fg.id}
                          initial={{ opacity: 0, y: 50, scale: 0.5 }}
                          animate={{ opacity: 1, y: -100, scale: 1.5 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`absolute top-0 left-1/2 -translate-x-1/2 ${fg.gift.color}`}
                        >
                          <Icon fill="currentColor" size={32} className="drop-shadow-lg" />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-white font-bold text-lg leading-tight truncate max-w-[150px]">
                    {p.display_name}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1 bg-white/10 rounded-full px-2 py-0.5 border border-white/10">
                    <Star size={10} className="text-yellow-400 fill-current" />
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                      Performer
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Audience Grid */}
        <div className="grid grid-cols-4 gap-4 max-w-[300px] mx-auto absolute bottom-24 w-full left-1/2 -translate-x-1/2">
          {audience.map((participant) => (
            <div key={participant.id} className="flex flex-col items-center gap-1.5">
              <Avatar
                size={48}
                profile={{
                  id: participant.profiles?.id || participant.user_id,
                  display_name:
                    participant.profiles?.display_name || participant.profiles?.username || "User",
                  avatar_url: participant.profiles?.avatar_url || "",
                }}
              />
              <span className="text-[10px] text-white/70 font-semibold truncate max-w-full">
                {participant.profiles?.display_name || participant.profiles?.username || "User"}
              </span>
            </div>
          ))}
          {audience.length === 0 && (
            <div className="col-span-4 text-center text-white/40 text-xs">No audience yet.</div>
          )}
        </div>
      </div>

      {/* Controls Container (Glassmorphism Bottom Panel) */}
      <div className="relative z-10 p-5 pb-safe bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-4 shadow-2xl">
          <button
            onClick={toggleMute}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${isContextMuted ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white"}`}
          >
            {isContextMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${isVideoOn ? "bg-[var(--color-primary)] text-white" : "bg-white/10 text-white"}`}
          >
            <Video size={20} />
          </button>

          <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
            <Share2 size={20} />
          </button>

          <button
            onClick={() => setIsGiftingOpen(true)}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:scale-105 transition-transform"
          >
            <Gift size={24} />
          </button>

          <button
            onClick={handleLeave}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          >
            <LogOut size={20} className="ml-1" />
          </button>
        </div>
      </div>

      <GiftingModal
        isOpen={isGiftingOpen}
        onClose={() => setIsGiftingOpen(false)}
        recipient={room.performers[0] || room.host}
        balance={walletBalance}
        onSendGift={handleSendGift}
      />
    </div>
  );
}

export default KaraokeRoom;
