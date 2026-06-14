import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/common/Avatar';
import { Heart, Flame, Smile, CheckCircle2 } from 'lucide-react';
import type { Profile } from '@/types';

interface Note {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  expires_at: string;
  likes_count: number;
  fire_count: number;
  laugh_count: number;
  profiles?: Profile;
}

// Mock data since we might not have notes in DB yet
const MOCK_NOTES: Note[] = [
  {
    id: '1',
    user_id: '123',
    content: "Windhoek is freezing today! 🥶",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    likes_count: 12,
    fire_count: 3,
    laugh_count: 5,
    profiles: {
      id: '123',
      username: 'hanna_dowie',
      display_name: 'Hanna D.',
      avatar_url: 'https://i.pravatar.cc/150?u=123',
      verified: true
    } as any
  },
  {
    id: '2',
    user_id: '456',
    content: "Just dropped a new track on Soundcloud 🔥",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    expires_at: new Date(Date.now() + 82800000).toISOString(),
    likes_count: 45,
    fire_count: 20,
    laugh_count: 0,
    profiles: {
      id: '456',
      username: 'dj_kboz',
      display_name: 'DJ Kboz',
      avatar_url: 'https://i.pravatar.cc/150?u=456',
      verified: true
    } as any
  },
  {
    id: '3',
    user_id: '789',
    content: "Need coffee ASAP. ☕",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    expires_at: new Date(Date.now() + 79200000).toISOString(),
    likes_count: 8,
    fire_count: 1,
    laugh_count: 12,
    profiles: {
      id: '789',
      username: 'michelle_v',
      display_name: 'Michelle',
      avatar_url: 'https://i.pravatar.cc/150?u=789',
      verified: false
    } as any
  }
];

function NoteCard({ note }: { note: Note }) {
  const [reacted, setReacted] = useState<string | null>(null);

  const handleReact = (type: string) => {
    setReacted(reacted === type ? null : type);
  };

  return (
    <div className="bg-[#151515] rounded-3xl p-5 border border-[#222222] break-inside-avoid mb-4 relative overflow-hidden group">
      {/* Subtle Background Glow if verified */}
      {note.profiles?.verified && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF9D2E] to-[#FF6B6B] opacity-50" />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={note.profiles?.avatar_url} size={40} fallback={note.profiles?.username.substring(0, 2)} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white text-sm leading-tight">{note.profiles?.display_name || note.profiles?.username}</span>
            {note.profiles?.verified && <CheckCircle2 size={12} className="text-[#FF9D2E] fill-[#FF9D2E]/20" />}
          </div>
          <span className="text-[#A0A0A0] text-[10px]">
            {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-white text-xl font-medium leading-snug mb-5 font-display tracking-tight">
        {note.content}
      </p>

      {/* Reactions Bar */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleReact('heart')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            reacted === 'heart' ? 'bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/30' : 'bg-[#0B0B0B] text-[#A0A0A0] hover:text-white border border-transparent'
          }`}
        >
          <Heart size={14} className={reacted === 'heart' ? 'fill-current' : ''} />
          <span>{note.likes_count + (reacted === 'heart' ? 1 : 0)}</span>
        </button>
        <button 
          onClick={() => handleReact('fire')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            reacted === 'fire' ? 'bg-[#FF9D2E]/20 text-[#FF9D2E] border border-[#FF9D2E]/30' : 'bg-[#0B0B0B] text-[#A0A0A0] hover:text-white border border-transparent'
          }`}
        >
          <Flame size={14} className={reacted === 'fire' ? 'fill-current' : ''} />
          <span>{note.fire_count + (reacted === 'fire' ? 1 : 0)}</span>
        </button>
        <button 
          onClick={() => handleReact('laugh')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            reacted === 'laugh' ? 'bg-[#2D7DD2]/20 text-[#2D7DD2] border border-[#2D7DD2]/30' : 'bg-[#0B0B0B] text-[#A0A0A0] hover:text-white border border-transparent'
          }`}
        >
          <Smile size={14} className={reacted === 'laugh' ? 'fill-current' : ''} />
          <span>{note.laugh_count + (reacted === 'laugh' ? 1 : 0)}</span>
        </button>
      </div>
    </div>
  );
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*, profiles(*)')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setNotes(data as any[]);
        } else {
          setNotes(MOCK_NOTES);
        }
      } catch (e) {
        console.warn("Failed to fetch notes, using mock data", e);
        setNotes(MOCK_NOTES);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100dvh-54px-60px)] bg-[#0B0B0B]">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-[#151515] bg-[#0B0B0B]/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white tracking-tight">Notes</h1>
        <div className="text-[10px] uppercase tracking-wider font-bold text-[#FF9D2E] bg-[#FF9D2E]/10 px-2.5 py-1 rounded-full">
          Disappears in 24h
        </div>
      </div>

      {/* Notes Feed - Masonry Layout */}
      <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF9D2E] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 gap-4">
            {notes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
