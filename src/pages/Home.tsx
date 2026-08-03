import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Plus,
  Send,
  CheckCircle2,
  Radio,
  Mic,
  Volume2,
  UserCheck,
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
import { CommentsModal } from "@/components/feed/CommentsModal";
import { NoteCard } from "@/components/feed/NoteCard";

export function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [feedTab, setFeedTab] = useState<"discover" | "following">("discover");
  const { notes, loading, refreshNotes } = useNotes();
  const [stories, setStories] = useState<any[]>([]);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    maria_theodore: true,
  });

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

  // 1. Discover Feed items (Popular local media posts + active rooms)
  const discoverFeed = [
    {
      id: "disc-1",
      author: "Maria Theodore",
      username: "maria_theodore",
      verified: true,
      avatar: USERS[0].avatar,
      videoBg:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      caption:
        "Short scenes, deep emotions—each note carries a piece of something special under the Namibian sky. ✨",
      likesCount: 452,
      bookmarksCount: 189,
      commentsCount: 102,
      type: "media",
    },
    {
      id: "disc-2",
      author: "Gazza Official",
      username: "gazzamusic",
      verified: true,
      avatar: USERS[1].avatar,
      videoBg:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      caption: "Live acoustic studio session in Windhoek. Join the voice room afterwards!",
      likesCount: 328,
      bookmarksCount: 124,
      commentsCount: 86,
      type: "media",
    },
    {
      id: "disc-3",
      author: "Lukas Shilongo",
      username: "lukas_vibe",
      verified: false,
      avatar: USERS[2].avatar,
      videoBg:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
      caption: "Swakopmund Sunset Jam Session — live voice notes dropping tonight 🎤",
      likesCount: 215,
      bookmarksCount: 67,
      commentsCount: 42,
      type: "media",
    },
  ];

  // 2. Following Feed items (Posts specifically from followed creators)
  const followingFeed = [
    {
      id: "foll-1",
      author: "Maria Theodore",
      username: "maria_theodore",
      verified: true,
      avatar: USERS[0].avatar,
      videoBg:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      caption:
        "Exclusive update for my followers: New voice room session hosting tomorrow at 8 PM!",
      likesCount: 184,
      bookmarksCount: 92,
      commentsCount: 34,
      type: "media",
    },
  ];

  const activeFeed = feedTab === "discover" ? discoverFeed : followingFeed;

  const toggleFollow = (username: string) => {
    setFollowingMap((prev) => {
      const next = !prev[username];
      toast.success(next ? `Following @${username}` : `Unfollowed @${username}`);
      return { ...prev, [username]: next };
    });
  };

  return (
    <div className="flex flex-col min-h-full pb-24 pt-1">
      {/* 1. Clean Top Header & Feed Selector */}
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

        {/* Quick Voice Note Action */}
        <button
          onClick={() => setIsVoiceRecorderOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF9D2E]/20 to-[#24A3C7]/20 text-white border border-[#24A3C7]/30 text-xs font-bold hover:border-[#24A3C7]/60 transition active:scale-95 shadow-md"
        >
          <Mic size={14} className="text-[#FF9D2E]" />
          <span>Voice Note</span>
        </button>
      </div>

      {/* 2. Compact Circular Story Rail (~64px avatars showing ~5 stories) */}
      <div className="px-5 mb-4 overflow-x-auto no-scrollbar flex items-center gap-4 py-1">
        {/* Your Story Circular Tile */}
        <button
          onClick={() => setIsCreateStoryOpen(true)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 group active:scale-95 transition"
        >
          <div className="relative h-[64px] w-[64px] rounded-full p-[2px] bg-gradient-to-tr from-[#FF9D2E] to-[#24A3C7] flex items-center justify-center shadow-md">
            <div className="h-full w-full rounded-full bg-[#06101D] flex items-center justify-center">
              <Avatar
                size={58}
                profile={{
                  id: profile?.id || "me",
                  display_name: profile?.display_name || "You",
                  avatar_url: profile?.avatar_url,
                }}
              />
            </div>
            <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-[#24A3C7] text-white flex items-center justify-center border-2 border-[#06101D] shadow">
              <Plus size={12} strokeWidth={3} />
            </div>
          </div>
          <span className="text-[11px] font-bold text-white/90 text-center truncate w-[68px]">
            Your story
          </span>
        </button>

        {/* Community Story Circular Avatars */}
        {stories.map((s, idx) => {
          const author = s.profiles;
          const authorName = author?.display_name || USERS[idx % USERS.length].name;
          const firstName = authorName.split(" ")[0];

          return (
            <button
              key={s.id}
              onClick={() => setViewerIndex(idx)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group active:scale-95 transition"
            >
              <div className="h-[64px] w-[64px] rounded-full p-[2.5px] bg-gradient-to-tr from-[#6139F2] via-[#24A3C7] to-[#FF9D2E] shadow-md hover:scale-105 transition">
                <Avatar
                  size={59}
                  profile={{
                    id: s.user_id,
                    display_name: authorName,
                    avatar_url: author?.avatar_url || USERS[idx % USERS.length].avatar,
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-white/80 text-center truncate w-[68px]">
                {firstName}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Feed Cards Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={feedTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="px-5 space-y-5 flex-1"
        >
          {/* Render Live Notes from DB when available */}
          {notes && notes.length > 0 && (
            <div className="space-y-4">
              {notes.slice(0, 3).map((note) => (
                <NoteCard key={note.id} note={note} onRefresh={refreshNotes} />
              ))}
            </div>
          )}

          {/* Render Tab Media Posts */}
          {activeFeed.map((post) => {
            const isPostLiked = liked[post.id];
            const isPostSaved = saved[post.id];
            const isFollowing = followingMap[post.username];

            return (
              <div
                key={post.id}
                className="relative w-full rounded-[28px] overflow-hidden glass-panel-elevated border border-white/15 bg-[#06101D] shadow-xl"
              >
                {/* Reduced Height Media Player Container (~420px) */}
                <div className="relative h-[420px] w-full bg-black overflow-hidden">
                  <img
                    src={post.videoBg}
                    alt={post.author}
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/85" />

                  {/* Right Action Bar Strip */}
                  <div className="absolute right-3.5 bottom-4 flex flex-col items-center gap-3.5 z-20 glass-panel-elevated p-2 rounded-full border border-white/20 backdrop-blur-2xl">
                    {/* Heart Like */}
                    <button
                      onClick={() => setLiked((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="flex flex-col items-center gap-0.5 text-white hover:scale-110 active:scale-90 transition"
                      aria-label="Like"
                    >
                      <Heart
                        size={20}
                        className={isPostLiked ? "text-red-500 fill-red-500" : "text-white"}
                      />
                      <span className="text-[10px] font-bold">
                        {isPostLiked ? post.likesCount + 1 : post.likesCount}
                      </span>
                    </button>

                    {/* Bookmark Save */}
                    <button
                      onClick={() => {
                        const next = !saved[post.id];
                        setSaved((prev) => ({ ...prev, [post.id]: next }));
                        toast.success(next ? "Saved to Library" : "Removed from Saved");
                      }}
                      className="flex flex-col items-center gap-0.5 text-white hover:scale-110 active:scale-90 transition"
                      aria-label="Bookmark"
                    >
                      <Bookmark
                        size={20}
                        className={isPostSaved ? "text-[#FF9D2E] fill-[#FF9D2E]" : "text-white"}
                      />
                      <span className="text-[10px] font-bold">{post.bookmarksCount}</span>
                    </button>

                    {/* Comment Drawer Trigger */}
                    <button
                      onClick={() => setActiveCommentsPostId(post.id)}
                      className="flex flex-col items-center gap-0.5 text-white hover:scale-110 active:scale-90 transition"
                      aria-label="Comments"
                    >
                      <MessageCircle size={20} />
                      <span className="text-[10px] font-bold">{post.commentsCount}</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={async () => {
                        if (navigator.share) {
                          try {
                            await navigator.share({ title: post.author, text: post.caption });
                          } catch {
                            // User cancelled share
                          }
                        } else {
                          await navigator.clipboard.writeText(window.location.href);
                          toast.success("Post link copied to clipboard!");
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20 transition active:scale-90"
                      aria-label="Share"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>

                  {/* Creator Info & Caption Area Lower Down */}
                  <div className="absolute bottom-4 left-4 right-[64px] z-20 space-y-2">
                    {/* User Identity Row */}
                    <div className="flex items-center gap-2">
                      <Avatar
                        size={36}
                        profile={{
                          id: post.id,
                          display_name: post.author,
                          avatar_url: post.avatar,
                        }}
                      />
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-white tracking-wide truncate">
                          @{post.username}
                        </span>
                        {post.verified && (
                          <CheckCircle2 size={13} className="text-[#24A3C7] shrink-0" />
                        )}
                      </div>

                      <button
                        onClick={() => toggleFollow(post.username)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition active:scale-95 shrink-0 ${
                          isFollowing
                            ? "bg-white/10 text-white/70 border border-white/20"
                            : "bg-gradient-to-r from-[#FF9D2E] to-[#24A3C7] text-white shadow-md"
                        }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>

                    {/* Caption Text (Clean formatting without music pill) */}
                    <p className="text-xs text-white/95 leading-relaxed font-normal line-clamp-2">
                      {post.caption}
                    </p>

                    {/* Comment Input Trigger Capsule */}
                    <div
                      onClick={() => setActiveCommentsPostId(post.id)}
                      className="flex items-center gap-2 pt-1 cursor-pointer"
                    >
                      <div className="flex-1 flex items-center gap-2 rounded-full glass-panel px-3.5 py-1.5 border border-white/20 text-white/50 text-xs hover:text-white transition">
                        <MessageCircle size={14} className="text-white/40" />
                        <span>Add a comment...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Real Comments Drawer Modal */}
      {activeCommentsPostId && (
        <CommentsModal postId={activeCommentsPostId} onClose={() => setActiveCommentsPostId(null)}>
          <span className="hidden" />
        </CommentsModal>
      )}

      {/* Modals & Viewers */}
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
