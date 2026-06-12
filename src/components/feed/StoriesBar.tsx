import { Plus } from 'lucide-react';

interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  hasUnseen: boolean;
  isAdd?: boolean;
}

const mockStories: Story[] = [
  {
    id: 'add',
    user: { name: 'Your Story', avatar: 'https://i.pravatar.cc/150?u=current' },
    hasUnseen: false,
    isAdd: true,
  },
  {
    id: '1',
    user: { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    hasUnseen: true,
  },
  {
    id: '2',
    user: { name: 'David', avatar: 'https://i.pravatar.cc/150?u=david' },
    hasUnseen: true,
  },
];

export function StoriesBar() {
  return (
    <div className="w-full bg-card border-b border-border/50 py-3 overflow-x-auto no-scrollbar">
      <div className="flex gap-4 px-4 w-max">
        {mockStories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-1 w-16 cursor-pointer group">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full p-[2px] ${story.hasUnseen ? 'bg-gradient-to-tr from-primary to-purple-500' : 'bg-border'}`}>
                <div className="w-full h-full rounded-full border-2 border-card overflow-hidden">
                  <img 
                    src={story.user.avatar} 
                    alt={story.user.name} 
                    className="w-full h-full object-cover group-active:scale-95 transition-transform"
                  />
                </div>
              </div>
              {story.isAdd && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-card">
                  <Plus className="w-3 h-3" strokeWidth={3} />
                </div>
              )}
            </div>
            <span className="text-[11px] font-medium text-foreground/80 truncate w-full text-center">
              {story.user.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
