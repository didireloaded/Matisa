import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { VoicePost } from './VoicePost';

interface PostCardProps {
  post: {
    id: string;
    user: {
      name: string;
      username: string;
      avatarUrl?: string;
    };
    location?: string;
    timePosted: string;
    content?: string;
    mediaUrl?: string;
    type: 'text' | 'photo' | 'video' | 'voice';
    voiceDuration?: string;
    likes: number;
    comments: number;
    shares: number;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="border-b border-border bg-background pb-4 pt-4 first:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={post.user.avatarUrl} className="object-cover" />
            <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-foreground text-sm">{post.user.name}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground space-x-1">
              <span>@{post.user.username}</span>
              <span>•</span>
              <span>{post.timePosted}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <span>{post.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4">
        {post.content && (\
<truncated 2000 bytes>