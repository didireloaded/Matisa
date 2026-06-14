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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KaraokeService } from "../../services/karaoke";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
  TrackToggle,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useLongPress } from "../../hooks/useLongPress";
import { UserQuickViewCard } from "./UserQuickViewCard";
import { Profile } from "../../types";

interface Reaction {
  id: number;
  emoji: string;
  x: number;
}

export function KaraokeRoom() {
  const { profile, user } = useAuth();
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

  useEffect(() => {
    if (!user) return;
    // Mock token if no livekit set up for fast dev
    setToken("dev-token");
    // supabase.functions.invoke('livekit-token', {
    //   body: { roomName: roomId, participantName: user?.user_metadata?.full_name || profile?.display_name || 'Anonymous' }
    // })
    //   .then(({ data, error }) => {
    //     if (error) throw error;
    //     if (data?.token) setToken(data.token);
    //   })
    //   .catch(console.error);
  }, [user, roomId]);

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={serverUrl || "wss://fallback.livekit.cloud"}
      connect={true}
      className="h-[100dvh] w-full"
    >
      <KaraokeRoomInner roomId={roomId!} navigate={navigate} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function KaraokeRoomInner({ roomId, navigate }: { roomId: string; navigate: any }) {
  const { profile: user } = useAuth();
  const participants = useParticipants();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  // Read title from URL if passed
  const searchParams = new URLSearchParams(window.location.search);
  const roomTitle = searchParams.get("title") || "Windhoek Karaoke Night";

  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [listeners, setListeners] = useState(28); // Mock 28

  // Youtube state
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>("dQw4w9WgXcQ"); // Default to a song
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [inQueue, setInQueue] = useState(false);

  // Quick view state
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  useEffect(() => {
    const channel = KaraokeService.subscribeToRoom(
      roomId,
      user?.id || "anonymous",
      (emoji) => {
        const newReaction = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
        setReactions((prev) => [...prev, newReaction]);
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
        }, 3000);
      },
      (count) => setListeners(Math.max(28, count)),
    );

    return () => {
      KaraokeService.unsubscribe(channel);
    };
  }, [roomId, user]);

  const handleReact = async (emoji: string) => {
    const newReaction = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3000);

    // await KaraokeService.broadcastReaction(roomId, emoji);
  };

  // Mock participants to show layout up to 12
  const mockParticipants = Array.from({ length: 9 }).map((_, i) => ({
    identity: `user-${i}`,
    name: ["John", "Lisa", "Mike", "Sarah", "Alex", "Emma", "David", "Chloe", "Noah"][i],
    isSpeaking: i === 0, // 1 person speaking/singing
    isMicrophoneEnabled: i < 4,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  }));

  const allDisplayParticipants = mockParticipants; // in real: merge participants with mock if empty

  // Dynamic grid columns based on count
  const getGridCols = (count: number) => {
    if (count <= 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden text-foreground">
      {/* Top Bar matching reference */}
      <div className="flex items-center justify-between px-6 py-5 bg-transparent z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        <h2 className="text-lg font-medium text-white tracking-wide">room chat</h2>
        <button className="relative w-10 h-10 flex items-center justify-center text-white/80 hover:text-white">
          <div className="absolute top-1.5 right-1 w-4 h-4 bg-[#FF9D2E] rounded-full text-[9px] font-bold text-black flex items-center justify-center border-2 border-background z-10">
            2
          </div>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 no-scrollbar">
        {/* Participants Grid exactly matching reference (2 columns, tall cards with tight gaps) */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto">
          {allDisplayParticipants.map((p, idx) => (
            <ParticipantCard
              key={p.identity}
              participant={p}
              onLongPress={() => setSelectedUser(null)}
            />
          ))}
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

      {/* Bottom Controls matching reference */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-sm h-16 bg-[#F4F4F4] rounded-[32px] flex items-center justify-between px-6 shadow-2xl z-30">
        <div className="flex items-center gap-6">
          <button className="text-black/70 hover:text-black transition">
            <Video className="w-6 h-6" />
          </button>
          <button className="text-black/70 hover:text-black transition">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
          </button>
          <TrackToggle
            source={Track.Source.Microphone}
            className="text-black hover:scale-110 transition"
          >
            {!isMicrophoneEnabled ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </TrackToggle>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white"
          style={{ background: "linear-gradient(135deg, #FF9D2E, #FF6B6B)" }}
        >
          <MicOff className="w-5 h-5" />
        </button>
      </div>

      {/* Karaoke Queue Overlay */}
      <AnimatePresence>
        {isQueueOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6">
              <h3 className="text-2xl font-bold">Up Next</h3>
              <button
                onClick={() => setIsQueueOpen(false)}
                className="p-2 bg-white/10 rounded-full"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="text-xl font-bold text-white/50 w-6">1</div>
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=0"
                  className="w-12 h-12 rounded-full bg-black/50"
                />
                <div className="flex-1">
                  <h4 className="font-bold">John</h4>
                  <p className="text-sm text-white/60">Someone Like You - Adele</p>
                </div>
                <div className="px-3 py-1 bg-[var(--primary)] text-white text-xs font-bold rounded-full">
                  Singing
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="text-xl font-bold text-white/50 w-6">2</div>
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=1"
                  className="w-12 h-12 rounded-full bg-black/50"
                />
                <div className="flex-1">
                  <h4 className="font-bold">Lisa</h4>
                  <p className="text-sm text-white/60">Water - Tyla</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="text-xl font-bold text-white/50 w-6">3</div>
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=2"
                  className="w-12 h-12 rounded-full bg-black/50"
                />
                <div className="flex-1">
                  <h4 className="font-bold">Mike</h4>
                  <p className="text-sm text-white/60">Essence - Wizkid</p>
                </div>
              </div>

              {/* Search YouTube for Songs */}
              <div className="mt-8 mb-4 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search YouTube for karaoke..."
                  className="w-full bg-white/10 text-white placeholder:text-white/40 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div className="p-6 pb-safe">
              <button
                onClick={() => setInQueue(!inQueue)}
                className={`w-full py-4 rounded-full font-bold text-lg transition-colors ${
                  inQueue
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-[var(--primary)] text-white hover:bg-[#E8A055]"
                }`}
              >
                {inQueue ? "Leave Queue" : "Join Queue"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UserQuickViewCard
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}

function ParticipantCard({
  participant,
  onLongPress,
}: {
  participant: any;
  onLongPress: () => void;
}) {
  const handlers = useLongPress(
    () => {
      // Vibration feedback on long press if supported
      if (navigator.vibrate) navigator.vibrate(50);
      onLongPress();
    },
    undefined,
    { delay: 400 },
  );

  return (
    <div
      {...handlers}
      className="relative aspect-[3/4] rounded-3xl overflow-hidden group cursor-pointer bg-[#2A241D]"
    >
      <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />

      {/* Icon in top left matching reference */}
      <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80">
        {participant.isMicrophoneEnabled ? (
          <div className="flex items-center gap-0.5 h-3">
            <div className="w-0.5 h-full bg-white animate-[pulse_1s_ease-in-out_infinite]" />
            <div className="w-0.5 h-1/2 bg-white animate-[pulse_1.2s_ease-in-out_infinite_0.2s]" />
            <div className="w-0.5 h-3/4 bg-white animate-[pulse_0.8s_ease-in-out_infinite_0.4s]" />
          </div>
        ) : (
          <MicOff className="w-4 h-4" />
        )}
      </div>
    </div>
  );
}
