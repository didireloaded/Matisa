import { User } from 'lucide-react';
import { motion } from 'framer-motion';

interface StoryBubbleProps {
  user: {
    name: string;
    avatarUrl?: string;
  };
  type: 'photo' | 'video' | 'voice' | 'mood';
  hasUnseenStory?: boolean;
}

export function StoryBubble({ user, type, hasUnseenStory = true }: StoryBubbleProps) {
  const getRingColor = () => {
    if (!hasUnseenStory) return 'border-muted';
    switch (type) {
      case 'photo': return 'border-[#C8521A]';
      case 'video': return 'border-[#2D7DD2]';
      case 'voice': return 'border-[#E8A055]';
      case 'mood': return 'border-[#4CAF7D]';
      default: return 'border-[#C8521A]';
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }} 
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer snap-center"
    >
      <div className={`p-[2px] rounded-full border-2 ${getRingColor()}`}>
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-background bg-[#1C1814] flex items-center justify-center">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#F5F0EA] font-semibold">{user.name.charAt(0)}</span>
          )}
        </div>
      </div>
      <span className="text-xs text-foreground font-medium truncate w-16 text-center">
        {(user?.name || '').split(' ')[0]}
      </span>
    </motion.div>
  );
}
