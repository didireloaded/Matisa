// src/pages/ExploreEvents.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';

const events = [
  {
    id: '1',
    title: 'Windhoek Street Food Festival',
    location: 'Independence Ave',
    date: 'Sat, Aug 30',
    attendees: 156,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=200&fit=crop',
  },
  {
    id: '2',
    title: 'Afro-pop Jam Session',
    location: 'The Warehouse Theatre',
    date: 'Fri, Aug 29',
    attendees: 89,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=200&fit=crop',
  },
  {
    id: '3',
    title: 'Tech Startup Pitch Night',
    location: 'UNAM Campus',
    date: 'Thu, Sep 4',
    attendees: 45,
    image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=400&h=200&fit=crop',
  },
];

export default function ExploreEvents() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate('/explore')}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <h1 className="text-white font-bold text-lg">Events</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => navigate(`/event/${event.id}`)}
            className="w-full text-left"
          >
            <div className="relative h-40 rounded-2xl overflow-hidden mb-3">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-base">{event.title}</h3>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/40 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{event.attendees} going</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
