import { Heart, MessageCircle, UserPlus, Mic } from 'lucide-react';

const mockActivities = [
  {
    id: '1',
    user: { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    type: 'like',
    content: 'liked your voice post.',
    time: '2h',
  },
  {
    id: '2',
    user: { name: 'David', avatar: 'https://i.pravatar.cc/150?u=david' },
    type: 'voice_reply',
    content: 'replied to your story with a voice note.',
    time: '4h',
  },
  {
    id: '3',
    user: { name: 'Emma', avatar: 'https://i.pravatar.cc/150?u=emma' },
    type: 'follow',
    content: 'started following you.',
    time: '5h',
  },
  {
    id: '4',
    user: { name: 'John', avatar: 'https://i.pravatar.cc/150?u=john' },
    type: 'comment',
    content: 'commented: "This karaoke session was lit 🔥"',
    time: '1d',
  }
];

export function Activity() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-primary" fill="currentColor" />;
      case 'voice_reply': return <Mic className="w-4 h-4 text-purple-500" fill="currentColor" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-green-500" fill="currentColor" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-20 bg-background">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border">
        <h1 className="text-xl font-bold">Activity</h1>
      </div>

      <div className="flex border-b border-border/50 bg-background">
        <button className="flex-1 py-3 text-sm font-semibold border-b-2 border-primary text-foreground">
          All
        </button>
        <button className="flex-1 py-3 text-sm font-semibold border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">
          Mentions
        </button>
      </div>

      <div className="p-4 space-y-4">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-2">
            <div className="relative shrink-0">
              <img src={activity.user.avatar} className="w-12 h-12 rounded-full object-cover" alt="avatar" />
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border shadow-sm">
                {getIcon(activity.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm">
                <span className="font-bold text-foreground mr-1">{activity.user.name}</span>
                <span className="text-muted-foreground">{activity.content}</span>
              </p>
              <span className="text-xs text-muted-foreground mt-1 block">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
