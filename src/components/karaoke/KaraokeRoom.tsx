import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Users, Share2, Settings, Plus, Loader2, ArrowLeft, Heart, Search, ListMusic, LogOut, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { KaraokeService } from '../../services/karaoke';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
  TrackToggle,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useLongPress } from '../../hooks/useLongPress';
import { UserQuickViewCard } from './UserQuickViewCard';
import { Profile } from '../../types';

interface Reaction {
  id: number;
  emoji: string;
  x: number;
}

export function KaraokeRoom() {
  const { profile, user } = useAuth();
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

  useEffect(() => {
    if (!user) return;
    // Mock token if no livekit set up for fast dev
    setToken('dev-token');
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
      serverUrl={serverUrl || 'wss://fallback.livekit.cloud'}
      connect={true}
      className="h-[100dvh] w-full"
    >
      <KaraokeRoomInner roomId={roomId!} navigate={navigate} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function KaraokeRoomInner({ roomId, navigate }: { roomId: string, navigate: any }) {
  const { profile: user } = useAuth();
  const participants = useParticipants();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  
  // Read title from URL if passed
  const searchParams = new URLSearchParams(window.location.search);
  const roomTitle = searchParams.get('title') || 'Windhoek Karaoke Night';

  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [listeners, setListeners] = useState(28); // Mock 28
  
  // Youtube state
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>('dQw4w9WgXcQ'); // Default to a song
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [inQueue, setInQueue] = useState(false);

  // Quick view state
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  useEffect(() => {
    const channel = KaraokeService.subscribeToRoom(
      roomId,
      user?.id || 'anonymous',
      (emoji) => {
        const newReaction = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
        setReactions(prev => [...prev, newReaction]);
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 3000);
      },
      (count) => setListeners(Math.max(28, count))
    );

    return () => {
      KaraokeService.unsubscribe(channel);
    };
  }, [roomId, user]);

  const handleReact = async (emoji: string) => {
    const newReaction = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3000);

    // await KaraokeService.broadcastReaction(roomId, emoji);
  };

  // Mock participants to show layout up to 12
  const mockParticipants = Array.from({ length: 9 }).map((_, i) => ({
    identity: `user-${i}`,
    name: ['John', 'Lisa', 'Mike', 'Sarah', 'Alex', 'Emma', 'David', 'Chloe', 'Noah'][i],
    isSpeaking: i === 0, // 1 person speaking/singing
    isMicrophoneEnabled: i < 4,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  }));

  const allDisplayParticipants = mockParticipants; // in real: merge participants with mock if empty

  // Dynamic grid columns based on count
  const getGridCols = (count: number) => {
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0D0B] relative overflow-hidden text-[#F5F0EA]">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-transparent z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white truncate max-w-[200px]">{roomTitle}</h2>
            <div className="flex items-center gap-2 text-xs text-white/70 mt-0.5">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {listeners} People</span>
            </div>
          </div>
        </div>
        <button className="p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors">
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center relative overflow-y-auto px-4 pb-32">
        
        {/* YouTube Embed Area */}
        <div className="w-full max-w-md aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-6 relative border border-white/10">
           <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&controls=0&modestbranding=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 pointer-events-none" // Disable pointer events so it's view-only
            ></iframe>
            {/* Overlay to prevent interactions with iframe */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0B] via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white/80 uppercase tracking-widest flex items-center gap-1">
              <Video className="w-3 h-3 text-[#C8521A]" /> Playing
            </div>
        </div>

        {/* Participants Grid */}
        <div className={`grid ${getGridCols(allDisplayParticipants.length)} gap-4 w-full max-w-md mb-8 transition-all duration-500`}>
          {allDisplayParticipants.map((p, idx) => (
            <ParticipantCard 
              key={p.identity} 
              participant={p} 
              onLongPress={() => setSelectedUser({ 
                id: p.identity, 
                username: p.name.toLowerCase(), 
                display_name: p.name, 
                avatar_url: p.avatar, 
                ghost_mode: 'approximate', 
                following_count: 100,
                followers_count: 240,
                posts_count: 12,
                bio: 'Love singing Afrobeats and R&B 🎤✨',
                interests: ['Music', 'Fashion', 'Travel'],
                is_verified: idx === 0,
                city: 'Windhoek'
              } as Profile)} 
            />
          ))}
        </div>

      </div>

      {/* Floating Reactions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <AnimatePresence>
          {reactions.map(reaction => (
            <motion.div
              key={reaction.id}
              initial={{ y: '100vh', opacity: 1, x: `${reaction.x}vw`, scale: 0.5 }}
              animate={{ y: '-20vh', opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: 'easeOut' }}
              className="absolute bottom-0 text-5xl drop-shadow-lg"
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0F0D0B] via-[#0F0D0B]/90 to-transparent pt-12 pb-safe z-30">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto w-full">
          {/* Reaction Buttons */}
          <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-xl rounded-full p-1.5 border border-white/10">
            {['🔥', '👏', '❤️', '😂'].map(emoji => (
              <button 
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="w-10 h-10 flex items-center justify-center text-xl rounded-full hover:bg-white/10 transition-transform active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsQueueOpen(true)}
              className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white transition-all active:scale-95 border border-white/10 relative"
            >
              <ListMusic className="w-5 h-5" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#C8521A] rounded-full border-2 border-[#0F0D0B] text-[8px] font-bold flex items-center justify-center">3</div>
            </button>

            <TrackToggle
              source={Track.Source.Microphone}
              className={`w-14 h-14 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center ${
                !isMicrophoneEnabled ? 'bg-white/10 text-white border border-white/10' : 'bg-[#C8521A] text-white shadow-[0_0_20px_rgba(200,82,26,0.5)]'
              }`}
            >
              {!isMicrophoneEnabled ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </TrackToggle>
          </div>
        </div>
      </div>

      {/* Karaoke Queue Overlay */}
      <AnimatePresence>
        {isQueueOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-0 z-40 bg-[#0F0D0B]/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6">
              <h3 className="text-2xl font-bold">Up Next</h3>
              <button onClick={() => setIsQueueOpen(false)} className="p-2 bg-white/10 rounded-full">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="text-xl font-bold text-white/50 w-6">1</div>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=0" className="w-12 h-12 rounded-full bg-black/50" />
                <div className="flex-1">
                  <h4 className="font-bold">John</h4>
                  <p className="text-sm text-white/60">Someone Like You - Adele</p>
                </div>
                <div className="px-3 py-1 bg-[#C8521A] text-white text-xs font-bold rounded-full">Singing</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="text-xl font-bold text-white/50 w-6">2</div>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" className="w-12 h-12 rounded-full bg-black/50" />
                <div className="flex-1">
                  <h4 className="font-bold">Lisa</h4>
                  <p className="text-sm text-white/60">Water - Tyla</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="text-xl font-bold text-white/50 w-6">3</div>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=2" className="w-12 h-12 rounded-full bg-black/50" />
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
                  className="w-full bg-white/10 text-white placeholder:text-white/40 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#C8521A]"
                />
              </div>

            </div>

            <div className="p-6 pb-safe">
              <button 
                onClick={() => setInQueue(!inQueue)}
                className={`w-full py-4 rounded-full font-bold text-lg transition-colors ${
                  inQueue ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#C8521A] text-white hover:bg-[#E8A055]'
                }`}
              >
                {inQueue ? 'Leave Queue' : 'Join Queue'}
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

function ParticipantCard({ participant, onLongPress }: { participant: any, onLongPress: () => void }) {
  const handlers = useLongPress(() => {
    // Vibration feedback on long press if supported
    if (navigator.vibrate) navigator.vibrate(50);
    onLongPress();
  }, undefined, { delay: 400 });

  return (
    <div 
      {...handlers}
      className="flex flex-col items-center gap-2 relative group cursor-pointer"
    >
      <div className="relative">
        <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full transition-all duration-300 ${
          participant.isSpeaking 
            ? 'shadow-[0_0_30px_rgba(200,82,26,0.6)] scale-105' 
            : 'scale-100'
        }`}>
          {/* Animated speaking ring */}
          {participant.isSpeaking && (
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-[#C8521A]"
            />
          )}
          <img 
            src={participant.avatar} 
            alt={participant.name} 
            className={`w-full h-full rounded-full object-cover border-[3px] bg-[#1A1612] transition-colors duration-300 ${
              participant.isSpeaking ? 'border-[#C8521A]' : 'border-[#2A241D]'
            }`}
          />
          {!participant.isMicrophoneEnabled && (
            <div className="absolute -bottom-1 -right-1 bg-[#2A241D] rounded-full p-1.5 border border-[#0F0D0B] shadow-md">
              <MicOff className="w-3.5 h-3.5 text-white/50" />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-sm font-bold text-white/90 truncate max-w-[80px] drop-shadow-md">
          {participant.name}
        </span>
        {participant.isSpeaking && (
          <span className="text-[9px] uppercase tracking-widest text-[#C8521A] font-bold mt-0.5">
            Singing
          </span>
        )}
      </div>
    </div>
  );
}
