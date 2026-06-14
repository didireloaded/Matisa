import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Bookmark, Send, Play, Pause } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import type { Post } from "@/types";

export function RichPostCard({
  post,
  onLike,
  onComment,
}: {
  post: Post & { profiles?: any };
  onLike: (liked: boolean) => void;
  onComment: () => void;
}) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likes, setLikes] = useState(post.like_count ?? 0);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : prev - 1));
    onLike(newLiked);
  };

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (post.type === "voice" && post.voice_url && !audioRef.current) {
      const audio = new Audio(post.voice_url);
      audio.addEventListener("timeupdate", () => {
        setProgress((audio.currentTime / audio.duration) * 100);
      });
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
      });
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [post]);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const Waveform = () => (
    <div className="flex items-center gap-1 h-12 flex-1 justify-center">
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-300 ${isPlaying ? "bg-[#FF416C] animate-pulse" : "bg-white/40"}`}
          style={{
            height: `${Math.max(20, Math.random() * 100)}%`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="relative w-full rounded-[32px] overflow-hidden bg-gradient-to-tr from-card to-background aspect-[4/5] shadow-2xl mb-6">
      {/* Background Media Placeholder (If post has media, use it, else generic gradient) */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-secondary/40 mix-blend-overlay opacity-60" />

      {/* Content Rendering */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none z-0">
        {post.type === "voice" ? (
          <div className="w-full flex flex-col items-center gap-6 pointer-events-auto">
            {post.content && (
              <p className="text-white text-xl font-medium text-center drop-shadow-md">
                {post.content}
              </p>
            )}

            <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-sm font-bold text-white/50">Voice Note</span>
                <span className="text-sm font-bold text-[#FF416C]">
                  {post.voice_duration
                    ? `0:${post.voice_duration.toString().padStart(2, "0")}`
                    : "0:14"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleAudio}
                  className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-tr from-[#FF416C] to-[#8E2DE2] flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-1" />
                  )}
                </button>

                <div className="flex-1 relative h-12 flex items-center">
                  {/* Fake waveform */}
                  <Waveform />
                  {/* Progress overlay */}
                  <div
                    className="absolute inset-0 bg-white/20 mix-blend-overlay"
                    style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white text-2xl font-bold text-center leading-relaxed drop-shadow-lg max-w-[90%]">
            {post.content?.replace(/\[VOICE\]\|.*$/, "")}
          </p>
        )}
      </div>

      {/* Post Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Avatar profile={post.profiles} size={40} />
          <div className="flex flex-col">
            <span className="font-bold text-white shadow-sm text-sm">
              {post.profiles?.display_name || post.profiles?.full_name || "Anonymous"}
            </span>
            <span className="text-[10px] text-white/70">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="absolute right-4 bottom-8 flex flex-col items-center gap-6 z-10 bg-white/10 backdrop-blur-md rounded-full py-6 px-3 border border-white/20">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <Heart
            className={`w-6 h-6 transition ${liked ? "fill-primary text-primary" : "text-white group-hover:fill-white/50"}`}
          />
          <span className="text-[10px] font-medium text-white/90">{likes}</span>
        </button>
        <button onClick={onComment} className="flex flex-col items-center gap-1 group">
          <MessageCircle className="w-6 h-6 text-white group-hover:fill-white/50 transition" />
          <span className="text-[10px] font-medium text-white/90">{post.comment_count ?? 0}</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <Bookmark className="w-6 h-6 text-white group-hover:fill-white/50 transition" />
          <span className="text-[10px] font-medium text-white/90">Save</span>
        </button>
        <button className="flex flex-col items-center gap-1 group mt-2">
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
