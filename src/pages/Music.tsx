import { useState } from 'react';
import { Mic2, Headphones, Play, Plus } from 'lucide-react';
import { KaraokeRoom } from '../components/karaoke/KaraokeRoom';

const MOCK_ROOMS = [
  { id: '1', name: 'Afrobeats Karaoke', listeners: 12, isLive: true, type: 'karaoke' },
  { id: '2', name: 'Amapiano Fridays', listeners: 45, isLive: true, type: 'listening' },
  { id: '3', name: 'Namibia Top 50', listeners: 120, isLive: true, type: 'listening' },
];

export function Music() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  if (activeRoom) {
    return <KaraokeRoom roomName={activeRoom} onLeave={() => setActiveRoom(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Music & Rooms</h1>
        <button className="text-foreground hover:text-primary transition-colors p-2 bg-secondary rounded-full">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        <section>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-primary" /> Karaoke Rooms
          </h2>
          <div className="grid gap-3">
            {MOCK_ROOMS.filter(r => r.type === 'karaoke').map(room => (
              <div key={room.id} className="bg-secondary/30 border border-border p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{room.name}</h3>
                  <p className="text-sm text-muted-foreground">{room.listeners} listening</p>
                </div>
                <button 
                  onClick={() => setActiveRoom(room.name)}
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 text-sm"
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-blue-500" /> Listening Parties
          </h2>
          <div className="grid gap-3">
            {MOCK_ROOMS.filter(r => r.type === 'listening').map(room => (
              <div key={room.id} className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{room.name}</h3>
                  <p className="text-sm text-muted-foreground">{room.listeners} listening</p>
                </div>
                <button 
                  onClick={() => setActiveRoom(room.name)}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 text-sm"
                >
                  Tune In
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
