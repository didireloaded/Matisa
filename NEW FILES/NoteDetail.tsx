// src/pages/NoteDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, MapPin, Clock } from 'lucide-react';

export default function NoteDetail() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  // TODO: Fetch real note data from Supabase using noteId
  const note = {
    author: {
      name: 'Maria Theodore',
      username: 'maria_theodore',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    },
    content: 'Short scenes, deep emotions—each note carries a piece of something special under the Namibian sky. The sunsets here hit different when you're sharing stories with people who actually get it.',
    location: 'Windhoek',
    timeAgo: '2h ago',
    likes: 234,
    replies: 18,
    shares: 12,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <span className="text-white font-semibold text-sm">Note</span>
        </div>
      </div>

      {/* Note Content */}
      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={note.author.avatar}
            alt={note.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-white font-semibold text-sm">{note.author.name}</p>
            <p className="text-white/40 text-xs">@{note.author.username}</p>
          </div>
          <button className="ml-auto px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white text-xs font-medium">
            Follow
          </button>
        </div>

        {/* Content Card */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: note.gradient }}
        >
          <p className="text-white text-base leading-relaxed">{note.content}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-white/40 text-xs mb-6">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{note.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{note.timeAgo}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 py-4 border-t border-white/[0.06]">
          <button className="flex items-center gap-2 text-white/50">
            <Heart className="w-5 h-5" />
            <span className="text-sm">{note.likes}</span>
          </button>
          <button className="flex items-center gap-2 text-white/50">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{note.replies}</span>
          </button>
          <button className="flex items-center gap-2 text-white/50">
            <Share2 className="w-5 h-5" />
            <span className="text-sm">{note.shares}</span>
          </button>
          <button className="ml-auto text-white/50">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Replies Section */}
        <div className="mt-6">
          <h3 className="text-white font-semibold text-sm mb-4">Replies</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                <div className="flex-1">
                  <div className="bg-white/[0.03] rounded-2xl rounded-tl-sm px-4 py-3">
                    <p className="text-white/80 text-sm">This really resonates with me. The Namibian sky has a way of making everything feel possible.</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-1">
                    <span className="text-white/30 text-xs">2h ago</span>
                    <button className="text-white/30 text-xs">Reply</button>
                    <button className="text-white/30 text-xs">Like</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
