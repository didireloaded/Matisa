import { useState, memo } from 'react';
import {
  Heart, MessageCircle, Repeat2, Bookmark,
  Share2, MoreHorizontal, Play,
} from 'lucide-react';
import type { Post } from '@/types';
import { fmtCount, timeAgo } from '@/types';
import { T } from './Tokens';
import { Avatar } from './Avatar';
import { Verified, RegionBadge } from './Badge';

interface PostCardProps {
  post:      Post;
  onLike:    (liked: boolean) => void;
  onSave:    (saved: boolean) => void;
  onRepost:  () => void;
  onComment: () => void;
  onProfile: (userId: string) => void;
  onDelete?: () => void;
  isOwn?:    boolean;
}

// Helper — works with both full_name (schema) and display_name (type)
function authorName(author: Post['profiles']): string {
  return (author as any).display_name
    || (author as any).full_name
    || author.username
    || 'Unknown';
}

export const PostCard = memo(function PostCard({
  post, onLike, onSave, onRepost, onComment, onProfile, onDelete, isOwn,
}: PostCardProps) {
  const [liked, setLiked]       = useState(!!post.liked);
  const [saved, setSaved]       = useState(!!post.saved);
  const [likeCount, setLikeCount] = useState(
    post.like_count ?? (post as any).likes_count ?? 0
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const author = post.profiles;

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount(c => next ? c + 1 : Math.max(0, c - 1));
    onLike(next);
  };

  const handleSave = () => {
    const next = !saved;
    setSaved(next);
    onSave(next);
  };

  const commentCount = post.comment_count ?? (post as any).comments_count ?? 0;
  const repostCount  = post.repost_count  ?? (post as any).reposts_count  ?? 0;

  return (
    <article className="border-b border-[#2E2822] px-4 py-4">
      <div className="flex gap-3">

        {/* Avatar */}
        <button onClick={() => onProfile(author.id)} className="mt-0.5 flex-shrink-0">
          <Avatar profile={author} size={42} />
        </button>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">

            {/* Name + meta */}
            <button onClick={() => onProfile(author.id)} className="min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold text-[#F5F0EA]">
                  {authorName(author)}
                </span>
                {author.is_verified && <Verified size={13} />}
                <span className="text-xs text-[#8A7F74]">·</span>
                <span className="text-xs text-[#8A7F74]">{timeAgo(post.created_at)}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="text-[11px] text-[#8A7F74]">@{author.username}</span>
                {post.region && <RegionBadge region={post.region} />}
              </div>
            </button>

            {/* Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="p-1 text-[#8A7F74] transition hover:text-[#F5F0EA]"
              >
                <MoreHorizontal size={17} />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-6 z-20 min-w-[140px] overflow-hidden rounded-xl border border-[#2E2822] shadow-2xl"
                  style={{ background: T.surface }}
                >
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-[#F5F0EA] transition hover:bg-[#2E2822]"
                  >
                    Copy link
                  </button>
                  {isOwn && onDelete && (
                    <button
                      onClick={() => { onDelete(); setMenuOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-[#2E2822]"
                    >
                      Delete post
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Text content */}
          {post.content && (
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-[#F5F0EA]">
              {post.content}
            </p>
          )}

          {/* Media grid */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div
              className={`mt-3 grid gap-0.5 overflow-hidden rounded-2xl border border-[#2E2822] ${
                post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}
            >
              {post.media_urls.slice(0, 4).map((url, i) => (
                <div
                  key={i}
                  className={`relative bg-[#1C1814] ${
                    post.media_urls!.length === 3 && i === 0 ? 'row-span-2' : ''
                  }`}
                  style={{ aspectRatio: post.media_urls!.length === 1 ? '16/9' : '1/1' }}
                >
                  {post.type === 'video' ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1C1814] to-[#0F0D0B]" />
                      {i === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 backdrop-blur">
                            <Play size={18} fill="white" color="white" />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  )}
                  {post.media_urls!.length > 4 && i === 3 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="text-2xl font-bold text-white">
                        +{post.media_urls!.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Voice note */}
          {post.type === 'voice' && (post.voice_url) && (
            <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-[#2E2822] bg-[#221D18] px-3 py-2.5">
              <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C8521A]">
                <Play size={12} fill="white" color="white" />
              </button>
              <div className="flex flex-1 items-center gap-[2px]">
                {Array.from({ length: 32 }).map((_, j) => (
                  <span
                    key={j}
                    className="rounded-full bg-[#C8521A]"
                    style={{
                      width: 2,
                      height: 4 + Math.abs(Math.sin(j * 1.3)) * 16,
                      opacity: j < 13 ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
              {post.voice_duration && (
                <span className="flex-shrink-0 text-[10px] font-medium text-[#8A7F74]">
                  0:{String(post.voice_duration).padStart(2, '0')}
                </span>
              )}
            </div>
          )}

          {/* Repost label */}
          {post.is_repost && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#8A7F74]">
              <Repeat2 size={12} />
              <span>Reposted</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between text-[#8A7F74]">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-medium transition active:scale-95 ${
                liked ? 'text-[#C8521A]' : 'hover:text-[#C8521A]'
              }`}
            >
              <Heart size={17} fill={liked ? '#C8521A' : 'none'} strokeWidth={liked ? 0 : 1.8} />
              <span>{fmtCount(likeCount)}</span>
            </button>

            <button
              onClick={onComment}
              className="flex items-center gap-1.5 text-xs font-medium transition hover:text-[#2D7DD2]"
            >
              <MessageCircle size={17} strokeWidth={1.8} />
              <span>{fmtCount(commentCount)}</span>
            </button>

            <button
              onClick={onRepost}
              className="flex items-center gap-1.5 text-xs font-medium transition hover:text-[#4CAF7D]"
            >
              <Repeat2 size={17} strokeWidth={1.8} />
              <span>{fmtCount(repostCount)}</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 text-xs font-medium transition active:scale-95 ${
                saved ? 'text-[#E8A055]' : 'hover:text-[#E8A055]'
              }`}
            >
              <Bookmark size={17} fill={saved ? '#E8A055' : 'none'} strokeWidth={saved ? 0 : 1.8} />
            </button>

            <button
              onClick={() => navigator.share?.({ url: `${window.location.origin}/post/${post.id}` })}
              className="transition hover:text-[#F5F0EA]"
            >
              <Share2 size={17} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});
