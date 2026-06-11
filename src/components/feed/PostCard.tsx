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

          <div 
<truncated 2304 bytes>