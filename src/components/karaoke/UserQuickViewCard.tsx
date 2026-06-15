import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, MessageCircle, Hand, Users, MapPin, BadgeCheck, X } from 'lucide-react';
import { Profile } from '../../types';

interface UserQuickViewCardProps {
  user: Profile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserQuickViewCard({ user, isOpen, onClose }: UserQuickViewCardProps) {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ y: '100%', scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: '100%', scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card border-t border-border p-6 shadow-2xl safe-bottom md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl md:w-full md:max-w-sm"
          >
            <div className="flex flex-col gap-5 relative">
              {/* Close Button (Desktop) / Handle (Mobile) */}
              <div className="hidden md:block absolute right-0 top-0">
                <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="md:hidden absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-border" />

              {/* Header: Avatar + Info */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt={user.display_name || user.username}
                    className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-md"
                  />
                  {user.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      <BadgeCheck className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 mt-1">
                  <h3 className="text-xl font-bold text-foreground">
                    {user.display_name || user.full_name || user.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                  
                  {user.ghost_mode !== 'hidden' && (user.city || user.distance) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.distance ? `${user.distance}km away` : user.city}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio & Note */}
              <div className="space-y-3">
                {user.bio && (
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {user.bio}
                  </p>
                )}
                {/* Mock Note Preview */}
                <div className="bg-secondary/40 rounded-2xl p-3 border border-border/50">
                  <p className="text-sm italic text-muted-foreground">
                    "Looking for people to shoot content with. 📸"
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-border">
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-secondary/30">
                  <span className="text-lg font-bold text-foreground">{user.follower_count || 128}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Followers</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-secondary/30">
                  <span className="text-lg font-bold text-foreground">{user.posts_count || 45}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Posts</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-secondary/30">
                  <span className="text-lg font-bold text-foreground">{12}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Mutuals</span>
                </div>
              </div>

              {/* Interests Tags */}
              {user.interests && user.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.interests.map(interest => (
                    <span key={interest} className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button className="flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary/25">
                  <UserPlus className="w-5 h-5" />
                  Follow
                </button>
                <button className="flex items-center justify-center gap-2 py-3.5 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-2xl transition-all active:scale-95">
                  <MessageCircle className="w-5 h-5" />
                  Message
                </button>
                <button className="col-span-2 flex items-center justify-center gap-2 py-3 bg-secondary/50 hover:bg-secondary/70 text-foreground font-semibold rounded-2xl transition-all active:scale-95 border border-border/50">
                  <Hand className="w-5 h-5" />
                  Wave
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
