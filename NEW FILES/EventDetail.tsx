// src/pages/EventDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Share2, Bookmark } from 'lucide-react';

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // TODO: Fetch real event data from Supabase using eventId
  const event = {
    title: 'Windhoek Street Food Festival',
    description: 'Join us for an evening of incredible street food from across Namibia. From kapana to vetkoek, experience the flavors that make our cuisine unique. Live music, local vendors, and great vibes.',
    location: 'Independence Ave, Windhoek',
    date: 'Sat, Aug 30',
    time: '6:00 PM - 11:00 PM',
    attendees: 156,
    interested: 324,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
    organizer: {
      name: 'Windhoek Events',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Cover Image */}
      <div className="relative h-56">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <Share2 className="w-4 h-4 text-white" />
          </button>
          <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-[#111111] rounded-2xl border border-white/[0.06] p-5">
          <h1 className="text-white text-xl font-bold mb-2">{event.title}</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-4">{event.description}</p>

          {/* Details */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-white/60">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span className="text-sm">{event.date}</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <Clock className="w-4 h-4 text-teal-400" />
              <span className="text-sm">{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span className="text-sm">{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <Users className="w-4 h-4 text-teal-400" />
              <span className="text-sm">{event.attendees} going · {event.interested} interested</span>
            </div>
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-3 py-4 border-t border-white/[0.06]">
            <img
              src={event.organizer.avatar}
              alt={event.organizer.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-white text-sm font-medium">Hosted by {event.organizer.name}</p>
              <p className="text-white/40 text-xs">Event Organizer</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button className="flex-1 py-3.5 bg-gradient-to-r from-[#00D9C0] to-[#00B4D8] rounded-full text-black font-semibold text-sm">
            Going
          </button>
          <button className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-full text-white font-semibold text-sm">
            Interested
          </button>
        </div>
      </div>
    </div>
  );
}
