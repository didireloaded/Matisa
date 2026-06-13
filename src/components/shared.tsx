// ================================================================
// matisa — Shared UI Components
// ================================================================
import { useState, type ReactNode } from 'react';
import {
  Heart, MessageCircle, Repeat2, Bookmark, Share2,
  MoreHorizontal, Play, Mic, MapPin, Music2, CheckCircle2,
} from 'lucide-react';
import type { Post, Profile } from "@/types";
import { fmtCount, timeAgo } from "@/types";

// ────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ────────────────────────────────────────────────────────────

export const T = {
  bg:      '#0F0D0B',
  surface: '#1C1814',
  s2:      '#221D18',
  border:  '#2E2822',
  text:    '#F5F0EA',
  muted:   '#8A7F74',
  primary: '#C8521A',
  sand:    '#E8A055',
  sky:     '#2D7DD2',
  success: '#4CAF7D',
} as const;

const GRADIENTS = [
  'linear-gradient(135deg,#C8521A,#6B2D1A)',
  'linear-gradient(135deg,#2D7DD2,#1A3A60)',
  'linear-gradient(135deg,#4CAF7D,#1A5C3A)',
  'linear-gradient(135deg,#E8A055,#8B5A1A)',
  'linear-gradient(135deg,#8B3A1F,#3A1A0E)',
  'linear-gradient(135deg,#6B2D7D,#2A1040)',
  'linear-gradient(135deg,#2D7D6B,#1A4038)',
  'linear-gradient(135deg,#1A2D6B,#0A1230)',
];

function pickGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

// ────────────────────────────────────────────────────────────
// AVATAR
// ────────────────────────────────────────────────────────────

interface AvatarProps {
  profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>;
  size?: number;
  ring?: boolean;
  showOnline?: boolean;
}

