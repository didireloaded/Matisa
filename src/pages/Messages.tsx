import { Search, Plus, Mic } from 'lucide-react';

const mockChats = [
  {
    id: '1',
    user: { name: 'David', avatar: 'https://i.pravatar.cc/150?u=david' },
    lastMessage: 'Are we still on for the karaoke room later?',
    time: '2m',
    unread: 2,
    isVoice: false,
  },
  {
    id: '2',
    user: { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    lastMessage: 'Voice message',
    time: '1h',
    unread: 0,
    isVoice: true,
  },
  {
    id: '3',
    user: { name: 'The Band 🎸', avatar: 'https://i.pravatar.cc/150?u=band' },
    lastMessage: 'Emma: Just sent the new mix!',
    time: '5h',
    unread: 0,
    isVoice: false,
    isGroup: true,
  }
];

export function Messages() {
  return (
    <div className="flex flex-col min-h-full pb-20 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold">Messages</h1>
        <button className="p-2 bg-secondary/50 rounded-full hover:bg-secondary transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        {/* Search */}
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full bg-secondary/50 text-foreground placeholder:text-muted-foreground rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border/50"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>

        {/* Chat List */}
        <div className="space-y-1">
          {mockChats.map((chat) => (
            <div key={chat.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/30 transition-colors cursor-pointer group">
              <d
<truncated 1391 bytes>