// src/pages/Inbox.tsx
import { useNavigate } from 'react-router-dom';
import { Search, MoreHorizontal } from 'lucide-react';

const conversations = [
  {
    id: '1',
    name: 'Hanna Dowie',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    lastMessage: 'Hey! Want to collab on the next event?',
    time: '2m',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Jason Mutonga',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    lastMessage: 'The voice room was fire last night 🔥',
    time: '1h',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Windhoek Creators',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop',
    lastMessage: 'Silas: Anyone free this weekend?',
    time: '3h',
    unread: 5,
    online: true,
    isGroup: true,
  },
];

export default function Inbox() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-white font-bold text-lg">Messages</h1>
          <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <MoreHorizontal className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-full border border-white/[0.06]">
          <Search className="w-4 h-4 text-white/30" />
          <span className="text-white/30 text-sm">Search messages...</span>
        </div>
      </div>

      {/* Conversations */}
      <div className="px-4">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => navigate(`/chat/${conv.id}`)}
            className="w-full flex items-center gap-3 py-3 border-b border-white/[0.04] text-left"
          >
            <div className="relative">
              <img
                src={conv.avatar}
                alt={conv.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {conv.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-white font-medium text-sm truncate">{conv.name}</p>
                <span className="text-white/30 text-xs">{conv.time}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-white/40 text-sm truncate">{conv.lastMessage}</p>
                {conv.unread > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-teal-400 text-black text-xs font-bold rounded-full">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
