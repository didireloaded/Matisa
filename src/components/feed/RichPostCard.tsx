import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Bookmark, Send, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/common/Avatar";
import { useSaves } from "@/hooks/useSaves";
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
  const { toggleSave, checkIsSaved } = useSaves();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkIsSaved(post.id).then((saved) => {
      if (mounted) setIsSaved(saved);
    });
    return () => { mounted = false; };
  }, [post.id, checkIsSaved]);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : prev - 1));
    onLike(newLiked);
  };

  const handleSave = async () => {
    const newSaved = !isSaved;
    setIsSaved(newSaved); // optimistic
    const success = await toggleSave(post.id, isSaved);
    if (!success) setIsSaved(!newSaved); // revert on failure
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
    <div className="glass-card mb-4 p-5 flex flex-col gap-4">
      {/* Post Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar profile={post.profiles} size={44} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-[15px]">
                {post.profiles?.display_name || post.profiles?.full_name || "Anonymous"}
              </span>
              {post.profiles?.mood && (
                <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/60 flex items-center max-w-[120px] truncate">
                  {post.profiles.mood}
                </span>
              )}
            </div>
            <span className="text-xs text-white/50">
              @{post.profiles?.username || "user"} •{" "}
              {new Date(post.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      <div className="pl-[56px]">
        {post.type === "voice" ? (
          <div className="w-full flex flex-col gap-3">
            {post.content && (
              <p className="text-white/90 text-[15px] leading-relaxed">{post.content}</p>
            )}

            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <button
                onClick={toggleAudio}
                className="w-12 h-12 shrink-0 rounded-full bg-primary flex items-center justify-center text-black active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-1" />
                )}
              </button>

              <div className="flex-1 relative h-10 flex items-center">
                <Waveform />
                <div
                  className="absolute inset-0 bg-white/20 mix-blend-overlay"
                  style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                />
              </div>

              <span className="text-xs font-bold text-white/50 w-8 text-right">
                {post.voice_duration
                  ? `0:${post.voice_duration.toString().padStart(2, "0")}`
                  : "0:14"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.content?.replace(/\[VOICE\]\|.*$/, "")}
          </p>
        )}

        {/* Action Bar */}
        <div className="flex items-center gap-6 mt-5 pt-4 border-t border-white/5">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 group active:scale-95 transition-transform"
          >
            <Heart
              className={`w-5 h-5 transition ${liked ? "fill-primary text-primary" : "text-white/50 group-hover:text-white"}`}
            />
            <span
              className={`text-sm font-medium ${liked ? "text-primary" : "text-white/50 group-hover:text-white"}`}
            >
              {likes > 0 ? likes : ""}
            </span>
          </button>

          <button
            onClick={onComment}
            className="flex items-center gap-2 group active:scale-95 transition-transform"
          >
            <MessageCircle className="w-5 h-5 text-white/50 group-hover:text-white transition" />
            <span className="text-sm font-medium text-white/50 group-hover:text-white">
              {post.comment_count > 0 ? post.comment_count : ""}
            </span>
          </button>

          <button 
            onClick={handleSave}
            className="flex items-center gap-2 group active:scale-95 transition-transform ml-auto"
          >
            <Bookmark className={`w-5 h-5 transition ${isSaved ? "fill-primary text-primary" : "text-white/50 group-hover:text-white"}`} />
          </button>

          <button onClick={() => toast.success("Link copied to clipboard!")} className="flex items-center gap-2 group active:scale-95 transition-transform">
            <Send className="w-5 h-5 text-white/50 group-hover:text-white transition" />
          </button>
        </div>
      </div>
    </div>
  );
}
