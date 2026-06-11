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
    const channel = sup
<truncated 8212 bytes>