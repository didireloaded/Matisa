import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { AudioPlayer } from './AudioPlayer';
import { CommentsModal } from '../feed/CommentsModal';

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
    voiceUrl?: string;
    likes: number;
    comments: number;
    shares: number;
  };
}

export function PostCard({ post }: PostCardProps) {
  const [localCommentCount, setLocalCommentCount] = useState(post.comments);

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
        {post.content && (
          <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">{post.content}</p>
        )}
        
        {post.type === 'photo' && post.mediaUrl && (
          <div className="rounded-xl overflow-hidden mb-3 border border-border">
            <img src={post.mediaUrl} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
          </div>
        )}

        {post.type === 'voice' && post.voiceUrl && (
          <div className="mb-3">
            <AudioPlayer url={post.voiceUrl} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 flex items-center justify-between mt-2">
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-1.5 text-muted-foreground hover:text-primary transition-colors group">
            <div className="p-2 -ml-2 rounded-full group-hover:bg-primary/10 transition-colors">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{post.likes}</span>
          </button>
          
          <CommentsModal postId={post.id} onCommentCountChange={(delta) => setLocalCommentCount(prev => prev + delta)}>
            <button className="flex items-center space-x-1.5 text-muted-foreground hover:text-secondary transition-colors group cursor-pointer">
              <div className="p-2 -ml-2 rounded-full group-hover:bg-secondary/10 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{localCommentCount}</span>
            </button>
          </CommentsModal>

          <button className="flex items-center space-x-1.5 text-muted-foreground hover:text-blue-500 transition-colors group">
            <div className="p-2 -ml-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{post.shares}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
