import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

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
      case 'photo': return 'border-primary';
      case 'video': return 'border-secondary';
      case 'voice': return 'border-blue-500'; // Or whatever visual differentiation
      case 'mood': return 'border-purple-500';
      default: return 'border-primary';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer snap-center">
      <div className={`p-[2px] rounded-full border-2 ${getRingColor()}`}>
        <Avatar className="w-16 h-16 border-2 border-background">
          <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
          <AvatarFallback className="bg-card text-foreground">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <span className="text-xs text-foreground font-medium truncate w-16 text-center">
        {user.name.split(' ')[0]}
      </span>
    </div>
  );
}
