import { Play, Mic, Users, Headphones, Disc3 } from 'lucide-react';

const mockKaraokeRooms = [
  { id: 1, host: 'Sarah Vibes', title: 'Friday Night Karaoke', singers: 3, capacity: 4, listeners: 58, bgImage: 'https://images.unsplash.com/photo-1516280440502-6c38221c54e6?w=400&q=80' },
  { id: 2, host: 'DJ Kboz', title: 'Amapiano Sessions', singers: 1, capacity: 2, listeners: 142, bgImage: 'https://images.unsplash.com/photo-1470229722913-7c092bce52f3?w=400&q=80' },
];

const topSongs = [
  { id: 1, title: 'Water', artist: 'Tyla', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&q=80' },
  { id: 2, title: 'Mnike', artist: 'Tyler ICU', cover: 'https://images.unsplash.com/photo-1614613535808-3196b08b5e28?w=200&q=80' },
  { id: 3, title: 'Soso', artist: 'Omah Lay', cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956062?w=200&q=80' },
];

export function Music() {
  return (
    <div className="flex flex-col min-h-screen bg-black pb-20 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-md px-4 py-3">
        <h1 className="text-2xl font-bold font-display">Music & Karaoke</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
        
        {/* Karaoke Rooms (Flagship Feature) */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Mic className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold font-display">Live Karaoke Rooms</h2>
          </div>
          
          <div className="space-y-4">
            {mockKaraokeRooms.map((room) => (
              <div key={room.id} className="relative rounded-2xl overflow-hidden h-40 group cursor-pointer active:scale-95 transition-transform">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                <img src={room.bgImage} className="absolute inset-0 w-full h-full ob
<truncated 2985 bytes>