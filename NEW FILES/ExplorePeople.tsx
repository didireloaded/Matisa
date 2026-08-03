// src/pages/ExplorePeople.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, UserPlus } from 'lucide-react';

const people = [
  {
    id: '1',
    name: 'Hanna Dowie',
    username: 'hanna_d',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    location: 'Windhoek',
    distance: '2km away',
    mutualFriends: 3,
    bio: 'Creative director & storyteller',
  },
  {
    id: '2',
    name: 'Jason Mutonga',
    username: 'jason_w',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    location: 'Windhoek',
    distance: '5km away',
    mutualFriends: 1,
    bio: 'Photographer capturing Namibia's beauty',
  },
  {
    id: '3',
    name: 'Silas Vibe',
    username: 'silas_m',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    location: 'Swakopmund',
    distance: '350km away',
    mutualFriends: 0,
    bio: 'Tech enthusiast & AI builder',
  },
];

export default function ExplorePeople() {
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
          <h1 className="text-white font-bold text-lg">People Nearby</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {people.map((person) => (
          <button
            key={person.id}
            onClick={() => navigate(`/profile/${person.username}`)}
            className="w-full text-left bg-[#111111] rounded-2xl border border-white/[0.06] p-4"
          >
            <div className="flex items-start gap-3">
              <img
                src={person.avatar}
                alt={person.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{person.name}</p>
                    <p className="text-white/40 text-xs">@{person.username}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-white/50" />
                  </button>
                </div>
                <p className="text-white/50 text-xs mt-1">{person.bio}</p>
                <div className="flex items-center gap-3 mt-2 text-white/30 text-xs">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{person.location}</span>
                  </div>
                  <span>{person.distance}</span>
                  {person.mutualFriends > 0 && (
                    <span>{person.mutualFriends} mutual friends</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
