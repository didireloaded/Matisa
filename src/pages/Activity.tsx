import { Heart, MessageCircle, UserPlus, Mic } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const mockActivities = [
  { id: 1, type: 'like', user: { name: 'Sarah', avatarUrl: 'https://i.pravatar.cc/150?u=sarah' }, target: 'your voice post', time: '5m' },
  { id: 2, type: 'follow', user: { name: 'DJ Kboz', avatarUrl: 'https://i.pravatar.cc/150?u=kboz' }, time: '2h' },
  { id: 3, type: 'comment', user: { name: 'Anna', avatarUrl: 'https://i.pravatar.cc/150?u=anna' }, target: 'your photo', content: 'This looks amazing! 🔥', time: '3h' },
  { id: 4, type: 'voice_reply', user: { name: 'Michael', avatarUrl: 'https://i.pravatar.cc/150?u=mike' }, target: 'your post', duration: '0:15', time: '5h' },
];

export function Activity() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-primary fill-primary" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-secondary" />;
      case 'voice_reply': return <Mic className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border">
        <h1 className="text-xl font-bold text-foreground font-display">Activity</h1>
      </div>

      <div className="flex-1 divide-y divide-border">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="p-4 flex items-start space-x-4 bg-background hover:bg-card/50 transition-colors">
            <div className="relative shrink-0">
              <Avatar className="w-12 h-12 border border-border">
                <AvatarImage src={activity.user.avatarUrl} />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
              <
<truncated 1800 bytes>