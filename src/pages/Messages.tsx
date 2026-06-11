import { Search, Plus, Loader2, MessageSquare, Mic } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useConversations } from '../hooks/useConversations';
import { Link } from 'react-router-dom';
import { NewChatModal } from '../components/chat/NewChatModal';

export function Messages() {
  const { conversations, isLoading } = useConversations();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground font-display">Messages</h1>
        <NewChatModal>
          <button className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors cursor-pointer">
            <Plus className="w-5 h-5" />
          </button>
        </NewChatModal>
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full bg-card border border-border rounded-full py-2 pl-10 pr-4 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <MessageSquare className="w-12 h-12 opacity-50 mb-2" />
            <p>No conversations yet.</p>
            <p className="text-sm">Start a chat with someone nearby!</p>
          </div>
        ) : (
          conversations.map((chat) => {
            const isGroup = chat.is_group;
            const title = isGroup ? (chat.name || 'Group Chat') : (chat.otherParticipants[0]?.full_name || chat.otherParticipants[0]?.username || 'Unknown User');
            const avatar = isGroup ? null : chat.otherParticipants[0]?.avatar_url;
            const lastMsg = chat.lastMessage?.content || (chat.lastMessage?.media_type === 'voice' ? 'Sent a voice note' : 'Start chatting!');
            const isVoice = chat.lastMessage?.media_type === 'voice';
            const timeStr = chat.updated_at ? new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <Link key={chat.id} to={`/messages/${chat.id}`} className="flex items-center px-4 py-3 hover:bg-card/50 transition-colors cursor-pointer active:bg-card">
                <Avatar className="w-14 h-14 border border-border shrink-0">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback>{title.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-foreground truncate">{title}</h3>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{timeStr}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground truncate">
                    {isVoice && <Mic className="w-4 h-4 mr-1 text-primary shrink-0" />}
                    <span className="truncate">{lastMsg}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
