import { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Play,
  Pause,
  Radio,
  CheckCircle2,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar } from "@/components/common/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useFollow } from "@/hooks/useFollow";
import { useSaves } from "@/hooks/useSaves";
import { reactionService } from "@/features/reactions";
import { CommentsModal } from "@/components/feed/CommentsModal";
import type { Note } from "@/services/NoteService";

interface NoteCardProps {
  note: Note;
  onRefresh?: () => void;
}

export function NoteCard({ note }: NoteCardProps) {
  const navigate = useNavigate();
  const { profile, requireAuth } = useAuth();

  // Follow Hook
  const authorId = note.user_id;
  const isSelf = profile?.id === authorId;
  const { isFollowing, toggleFollow, loading: followLoading } = useFollow(authorId);

  // Reaction (Like) state
  const [likesCount, setLikesCount] = useState<number>(note.reaction_count || 0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);

  // Save state
  const { toggleSave, checkIsSaved } = useSaves();
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Comments state
  const [commentsCount, setCommentsCount] = useState<number>(note.reply_count || 0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Voice playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch initial reaction summary & save status
  useEffect(() => {
    let active = true;

    async function loadInteractions() {
      if (profile?.id) {
        try {
          const summary = await reactionService.getSummary("note", note.id, profile.id);
          if (active) {
            setLikesCount(summary.counts.heart || 0);
            setIsLiked(summary.userReaction === "heart");
          }
        } catch (err) {
          console.error("Failed to load reaction summary for note:", err);
        }

        try {
          const saved = await checkIsSaved(note.id);
          if (active) setIsSaved(saved);
        } catch (err) {
          console.error("Failed to check save status:", err);
        }
      }
    }

    loadInteractions();
    return () => {
      active = false;
    };
  }, [note.id, profile?.id, checkIsSaved]);

  // Audio setup for voice notes
  useEffect(() => {
    if (note.type === "voice" && note.audio_url && !audioRef.current) {
      const audio = new Audio(note.audio_url);
      audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
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
  }, [note.type, note.audio_url]);

  const handleLikeToggle = async () => {
    if (!profile) return requireAuth();
    if (likeLoading) return;

    setLikeLoading(true);
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await reactionService.toggleReaction(
        {
          userId: profile.id,
          targetType: "note",
          targetId: note.id,
          reactionType: "heart",
        },
        isLiked ? "heart" : null,
      );
    } catch (err) {
      console.error("Like failed:", err);
      // Revert optimistic update
      setIsLiked(!nextLiked);
      setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      toast.error("Could not update reaction");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!profile) return requireAuth();

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    const success = await toggleSave(note.id, isSaved);
    if (!success) {
      setIsSaved(!nextSaved);
      toast.error("Could not save Note");
    } else {
      toast.success(nextSaved ? "Note saved to library" : "Note removed from saved");
    }
  };

  const toggleAudioPlayback = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Audio playback error:", err);
        toast.error("Could not play voice note");
        setIsPlaying(false);
      }
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/notes/${note.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Note by ${note.profiles?.display_name || "a creator on Matisa"}`,
          text: note.content || "Listen to this Voice Note on Matisa!",
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Note link copied to clipboard!");
    }
  };

  const formattedTime = new Date(note.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const authorName = note.profiles?.display_name || note.profiles?.username || "Matisa Creator";
  const authorUsername = note.profiles?.username || "creator";
  const waveformBars = note.waveform_data?.length
    ? note.waveform_data
    : [35, 60, 40, 80, 100, 50, 75, 90, 45, 65, 85, 30, 70, 95, 40, 60];

  return (
    <div className="relative w-full rounded-[24px] glass-panel-elevated p-5 border border-white/15 bg-[#0A1628]/80 shadow-xl space-y-4">
      {/* Header: Author info, timestamp, follow button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar
            size={42}
            profile={{
              id: authorId,
              display_name: authorName,
              avatar_url: note.profiles?.avatar_url,
            }}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-bold text-white tracking-wide truncate">
                {authorName}
              </span>
              <CheckCircle2 size={14} className="text-[#24A3C7] shrink-0" />
            </div>
            <span className="text-xs text-white/50 truncate">
              @{authorUsername} • {formattedTime}
            </span>
          </div>
        </div>

        {/* Follow Button */}
        {!isSelf && (
          <button
            onClick={toggleFollow}
            disabled={followLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
              isFollowing
                ? "bg-white/10 text-white/70 border border-white/20 hover:bg-white/20"
                : "bg-gradient-to-r from-[#FF9D2E] to-[#24A3C7] text-white shadow-md hover:opacity-90"
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck size={13} />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus size={13} />
                <span>Follow</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Note Body */}
      <div className="space-y-3">
        {note.content && (
          <p className="text-sm text-white/95 leading-relaxed whitespace-pre-wrap font-normal">
            {note.content}
          </p>
        )}

        {/* Voice Note Waveform Player */}
        {note.type === "voice" && note.audio_url && (
          <div className="flex items-center gap-3.5 p-3.5 rounded-[18px] bg-gradient-to-r from-[#24A3C7]/15 to-[#6139F2]/15 border border-[#24A3C7]/30 backdrop-blur-md">
            <button
              onClick={toggleAudioPlayback}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#24A3C7] to-[#6139F2] text-white shadow-md active:scale-90 transition"
              aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
            >
              {isPlaying ? (
                <Pause size={18} fill="white" />
              ) : (
                <Play size={18} fill="white" className="ml-0.5" />
              )}
            </button>

            <div className="flex-1 flex flex-col gap-1">
              {/* Animated Waveform */}
              <div className="relative flex items-center gap-1 h-8 overflow-hidden">
                {waveformBars.slice(0, 24).map((heightVal, idx) => (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isPlaying ? "bg-[#24A3C7] animate-pulse" : "bg-white/30"
                    }`}
                    style={{
                      height: `${Math.max(20, heightVal)}%`,
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  />
                ))}
                {/* Progress bar overlay */}
                <div
                  className="absolute inset-y-0 left-0 bg-[#FF9D2E]/30 pointer-events-none rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/60 font-semibold px-0.5">
                <span>Voice Note</span>
                <span>
                  {note.duration_seconds
                    ? `${Math.floor(note.duration_seconds / 60)}:${(note.duration_seconds % 60).toString().padStart(2, "0")}`
                    : "0:30"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar & Note-to-Room Shortcut */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition group active:scale-95"
            aria-label="Like Note"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                isLiked ? "bg-red-500/20 text-red-500" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <Heart
                size={16}
                fill={isLiked ? "#EF4444" : "none"}
                className={isLiked ? "text-red-500" : ""}
              />
            </div>
            <span className={`text-xs font-bold ${isLiked ? "text-red-400" : "text-white/70"}`}>
              {likesCount}
            </span>
          </button>

          {/* Comment Trigger */}
          <button
            onClick={() => setIsCommentsOpen(true)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition group active:scale-95"
            aria-label="Comments"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10">
              <MessageCircle size={16} />
            </div>
            <span className="text-xs font-bold text-white/70">{commentsCount}</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveToggle}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition active:scale-95"
            aria-label="Save Note"
          >
            <Bookmark
              size={16}
              fill={isSaved ? "#24A3C7" : "none"}
              className={isSaved ? "text-[#24A3C7]" : ""}
            />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition active:scale-95"
            aria-label="Share Note"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Signature Feature: Note-to-Room ("Continue live") */}
        <button
          onClick={() => {
            toast.success(`Opening live Room for @${authorUsername}'s Note!`);
            navigate("/rooms");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6139F2]/20 text-[#24A3C7] font-bold text-[11px] border border-[#6139F2]/40 hover:bg-[#6139F2]/40 active:scale-95 transition"
        >
          <Radio size={12} className="animate-pulse text-[#24A3C7]" />
          <span>Continue live</span>
        </button>
      </div>

      {/* Real Comments Drawer */}
      {isCommentsOpen && (
        <CommentsModal
          postId={note.id}
          onCommentCountChange={(delta) => setCommentsCount((prev) => Math.max(0, prev + delta))}
          onClose={() => setIsCommentsOpen(false)}
        >
          <span className="hidden" />
        </CommentsModal>
      )}
    </div>
  );
}

export default NoteCard;
