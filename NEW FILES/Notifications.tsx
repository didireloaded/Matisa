// src/pages/Notifications.tsx
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Radio, Calendar, AtSign } from 'lucide-react';

const notifications = [
  {
    id: '1',
    type: 'like',
    icon: Heart,
    iconColor: 'text-red-400',
    bgColor: 'bg-red-400/10',
    text: 'Hanna Dowie liked your note',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'reply',
    icon: MessageCircle,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    text: 'Jason Mutonga replied to your note',
    time: '15m ago',
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    icon: UserPlus,
    iconColor: 'text-green-400',
    bgColor: 'bg-green-400/10',
    text: 'Silas Vibe started following you',
    time: '1h ago',
    read: true,
  },
  {
    id: '4',
    type: 'room',
    icon: Radio,
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    text: 'Afro-pop Jam Session is now live',
    time: '2h ago',
    read: true,
  },
  {
    id: '5',
    type: 'event',
    icon: Calendar,
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    text: 'Windhoek Street Food Festival starts in 1 hour',
    time: '3h ago',
    read: true,
  },
  {
    id: '6',
    type: 'mention',
    icon: AtSign,
    iconColor: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
    text: 'Maria Theodore mentioned you in a note',
    time: '5h ago',
    read: true,
  },
];

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-white font-bold text-lg">Activity</h1>
          <button className="text-teal-400 text-sm font-medium">Mark all read</button>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-4">
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <button
              key={notif.id}
              className={`w-full flex items-start gap-3 py-4 border-b border-white/[0.04] text-left ${
                !notif.read ? 'bg-white/[0.02]' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full ${notif.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${notif.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm leading-relaxed">{notif.text}</p>
                <p className="text-white/30 text-xs mt-1">{notif.time}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state fallback */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
            <Heart className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/60 text-sm font-medium">No notifications yet</p>
          <p className="text-white/30 text-xs mt-1 text-center">
            When people interact with your content, you'll see it here
          </p>
        </div>
      )}
    </div>
  );
}
