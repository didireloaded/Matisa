import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, Users, ArrowLeft, MessageSquare, Hand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
  TrackToggle,
} from "@livekit/components-react";
import { Track } from "livekit-client";

export function LiveRoom() {
  const { user } = useAuth();
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState("dev-token"); // Mock token for now
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL || "wss://fallback.livekit.cloud";

  if (!token) return null;

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      connect={true}
      className="h-[100dvh] w-full bg-background relative overflow-hidden text-foreground"
    >
      <LiveRoomInner roomId={roomId!} navigate={navigate} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function LiveRoomInner({ roomId, navigate }: { roomId: string; navigate: any }) {
  const participants = useParticipants();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);

  const handleReact = (emoji: string) => {
    const newReaction = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3000);
  };

  const speakers = participants.filter(
    (p) => p.isMicrophoneEnabled || p.identity.includes("speaker"),
  ); // Mock logic
  const listeners = participants.filter((p) => !speakers.includes(p));

  return (
    <div className="flex flex-col h-full relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text-white tracking-wide">Design Talk</h2>
          <span className="text-xs text-[var(--primary)] font-medium">Public Room</span>
        </div>
        <button className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors relative">
          <Users className="w-5 h-5 text-white/80" />
          <div className="absolute -top-1 -right-1 bg-[var(--primary)] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {participants.length || 1}
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {/* Stage / Speakers */}
        <div className="mb-8">
          <h3 className="text-sm text-white/50 font-bold mb-4 uppercase tracking-wider">
            Speakers
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {speakers.map((p) => (
              <div key={p.identity} className="flex flex-col items-center gap-2">
                <div
                  className={`relative w-20 h-20 rounded-full p-1 ${p.isSpeaking ? "bg-gradient-to-tr from-[var(--primary)] to-[#FF6B6B]" : "bg-white/10"}`}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.identity}`}
                    className="w-full h-full rounded-full bg-black/50"
                  />
                  {!p.isMicrophoneEnabled && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-background">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-white/90">{p.name || p.identity}</span>
              </div>
            ))}
            {speakers.length === 0 && (
              <div className="col-span-3 text-center py-8 text-white/40">No speakers yet.</div>
            )}
          </div>
        </div>

        {/* Listeners */}
        <div>
          <h3 className="text-sm text-white/50 font-bold mb-4 uppercase tracking-wider">
            Listening
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {listeners.map((p) => (
              <div key={p.identity} className="flex flex-col items-center gap-2">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.identity}`}
                  className="w-14 h-14 rounded-full bg-black/50 opacity-70"
                />
                <span className="text-xs font-medium text-white/60 truncate w-full text-center">
                  {p.name || p.identity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Reactions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <AnimatePresence>
          {reactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ y: "100vh", opacity: 1, x: `${reaction.x}vw`, scale: 0.5 }}
              animate={{ y: "-20vh", opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute bottom-0 text-5xl drop-shadow-lg"
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="flex items-center justify-between">
          <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20">
            <MessageSquare className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 bg-white/5 rounded-full p-1 border border-white/10">
            {["👏", "❤️", "😂", "🔥"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="w-10 h-10 flex items-center justify-center text-xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20">
              <Hand className="w-5 h-5" />
            </button>
            <TrackToggle
              source={Track.Source.Microphone}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 ${
                isMicrophoneEnabled ? "bg-[var(--primary)]" : "bg-red-500"
              }`}
            >
              {isMicrophoneEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </TrackToggle>
          </div>
        </div>
      </div>
    </div>
  );
}