export function Avatar({ profile, size = 40, ring = false, showOnline = false }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const grad = pickGradient(profile.id);
  const letter = (profile.display_name || '?')[0].toUpperCase();
  const fontSize = Math.floor(size * 0.38);

  const inner = profile.avatar_url && !imgError ? (
    <img
      src={profile.avatar_url}
      alt={profile.display_name}
      className="h-full w-full object-cover"
      onError={() => setImgError(true)}
    />
  ) : (
    <div
      className="flex h-full w-full items-center justify-center font-semibold text-white select-none"
      style={{ background: grad, fontSize }}
    >
      {letter}
    </div>
  );

  const wrapSize = ring ? size + 6 : size;

  return (
    <div className="relative flex-shrink-0" style={{ width: wrapSize, height: wrapSize }}>
      {ring ? (
        <div className="story-ring h-full w-full rounded-full p-[2.5px]">
          <div className="rounded-full overflow-hidden h-full w-full">{inner}</div>
        </div>
      ) : (
        <div className="rounded-full overflow-hidden ring-1 ring-black/20" style={{ width: size, height: size }}>
          {inner}
        </div>
      )}
      {showOnline && (
        <span
          className="absolute rounded-full border-2 border-[#0F0D0B] bg-[#4CAF7D]"
          style={{ width: 10, height: 10, bottom: ring ? 2 : 0, right: ring ? 2 : 0 }}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// VERIFIED BADGE
// ────────────────────────────────────────────────────────────

export function Verified({ size = 14 }: { size?: number }) {
  return (
    <CheckCircle2 size={size} style={{ color: T.sky, fill: T.sky, opacity: 0.9 }} />
  );
}

// ────────────────────────────────────────────────────────────
// REGION BADGE
// ────────────────────────────────────────────────────────────

export function RegionBadge({ region }: { region: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full border border-[#C8521A]/25 bg-[#C8521A]/10 px-2 py-0.5 text-[10px] font-medium text-[#E8A055]">
      <MapPin size={8} />
      {region}
    </span>
  );
}

// ────────────────────────────────────────────────────────────
// POST CARD
// ────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  onLike:    (liked: boolean) => void;
  onSave:    (saved: boolean) => void;
  onRepost:  () => void;
  onComment: () => void;
  onProfile: (userId: string) => void;
  onDelete?: () => void;
  isOwn?:    boolean;
}

export function PostCard({
  post, onLike, onSave, onRepost, onComment, onProfile, onDelete, isOwn,
}: PostCardProps) {
  const [liked, setLiked] = useState(!!post.liked);
  const [saved, setSaved] = useState(!!post.saved);
  const [likes, setLikes] = useState(post.like_count);
  const [menuOpen, setMenuOpen] = useState(false);
  const author = post.profiles;

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikes(c => next ? c + 1 : Math.max(0, c - 1));
    onLike(next);
  };

  const handleSave = () => {
    const next = !saved;
    setSaved(next);
    onSave(next);
  };

  return (
    <article className="border-b border-[#2E2822] px-4 py-4">
      <div className="flex gap-3">

        {/* Avatar */}
        <button onClick={() => onProfile(author.id)} className="flex-shrink-0 mt-0.5">
          <Avatar profile={author} size={42} />
        </button>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button onClick={() => onProfile(author.id)} className="text-left min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold text-[#F5F0EA]">{author.display_name}</span>
                {author.is_verified && <Verified size={13} />}
                <span className="text-[#8A7F74] text-xs">·</span>
                <span className="text-[#8A7F74] text-xs">{timeAgo(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-[#8A7F74]">@{author.username}</span>
                {post.region && <RegionBadge region={post.region} />}
              </div>
            </button>

            {/* Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="text-[#8A7F74] hover:text-[#F5F0EA] transition p-1"
              >
                <MoreHorizontal size={17} />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-6 z-20 min-w-[140px] rounded-xl border border-[#2E2822] shadow-2xl overflow-hidden"
                  style={{ background: T.surface }}
                >
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); setMenuOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-[#F5F0EA] hover:bg-[#2E2822] transition"
                  >
                    Copy link
                  </button>
                  {isOwn && onDelete && (
                    <button
                      onClick={() => { onDelete(); setMenuOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-[#2E2822] transition"
                    >
                      Delete post
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {post.content && (
            <p className="mt-2 text-[14px] leading-relaxed text-[#F5F0EA] whitespace-pre-wrap">
              {post.content}
            </p>
          )}

          {/* Media */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className={`mt-3 grid gap-0.5 overflow-hidden rounded-2xl border border-[#2E2822] ${
              post.media_urls.length === 1 ? 'grid-cols-1'
              : post.media_urls.length === 2 ? 'grid-cols-2'
              : 'grid-cols-2'
            }`}>
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
                      <span className="text-2xl font-bold text-white">+{post.media_urls!.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Voice note */}
          {post.type === 'voice' && post.voice_url && (
            <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-[#2E2822] bg-[#221D18] px-3 py-2.5">
              <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C8521A]">
                <Play size={12} fill="white" color="white" />
              </button>
              <div className="flex flex-1 items-center gap-[2px]">
                {Array.from({ length: 32 }).map((_, j) => (
                  <span
                    key={j}
                    className="rounded-full bg-[#C8521A]"
                    style={{ width: 2, height: 4 + Math.abs(Math.sin(j * 1.3)) * 16, opacity: j < 13 ? 1 : 0.3 }}
                  />
                ))}
              </div>
              {post.voice_duration && (
                <span className="text-[10px] font-medium text-[#8A7F74] flex-shrink-0">
                  0:{String(post.voice_duration).padStart(2, '0')}
                </span>
              )}
            </div>
          )}

          {/* Repost indicator */}
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
              <span>{fmtCount(likes)}</span>
            </button>

            <button
              onClick={onComment}
              className="flex items-center gap-1.5 text-xs font-medium hover:text-[#2D7DD2] transition"
            >
              <MessageCircle size={17} strokeWidth={1.8} />
              <span>{fmtCount(post.comment_count)}</span>
            </button>

            <button
              onClick={onRepost}
              className="flex items-center gap-1.5 text-xs font-medium hover:text-[#4CAF7D] transition"
            >
              <Repeat2 size={17} strokeWidth={1.8} />
              <span>{fmtCount(post.repost_count)}</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 text-xs font-medium transition active:scale-95 ${
                saved ? 'text-[#E8A055]' : 'hover:text-[#E8A055]'
              }`}
            >
              <Bookmark size={17} fill={saved ? '#E8A055' : 'none'} strokeWidth={saved ? 0 : 1.8} />
              <span>{fmtCount(post.save_count)}</span>
            </button>

            <button
              onClick={() => navigator.share?.({ url: window.location.origin + '/post/' + post.id })}
              className="hover:text-[#F5F0EA] transition"
            >
              <Share2 size={17} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────────
// SKELETON
// ────────────────────────────────────────────────────────────

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#2E2822] ${className}`}
      style={{ animationDuration: '1.4s' }}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="border-b border-[#2E2822] px-4 py-4">
      <div className="flex gap-3">
        <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full mt-3" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex gap-6 mt-3">
            {[0,1,2,3].map(i => <Skeleton key={i} className="h-3 w-10" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// EMPTY STATE
// ────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1C1814] border border-[#2E2822]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#F5F0EA]">{title}</h3>
      {subtitle && <p className="mt-1.5 text-sm text-[#8A7F74] max-w-[240px]">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// DIVIDER
// ────────────────────────────────────────────────────────────

export function Divider() {
  return <div className="h-px bg-[#2E2822]" />;
}

// ────────────────────────────────────────────────────────────
// SONG CARD
// ────────────────────────────────────────────────────────────

export function SongCard({ title, artist }: { title: string; artist: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#2E2822] bg-[#221D18] p-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white"
           style={{ background: 'linear-gradient(135deg,#C8521A,#2D7DD2)' }}>
        <Music2 size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#F5F0EA] truncate">{title}</div>
        <div className="text-xs text-[#8A7F74] truncate">{artist}</div>
      </div>
      <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C8521A] text-white">
        <Play size={11} fill="white" color="white" />
      </button>
    </div>
  );
}
