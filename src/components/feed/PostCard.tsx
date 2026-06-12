import { Heart, MessageCircle, Repeat2, Send, Bookmark, Mic } from 'lucide-react';
import { VoicePlayer } from './VoicePlayer';

interface PostCardProps {
  post: {
    id: string;
    author: {
      name: string;
      username: string;
      avatar: string;
    };
    type: 'text' | 'voice' | 'photo' | 'video' | 'poll' | 'location';
    content?: string;
    mediaUrl?: string;
    voiceDuration?: number;
    likes: number;
    comments: number;
    reposts: number;
    timeAgo: string;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="p-4 border-b border-border/50 bg-card">
      <div className="flex gap-3">
        <img 
          src={post.author.avatar} 
          alt={post.author.name} 
          className="w-10 h-10 rounded-full object-cover bg-secondary shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground truncate">{post.author.name}</span>
            <span className="text-sm text-muted-foreground truncate">@{post.author.username}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground whitespace-nowrap">{post.timeAgo}</span>
          </div>

          {post.type === 'text' && post.content && (
            <p className="text-foreground/90 whitespace-pre-wrap mb-3">{post.content}</p>
          )}

          {post.type === 'voice' && post.voiceDuration && (
            <div className="mb-3">
              <VoicePlayer duration={post.voiceDuration} />
            </div>
          )}

          {post.type === 'photo' && post.mediaUrl && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-border/50">
              <img src={post.mediaUrl} alt="Post content" className="w-full h-auto max-h-96 object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between mt-4 max-w-md">
            <button className="group flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
              <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">{post.likes}</span>
            </button>
            <button className="group flex items-center gap-1.5 text-muted-foreground hover:text-blue-500 transition-colors">
              <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">{post.comments}</span>
            </button>
            <button className="group flex items-center gap-1.5 text-muted-foreground hover:text-green-500 transition-colors">
              <div className="p-1.5 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Repeat2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">{post.reposts}</span>
            </button>
            <button className="group flex items-center gap-1.5 text-muted-foreground hover:text-purple-500 transition-colors">
              <div className="p-1.5 rounded-full group-hover:bg-purple-500/10 transition-colors">
                <Mic className="w-4 h-4" />
              </div>
            </button>
            <button className="group flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
              <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                <Bookmark className="w-4 h-4" />
              </div>
            </button>
            <button className="group flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
              <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                <Send className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
