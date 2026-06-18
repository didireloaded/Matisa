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
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { KaraokeService } from "@/services/karaoke";
import type { UserProfile } from "@/types";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/Button";

// MOCK: In a real app, this would use LiveKit logic. For this UI overhaul, we're building the aesthetic.
export function KaraokeRoom() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

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
            <h1 className="font-bold text-lg leading-tight">Creator Lounge</h1>
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
        {/* Active Speaker */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-[-10px] rounded-full border-2 border-[var(--color-primary)] opacity-50"
            />
            <Avatar
              size={120}
              profile={{
                id: "speaker",
                display_name: "Sarah Chen",
                avatar_url: "https://i.pravatar.cc/150?u=user_2",
              }}
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(139,92,246,0.5)]">
              Speaking
            </div>
          </div>
          <h2 className="mt-6 text-xl font-bold">Sarah Chen</h2>
          <p className="text-white/50 text-sm">Host</p>
        </div>

        {/* Audience Grid */}
        <div className="grid grid-cols-4 gap-4 max-w-[300px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Avatar
                size={48}
                profile={{
                  id: `${i}`,
                  display_name: `User ${i}`,
                  avatar_url: `https://i.pravatar.cc/150?u=${i}`,
                }}
              />
              <span className="text-[10px] text-white/70 font-semibold truncate max-w-full">
                User {i}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Container (Glassmorphism Bottom Panel) */}
      <div className="relative z-10 p-5 pb-safe bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-4 shadow-2xl">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${isMuted ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white"}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
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
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          >
            <LogOut size={20} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default KaraokeRoom;
