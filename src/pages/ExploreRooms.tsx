// src/pages/ExploreRooms.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';

const rooms = [
  {
    id: '1',
    title: 'Namibian Hits & Afro-pop Jam',
    host: 'Gazzamusic',
    listeners: 142,
    isLive: true,
    type: 'karaoke',
  },
  {
    id: '2',
    title: 'Late Night R&B Acoustics',
    host: 'DJ Kboz',
    listeners: 89,
    isLive: true,
    type: 'karaoke',
  },
  {
    id: '3',
    title: 'Tech Talk: Building in Namibia',
    host: 'Silas Vibe',
    listeners: 34,
    isLive: true,
    type: 'voice',
  },
  {
    id: '4',
    title: 'Windhoek Creators Network',
    host: 'Hanna Dowie',
    listeners: 0,
    isLive: false,
    scheduled: 'Today, 8:00 PM',
    type: 'voice',
  },
];

export default function ExploreRooms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate('/explore')}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <h1 className="text-white font-bold text-lg">Live Rooms</h1>
        </div>
      </div>

      {/* Room List */}
      <div className="px-4 py-4 space-y-3">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => navigate(`/room/${room.id}`)}
            className="w-full text-left bg-[#111111] rounded-2xl border border-white/[0.06] p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {room.isLive ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                      <span className="text-red-400 text-[10px] font-bold tracking-wider">LIVE</span>
                    </div>
                  ) : (
                    <span className="text-white/30 text-[10px]">{room.scheduled}</span>
                  )}
                  {room.type === 'karaoke' && (
                    <span className="px-2 py-0.5 bg-purple-400/10 text-purple-400 text-[10px] rounded-full">Karaoke</span>
                  )}
                </div>
                <h3 className="text-white font-semibold text-sm">{room.title}</h3>
                <p className="text-white/40 text-xs mt-0.5">Hosted by {room.host}</p>
              </div>
              <div className="flex items-center gap-1 text-white/30">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs">{room.listeners}</span>
              </div>
            </div>
            {room.isLive && (
              <div className="mt-2 w-full py-2 bg-gradient-to-r from-[#00D9C0] to-[#00B4D8] rounded-full text-black text-xs font-semibold text-center">
                Join Room
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
