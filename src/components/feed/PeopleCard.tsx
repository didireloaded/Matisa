import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, MessageCircle, UserPlus, Hand, MapPin } from 'lucide-react';

export type CardSize = 'large' | 'medium' | 'small';

export interface Person {
  id: string;
  name: string;
  age: number;
  city: string;
  occupation: string;
  photoUrl: string;
  isVerified: boolean;
  mutualFriends: number;
  interests: string[];
  badges: string[]; // e.g., 'Creator', 'Musician'
  recentActivity?: string; // e.g., 'Recently Posted', 'Online'
}

interface PeopleCardProps {
  person: Person;
  size?: CardSize;
  onLongPress?: () => void;
  onClick?: () => void;
}

export function PeopleCard({ person, size = 'medium', onLongPress, onClick }: PeopleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Height mappings for masonry
  const heightClass = {
    large: 'h-[360px]',
    medium: 'h-[240px]',
    small: 'h-[160px]'
  }[size];

  // Touch handling for long press
  let timer: NodeJS.Timeout;
  const handleTouchStart = () => {
    timer = setTimeout(() => {
      onLongPress?.();
    }, 500); // 500ms long press
  };
  const handleTouchEnd = () => {
    clearTimeout(timer);
  };

  return (
    <div 
      className={`relative w-full rounded-[24px] overflow-hidden bg-card break-inside-avoid mb-4 group cursor-pointer ${heightClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
    >
      {/* Background Image */}
      <img 
        src={person.photoUrl} 
        alt={person.name}
        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
      {size === 'large' && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Top Badges / Metadata */}
      {size !== 'small' && (
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
          {person.recentActivity && (
            <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
              {person.recentActivity === 'Online' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
              {person.recentActivity}
            </span>
          )}
          {person.badges.length > 0 && (
            <span className="text-[10px] font-bold text-primary bg-primary/20 px-2 py-1 rounded-full backdrop-blur-sm border border-primary/30">
              {person.badges[0]}
            </span>
          )}
        </div>
      )}

      {/* Bottom Content Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col z-10 pointer-events-none">
        
        {/* Interest Tags (Only large/medium) */}
        {size !== 'small' && person.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {person.interests.slice(0, size === 'large' ? 3 : 2).map(tag => (
              <span key={tag} className="text-[9px] font-semibold text-white/90 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/5">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Name and Verification */}
        <div className="flex items-center gap-1.5">
          <h3 className={`font-bold text-white leading-tight ${size === 'large' ? 'text-2xl' : size === 'medium' ? 'text-lg' : 'text-base'}`}>
            {person.name}, {person.age}
          </h3>
          {person.isVerified && (
            <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-400/20" />
          )}
        </div>

        {/* Occupation and Location */}
        {size !== 'small' && (
          <div className="flex items-center gap-2 mt-0.5 text-white/70">
            <span className="text-xs truncate">{person.occupation}</span>
            {size === 'large' && (
              <>
                <span className="text-[10px]">•</span>
                <span className="text-xs flex items-center gap-0.5"><MapPin className="w-3 h-3" />{person.city}</span>
              </>
            )}
          </div>
        )}

        {/* Mutual Friends */}
        {size === 'large' && person.mutualFriends > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex -space-x-1.5">
              <div className="w-4 h-4 rounded-full bg-gray-500 border border-card" />
              <div className="w-4 h-4 rounded-full bg-gray-400 border border-card" />
            </div>
            <span className="text-[10px] text-white/60 font-medium">{person.mutualFriends} mutual friends</span>
          </div>
        )}

      </div>

      {/* Hover Quick Actions Overlay (Desktop / Hover states) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-sm pointer-events-auto"
          >
            <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg" onClick={(e) => { e.stopPropagation(); /* follow */ }}>
              <UserPlus className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-lg" onClick={(e) => { e.stopPropagation(); /* message */ }}>
              <MessageCircle className="w-5 h-5" />
            </button>
            {size === 'large' && (
              <button className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg backdrop-blur-md border border-white/20" onClick={(e) => { e.stopPropagation(); /* wave */ }}>
                <Hand className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
