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
import { VoiceReplyRecorder } from "@/components/voice/VoiceReplyRecorder";

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
        setStories(data || []);
      } catch (err) {
        console.error("Failed to load stories", err);
      }
    }
    loadStories();
  }, []);

  const dummyReels = [
    {
      id: "reel-1",
      user: {
        name: "Maria Theodore",
        username: "maria_theodore",
        avatar: USERS[0].avatar,
        verified: true,
      },
      content:
        "Short scenes, deep emotions—each reel carries a piece of something special under the Namibian sky.",
      track: "Loop Mode (instrumental)",
      likes: "45.2k",
      saves: "18.9k",
      comments: "10.2k",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "reel-2",
      user: {
        name: "Lukas Shilongo",
        username: "lukas_shilongo",
        avatar: USERS[1].avatar,
        verified: true,
      },
      content: "Windhoek acoustic jams and live session recordings with local creators.",
      track: "Sunset Vibes (Live)",
      likes: "28.4k",
      saves: "9.1k",
      comments: "4.8k",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* 1. Top Discover / Following Tab Selector */}
      <div className="px-5 pt-1 pb-3 flex items-center gap-6">
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

      {/* Voice-First Quick Actions */}
      <div className="px-5 mb-3 flex items-center gap-2">
        <button
          onClick={() => setIsVoiceRecorderOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#FF9D2E]/20 to-[#24A3C7]/20 text-white border border-[#24A3C7]/30 text-xs font-bold hover:border-[#24A3C7]/60 transition active:scale-95"
        >
          <Mic size={15} className="text-[#FF9D2E]" />
          <span>Voice Note</span>
        </button>

        <button
          onClick={() => setIsCreateNoteOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel text-white/70 text-xs font-semibold hover:text-white transition active:scale-95"
        >
          <span>What's on your mind?</span>
        </button>
      </div>

      {/* 2. Reelio Stories Rail (Rounded Squircles) */}
      <div className="px-5 mb-5 overflow-x-auto no-scrollbar flex gap-3">
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

        {stories.length === 0 &&
          USERS.map((user, i) => (
            <button
              key={user.id}
              onClick={() => setIsCreateStoryOpen(true)}
              className="relative h-28 w-20 flex-shrink-0 rounded-[24px] overflow-hidden border-2 border-[#24A3C7]/60 shadow-lg transition active:scale-95 group"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-0 right-0 text-[10px] font-bold text-white text-center truncate px-1">
                {user.name.split(" ")[0]}
              </span>
            </button>
          ))}
      </div>

      {/* 3. Reelio Immersive Full-Width Media Cards Feed */}
      <div className="px-5 space-y-6 flex-1">
        {dummyReels.map((reel) => {
          const isLiked = liked[reel.id];
          const isSaved = saved[reel.id];

          return (
            <div
              key={reel.id}
              className="relative h-[550px] w-full rounded-[34px] overflow-hidden shadow-2xl border border-white/15 bg-black"
            >
              {/* Media Image Backdrop */}
              <img
                src={reel.image}
                alt={reel.user.name}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

              {/* Right Floating Glass Action Strip */}
              <div className="absolute right-4 top-1/3 -translate-y-1/2 flex flex-col items-center gap-4 py-4 px-2.5 rounded-full glass-panel-elevated border border-white/20 backdrop-blur-2xl z-20">
                <button
                  onClick={() => setLiked((prev) => ({ ...prev, [reel.id]: !prev[reel.id] }))}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                      isLiked ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <Heart size={20} fill={isLiked ? "red" : "none"} />
                  </div>
                  <span className="text-[10px] font-bold text-white/90">{reel.likes}</span>
                </button>

                <button
                  onClick={() => setSaved((prev) => ({ ...prev, [reel.id]: !prev[reel.id] }))}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                      isSaved
                        ? "bg-[#39B7F2] text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <Bookmark size={20} fill={isSaved ? "#39B7F2" : "none"} />
                  </div>
                  <span className="text-[10px] font-bold text-white/90">{reel.saves}</span>
                </button>

                <button
                  onClick={() => toast.info("Opening comments")}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
                    <MessageCircle size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-white/90">{reel.comments}</span>
                </button>

                <button
                  onClick={() => toast.success("Share link copied!")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Bottom Overlay Info, Note-to-Room & Comment Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-20 space-y-2.5">
                {/* Author Info & Follow Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      size={38}
                      profile={{
                        id: "author",
                        display_name: reel.user.name,
                        avatar_url: reel.user.avatar,
                      }}
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">@{reel.user.username}</span>
                      {reel.user.verified && <CheckCircle2 size={15} className="text-[#39B7F2]" />}
                    </div>

                    <button className="ml-1 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs border border-white/30 backdrop-blur-md transition hover:bg-white/30 active:scale-95">
                      + Follow
                    </button>
                  </div>

                  {/* Signature Feature: Note-to-Room ("Continue this live") */}
                  <button
                    onClick={() => {
                      toast.success("Starting live Voice Room for this Note!");
                      navigate("/rooms");
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#6139F2]/30 text-[#39B7F2] font-bold text-[11px] border border-[#6139F2]/50 backdrop-blur-md hover:bg-[#6139F2]/50 active:scale-95 transition"
                  >
                    <Radio size={12} className="animate-pulse" />
                    <span>Continue live</span>
                  </button>
                </div>

                {/* Caption Text */}
                <p className="text-xs text-white/95 leading-relaxed font-normal pr-16 line-clamp-2">
                  {reel.content}
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
