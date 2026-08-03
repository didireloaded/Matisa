import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Plus,
  Music,
  Send,
  CheckCircle2,
  Radio,
  Mic,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { USERS } from "@/data/dummy";
import { Avatar } from "@/components/common/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNotes } from "@/hooks/useNotes";
import { StoryService } from "@/services/stories";
import { CreateStoryModal } from "@/components/stories/CreateStoryModal";
import { StoriesViewer } from "@/components/stories/StoriesViewer";
import { CreateNoteModal } from "@/components/notes/CreateNoteModal";
import { VoiceNoteRecorderModal } from "@/components/voice/VoiceNoteRecorderModal";

export function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [feedTab, setFeedTab] = useState<"discover" | "following">("discover");
  const { notes, loading, refreshNotes } = useNotes();
  const [stories, setStories] = useState<any[]>([]);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadStories() {
      try {
        const data = await StoryService.getFeedStories();
        if (data && data.length > 0) {
          setStories(data);
        } else {
          setStories(
            USERS.map((user, i) => ({
              id: `story-${user.id}`,
              user_id: user.id,
              profiles: {
                display_name: user.name,
                avatar_url: user.avatar,
              },
              media_url: user.avatar,
              media_type: i % 2 === 0 ? "image" : "voice",
              created_at: new Date(Date.now() - i * 3600000).toISOString(),
            })),
          );
        }
      } catch (err) {
        console.error("Failed to load stories", err);
      }
    }
    loadStories();
  }, []);

  const reelCards = [
    {
      id: "reel-1",
      author: "Maria Theodore",
      username: "maria_theodore",
      verified: true,
      avatar: USERS[0].avatar,
      videoBg:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      caption:
        "Short scenes, deep emotions—each reel carries a piece of something special under the Namibian sky.",
      track: "Loop Mode (instrumental)",
      likes: "45.2k",
      bookmarks: "18.9k",
      comments: "10.2k",
    },
    {
      id: "reel-2",
      author: "Gazza Official",
      username: "gazzamusic",
      verified: true,
      avatar: USERS[1].avatar,
      videoBg:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      caption: "Live acoustic studio session in Windhoek. Join the voice room afterwards!",
      track: "Kapana Vibes - Studio Jam",
      likes: "32.8k",
      bookmarks: "12.4k",
      comments: "8.6k",
    },
  ];

  return (
    <div className="flex flex-col min-h-full pb-24 pt-1">
      {/* 1. Reelio Top Header Tabs (Discover / Following) */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setFeedTab("discover")}
            className={`text-base font-bold tracking-wide transition ${
              feedTab === "discover" ? "text-white scale-105" : "text-white/40 hover:text-white/70"
            }`}
          >
            Discover
          </button>

          <button
            onClick={() => setFeedTab("following")}
            className={`text-base font-bold tracking-wide transition ${
              feedTab === "following" ? "text-white scale-105" : "text-white/40 hover:text-white/70"
            }`}
          >
            Following
          </button>
        </div>

        <button
          onClick={() => setIsVoiceRecorderOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF9D2E]/20 to-[#24A3C7]/20 text-white border border-[#24A3C7]/30 text-xs font-bold hover:border-[#24A3C7]/60 transition active:scale-95"
        >
          <Mic size={14} className="text-[#FF9D2E]" />
          <span>Voice Note</span>
        </button>
      </div>

      {/* 2. Reelio Stories Rail (Rounded Squircles) */}
      <div className="px-5 mb-4 overflow-x-auto no-scrollbar flex gap-3">
        {/* Your Story Squircle Tile */}
        <button
          onClick={() => setIsCreateStoryOpen(true)}
          className="relative h-28 w-20 flex-shrink-0 rounded-[24px] glass-panel-elevated p-2 flex flex-col items-center justify-between overflow-hidden border border-white/20 transition active:scale-95 group"
        >
          <div className="flex-1 flex items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg">
              <Plus size={20} strokeWidth={3} />
            </div>
          </div>
          <span className="text-[10px] font-bold text-white/90 truncate w-full text-center">
            Your story
          </span>
        </button>

        {/* Community Story Squircles */}
        {stories.map((s, idx) => {
          const author = s.profiles;
          return (
            <button
              key={s.id}
              onClick={() => setViewerIndex(idx)}
              className="relative h-28 w-20 flex-shrink-0 rounded-[24px] overflow-hidden border-2 border-[#24A3C7]/60 shadow-lg transition active:scale-95 group"
            >
              <img
                src={s.media_url || author?.avatar_url || USERS[idx % USERS.length].avatar}
                alt="Story"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-0 right-0 text-[10px] font-bold text-white text-center truncate px-1">
                {author?.display_name?.split(" ")[0] || "User"}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Reelio Immersive Full-Card Reels Feed */}
      <div className="px-5 space-y-6 flex-1">
        {reelCards.map((reel) => {
          const isReelLiked = liked[reel.id];
          const isReelSaved = saved[reel.id];

          return (
            <div
              key={reel.id}
              className="relative h-[560px] w-full rounded-[32px] overflow-hidden shadow-2xl border border-white/15 bg-black"
            >
              {/* Background Media Image */}
              <img
                src={reel.videoBg}
                alt={reel.author}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />

              {/* Ambient Dark Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />

              {/* Right Vertical Action Strip */}
              <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4.5 z-20 glass-panel-elevated p-2.5 rounded-full border border-white/20 backdrop-blur-2xl">
                {/* Heart / Like Button */}
                <button
                  onClick={() => setLiked((prev) => ({ ...prev, [reel.id]: !prev[reel.id] }))}
                  className="flex flex-col items-center gap-1 text-white hover:scale-110 active:scale-90 transition"
                  aria-label="Like"
                >
                  <Heart
                    size={22}
                    className={isReelLiked ? "text-red-500 fill-red-500" : "text-white"}
                  />
                  <span className="text-[10px] font-bold">{reel.likes}</span>
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={() => setSaved((prev) => ({ ...prev, [reel.id]: !prev[reel.id] }))}
                  className="flex flex-col items-center gap-1 text-white hover:scale-110 active:scale-90 transition"
                  aria-label="Bookmark"
                >
                  <Bookmark
                    size={22}
                    className={isReelSaved ? "text-[#FF9D2E] fill-[#FF9D2E]" : "text-white"}
                  />
                  <span className="text-[10px] font-bold">{reel.bookmarks}</span>
                </button>

                {/* Comment Count */}
                <button
                  className="flex flex-col items-center gap-1 text-white hover:scale-110 active:scale-90 transition"
                  aria-label="Comments"
                >
                  <MessageCircle size={22} />
                  <span className="text-[10px] font-bold">{reel.comments}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => toast.success("Link copied to clipboard!")}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/20 transition active:scale-90"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Bottom Content Container (Author, Caption, Track, Comment bar) */}
              <div className="absolute bottom-4 left-4 right-16 z-20 space-y-3">
                {/* Author Info Row */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar
                      size={40}
                      profile={{
                        id: reel.id,
                        display_name: reel.author,
                        avatar_url: reel.avatar,
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white tracking-wide">
                      @{reel.username}
                    </span>
                    {reel.verified && (
                      <CheckCircle2 size={14} className="text-[#24A3C7] fill-[#24A3C7]/20" />
                    )}
                  </div>

                  <button
                    onClick={() => toast.success(`Following @${reel.username}`)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full glass-panel text-white text-[11px] font-bold border border-white/20 hover:bg-white/20 transition active:scale-95 ml-1"
                  >
                    <Plus size={12} />
                    <span>Follow</span>
                  </button>

                  <button
                    onClick={() => navigate("/rooms")}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#6139F2] to-[#24A3C7] text-white text-[11px] font-bold shadow-md hover:opacity-90 transition active:scale-95 ml-auto"
                  >
                    <Radio size={12} />
                    <span>Continue live</span>
                  </button>
                </div>

                {/* Caption Text */}
                <p className="text-xs text-white/95 leading-relaxed font-normal pr-16 line-clamp-2">
                  {reel.caption}
                </p>

                {/* Music Track Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-semibold backdrop-blur-md border border-white/15">
                  <Music size={13} className="text-[#39B7F2]" />
                  <span>{reel.track}</span>
                </div>

                {/* Comment Bar Capsule */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 flex items-center gap-2 rounded-full glass-panel-elevated px-4 py-2 border border-white/20">
                    <MessageCircle size={16} className="text-white/40" />
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (commentText.trim()) {
                        toast.success("Comment added!");
                        setCommentText("");
                      }
                    }}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#24A3C7] to-[#6139F2] text-white shadow-lg active:scale-90 transition"
                    aria-label="Send Comment"
                  >
                    <Send size={16} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isCreateStoryOpen && (
        <CreateStoryModal open={isCreateStoryOpen} onClose={() => setIsCreateStoryOpen(false)} />
      )}

      {isCreateNoteOpen && (
        <CreateNoteModal
          open={isCreateNoteOpen}
          onClose={() => setIsCreateNoteOpen(false)}
          onSuccess={refreshNotes}
          initialMode="text"
        />
      )}

      {viewerIndex !== null && (
        <StoriesViewer
          stories={stories.map((s) => ({
            id: s.id,
            userId: s.user_id,
            username: s.profiles?.display_name || "User",
            userAvatar: s.profiles?.avatar_url || "",
            mediaUrl: s.media_url,
            mediaType: s.media_type as any,
            content: { audioUrl: s.media_url },
            timestamp: new Date(s.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      {isVoiceRecorderOpen && (
        <VoiceNoteRecorderModal
          open={isVoiceRecorderOpen}
          onClose={() => setIsVoiceRecorderOpen(false)}
          onPublished={() => {
            refreshNotes();
            setIsVoiceRecorderOpen(false);
          }}
          mode="note"
        />
      )}
    </div>
  );
}

export default Home;
