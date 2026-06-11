import { useState, useEffect } from 'react';
import { Mic, MicOff, Users, MessageSquare, Share2, Settings, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { generateLiveKitToken } from '../../lib/livekitToken';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
  TrackToggle,
} from '@livekit/components-react';
import { Track } from 'livekit-client';

interface Reaction {
  id: number;
  emoji: string;
  x: number;
}

export function KaraokeRoom() {
  const { user } = useAuthStore();
  const roomId = 'live-room-1'; // Mocked room ID for this demo
  const [token, setToken] = useState('');
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

  useEffect(() => {
    if (!user) return;
    generateLiveKitToken(roomId, user.user_metadata?.full_name || 'Anonymous', user.id)
      .then(setToken)
      .catch(console.error);
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
      serverUrl={serverUrl}
      // Use the default FastConnect
      connect={true}
      className="h-full w-full"
    >
      <KaraokeRoomInner roomId={roomId} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function KaraokeRoomInner({ roomId }: { roomId: string }) {
  const { user } = useAuthStore();
  const participants = useParticipants();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [listeners, setListeners] = useState(0);

  useEffect(() => {
    // Setup Supabase Realtime Channel for Reactions
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { ack: false },
        presence: { key: user?.id || 'anonymous' },
      },
    });

    channel
      .on('broadcast', { event: 'reaction' }, (payload) => {
        const newReaction = { id: Date.now(), emoji: payload.payload.emoji, x: Math.random() * 80 + 10 };
        setReactions(prev => [...prev, newReaction]);
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 2000);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        // Total listeners = Presence count + LiveKit participants approximation
        setListeners(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user?.id, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user]);

  const handleReact = async (emoji: string) => {
    // Optimistic UI update
    const newReaction = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);

    // Broadcast to others
    await supabase.channel(`room:${roomId}`).send({
      type: 'broadcast',
      event: 'reaction',
      payload: { emoji },
    });
  };

  // Up to 4 singers shown
  const singers = participants.filter(p => p.isMicrophoneEnabled).slice(0, 4);

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border z-10">
        <div>
          <h2 className="text-lg font-bold text-foreground">Friday Night Vibes 🎤</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {Math.max(listeners, participants.length)} listening</span>
            <span>·</span>
            <span className="text-red-500 font-medium animate-pulse">LIVE 08:45</span>
          </div>
        </div>
        <button className="p-2 bg-secondary/50 rounded-full hover:bg-secondary transition-colors">
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Main Stage */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 relative">
        <div className="grid grid-cols-2 gap-6 w-full max-w-sm mb-8">
          {/* Singer Slots (Max 4) */}
          {Array.from({ length: 4 }).map((_, idx) => {
            const singer = singers[idx];
            return (
              <div key={idx} className="flex flex-col items-center gap-2 relative">
                {singer ? (
                  <>
                    <div className={`relative rounded-full p-1 ${singer.isSpeaking ? 'bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'bg-transparent'}`}>
                      {/* LiveKit doesn't give avatar directly without metadata, so we use a placeholder based on identity or name */}
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${singer.identity}`} alt={singer.name} className="w-20 h-20 rounded-full object-cover border-4 border-background bg-card" />
                      {!singer.isMicrophoneEnabled && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border">
                          <MicOff className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground text-center line-clamp-1">{singer.name || 'Anonymous'}</span>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-secondary/20">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground text-center">Empty Slot</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Lyrics */}
        <div className="w-full max-w-md bg-secondary/30 rounded-2xl p-6 text-center backdrop-blur-sm border border-border/50">
          <p className="text-lg font-bold text-foreground mb-2 opacity-50 transition-opacity">And I'm gonna be high...</p>
          <p className="text-2xl font-black text-primary transition-all scale-105 shadow-sm">As a kite by then</p>
          <p className="text-lg font-bold text-foreground mt-2 opacity-50 transition-opacity">I miss the earth so much</p>
        </div>
      </div>

      {/* Floating Reactions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <AnimatePresence>
          {reactions.map(reaction => (
            <motion.div
              key={reaction.id}
              initial={{ y: '100%', opacity: 1, x: `${reaction.x}%` }}
              animate={{ y: '-20%', opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute bottom-20 text-4xl"
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Controls Footer */}
      <div className="p-4 bg-background/90 backdrop-blur-lg border-t border-border z-10 flex flex-col gap-3 pb-safe">
        {/* Interaction Bar */}
        <div className="flex items-center justify-between gap-2">
          <button 
            onClick={() => handleReact('🔥')}
            className="p-3 bg-secondary rounded-full hover:bg-secondary/80 transition-transform active:scale-90"
          >
            🔥
          </button>
          <button 
            onClick={() => handleReact('😍')}
            className="p-3 bg-secondary rounded-full hover:bg-secondary/80 transition-transform active:scale-90"
          >
            😍
          </button>
          <button 
            onClick={() => handleReact('👏')}
            className="p-3 bg-secondary rounded-full hover:bg-secondary/80 transition-transform active:scale-90"
          >
            👏
          </button>
          
          <div className="flex-1"></div>

          <button className="p-3 bg-secondary/50 rounded-full text-foreground hover:bg-secondary transition-colors">
            <Share2 className="w-5 h-5" />
          </button>

          <TrackToggle
            source={Track.Source.Microphone}
            className={`p-4 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center ${
              !isMicrophoneEnabled ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
            }`}
          >
            {!isMicrophoneEnabled ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </TrackToggle>
        </div>
        
        {/* Chat Input Placeholder */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Say something nice..." 
            className="w-full bg-secondary/50 text-foreground placeholder:text-muted-foreground rounded-full py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary/80 transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
