import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  AlignLeft,
  Send,
  Mic,
  Video,
  Calendar,
  Plus,
} from "lucide-react";
import { USERS, STORIES } from "@/data/dummy";
import { supabase } from "@/lib/supabase";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { Avatar } from "@/components/common/Avatar";
import { StoryRing } from "@/components/ui/StoryRing";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/Tabs";
import { VoicePlayer } from "@/components/ui/VoicePlayer";
import type { Profile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils";
import { useNotes } from "@/hooks/useNotes";
import { LiveRoomsBanner } from "@/components/voice/LiveRoomsBanner";
import { StoryService } from "@/services/stories";
import { CreateStoryModal } from "@/components/stories/CreateStoryModal";
import { StoriesViewer } from "@/components/stories/StoriesViewer";
import { CreateNoteModal } from "@/components/notes/CreateNoteModal";

interface Note {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  type?: "text" | "voice";
  audio_url?: string;
  duration_seconds?: number;
  waveform_data?: number[];
  profiles?: Profile;
}

function getUserById(id: string) {
  return USERS.find((u) => u.id === id) || USERS[0];
}

// ─────────────────────────────────────────────
// STORIES SECTION
// ─────────────────────────────────────────────
function StoriesSection() {
  const { profile } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

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

  return (
    <div className="py-4">
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 pb-2">
        {/* Add Story */}
        <StoryRing
          isAddStory
          hasUnviewed={false}
          label="Add story"
          avatarProps={{
            profile: { id: "me", display_name: "Me", avatar_url: profile?.avatar_url || "" },
          }}
          onClick={() => setIsCreateModalOpen(true)}
        />

        {/* Other Stories */}
        {stories.map((story, index) => {
          const user = story.profiles;
          return (
            <StoryRing
              key={story.id}
              hasUnviewed={true}
              label={user?.display_name?.split(" ")[0] || "User"}
              avatarProps={{
                profile: {
                  id: user?.id,
                  display_name: user?.display_name,
                  avatar_url: user?.avatar_url,
                },
              }}
              onClick={() => setViewerIndex(index)}
            />
          );
        })}
      </div>

      {isCreateModalOpen && (
        <CreateStoryModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
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
            content: { audioUrl: s.media_url }, // fallback for voice
            timestamp: new Date(s.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPOSER
// ─────────────────────────────────────────────
function Composer({ onSubmit, onNoteCreated }: { onSubmit: (c: string) => Promise<any>, onNoteCreated: () => void }) {
  const { profile } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteModalMode, setNoteModalMode] = useState<"text" | "voice">("text");

  const handleSubmit = async () => {
    if (!content.trim() || !profile || loading) return;
    setLoading(true);
    try {
      await onSubmit(content.trim());
      toast.success("Note dropped!");
      setContent("");
    } catch (err: any) {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="glass" className="mx-5 mb-6 p-4">
      <div className="flex items-center gap-3 mb-4">
        <Avatar
          size={40}
          profile={{
            id: profile?.id || "unknown",
            display_name: profile?.display_name || "User",
            avatar_url: profile?.avatar_url || "",
          }}
        />
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="What's on your mind?"
          className="flex-1 bg-transparent text-white placeholder-[var(--color-text-muted)] focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${loading || !content.trim() ? "bg-white/10" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"}`}
        >
          <Send size={18} className="text-white ml-1" />
        </button>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
        <ComposerAction
          icon={AlignLeft}
          label="Note"
          color="#A0AEC0"
          onClick={() => {
            setNoteModalMode("text");
            setIsNoteModalOpen(true);
          }}
        />
        <ComposerAction
          icon={Mic}
          label="Voice Note"
          color="#8B5CF6"
          onClick={() => {
            setNoteModalMode("voice");
            setIsNoteModalOpen(true);
          }}
        />
        <ComposerAction
          icon={Video}
          label="Room"
          color="#EC4899"
          onClick={() => toast("Create room coming soon!")}
        />
        <ComposerAction
          icon={Calendar}
          label="Event"
          color="#00E5FF"
          onClick={() => toast("Create event coming soon!")}
        />
      </div>

      {isNoteModalOpen && (
        <CreateNoteModal
          open={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSuccess={onNoteCreated}
          initialMode={noteModalMode}
        />
      )}
    </Card>
  );
}

function ComposerAction({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group">
      <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center transition-colors group-hover:bg-[var(--color-surface-3)]">
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-[10px] font-semibold text-[var(--color-text-muted)] group-hover:text-white transition-colors">
        {label}
      </span>
    </button>
  );
}

import { useNoteReaction } from "@/hooks/useNoteReaction";

function FeedCard({ 
  note, 
  onDelete,
  onEdit 
}: { 
  note: Note; 
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newContent: string) => void;
}) {
  const { profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  
  const { reacted, counts, toggleReaction } = useNoteReaction(
    note.id, 
    note.reaction_count || 0
  );
  const hasReacted = reacted === "heart";
  const timeString = new Date(note.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isOwner = profile?.id === note.user_id;

  return (
    <Card variant="glass" className="mx-5 mb-5 p-5">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar
            size={44}
            profile={{
              id: note.profiles?.id || "unknown",
              display_name: note.profiles?.display_name || note.profiles?.username || "User",
              avatar_url: note.profiles?.avatar_url || "",
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-[15px] font-bold">
                {note.profiles?.display_name || note.profiles?.username || "User"}
              </span>
              <span className="text-[var(--color-text-muted)] text-[12px] font-medium">{timeAgo(note.created_at)}</span>
            </div>
            <span className="text-[var(--color-text-muted)] text-[12px]">
              @{note.profiles?.username || "user"}
            </span>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[var(--color-text-muted)] hover:text-white transition-colors p-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
          
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-32 bg-[#1A1A1A] border border-[#333] rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {isOwner && onEdit && (
                    <button 
                      onClick={() => {
                        setMenuOpen(false);
                        setIsEditing(true);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-white hover:bg-[#2A2A2A] transition-colors"
                    >
                      Edit Note
                    </button>
                  )}
                  {isOwner && onDelete && (
                    <button 
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(note.id);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-[#2A2A2A] transition-colors"
                    >
                      Delete Note
                    </button>
                  )}
                  <button className="w-full text-left px-4 py-3 text-sm font-medium text-white hover:bg-[#2A2A2A] transition-colors">
                    Report
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-3 mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-[#1A1A1A] text-white border border-[#333] rounded-xl p-3 text-[15px] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditContent(note.content);
              }}
              className="px-4 py-1.5 rounded-full text-sm font-bold text-white bg-[#2A2A2A] hover:bg-[#333] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (editContent.trim() && onEdit) {
                  onEdit(note.id, editContent.trim());
                  setIsEditing(false);
                }
              }}
              className="px-4 py-1.5 rounded-full text-sm font-bold text-white bg-primary hover:bg-pink-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : note.type === "voice" && note.audio_url ? (
        <VoicePlayer
          audioUrl={note.audio_url}
          duration={note.duration_seconds ? `0:${note.duration_seconds}` : "0:18"}
          waveform={note.waveform_data}
        />
      ) : (
        <p className="text-white text-[15px] leading-relaxed mb-4 mt-3">{note.content}</p>
      )}

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => toggleReaction("heart")}
          className={`flex items-center gap-1.5 ${hasReacted ? "text-pink-500" : "text-[var(--color-text-muted)]"} hover:text-pink-500 transition-colors`}
        >
          <Heart size={18} className={hasReacted ? "fill-current" : ""} />
          <span className="text-[12px] font-bold">{counts.heart}</span>
        </motion.button>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// NEW HOME UX SECTIONS
// ─────────────────────────────────────────────
function PeopleToMeetSection() {
  const { profile } = useAuth();
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    async function loadPeople() {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url, follower_count")
        .neq("id", profile!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setPeople(data);
    }
    loadPeople();
  }, [profile]);

  if (people.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-white text-sm font-bold tracking-wide">PEOPLE TO MEET</h2>
        <button className="text-[var(--color-primary)] text-xs font-semibold">See all</button>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 pb-2">
        {people.map((user) => (
          <Card
            key={user.id}
            variant="glass"
            className="min-w-[160px] p-4 flex flex-col items-center text-center"
          >
            <Avatar
              size={60}
              profile={{
                id: user.id,
                display_name: user.display_name || user.username,
                avatar_url: user.avatar_url,
              }}
            />
            <h3 className="text-white font-bold text-sm mt-3">
              {user.display_name?.split(" ")[0] || user.username}
            </h3>
            <p className="text-[var(--color-text-muted)] text-[11px] mt-1 mb-3">
              {user.follower_count || 0} followers
            </p>
            <button className="w-full py-2 bg-primary/20 text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition-colors">
              Wave
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// We've moved ActiveRoomsSection to a dedicated component: LiveRoomsBanner

function OpportunitiesSection() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<any[]>([]);

  useEffect(() => {
    async function loadOpp() {
      const { data } = await supabase
        .from("opportunities")
        .select("id, type, role_needed, location_name, location, title, description")
        .order("created_at", { ascending: false })
        .limit(3);
      if (data) setOpportunities(data);
    }
    loadOpp();
  }, []);

  if (opportunities.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-white text-sm font-bold tracking-wide">OPPORTUNITIES</h2>
        <button
          onClick={() => navigate("/opportunities")}
          className="text-[var(--color-primary)] text-xs font-semibold"
        >
          See all
        </button>
      </div>
      <div className="px-5 flex flex-col gap-3">
        {opportunities.map((opp) => (
          <Card key={opp.id} variant="glass" className="p-4 border-l-4 border-l-pink-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-pink-400 text-[10px] font-bold uppercase tracking-wider">
                {opp.type || opp.role_type}
              </span>
              <span className="text-[var(--color-text-muted)] text-[10px]">
                {opp.location_name || opp.location || "Remote"}
              </span>
            </div>
            <h3 className="text-white font-bold text-[15px] mb-1">{opp.title}</h3>
            <p className="text-[var(--color-text-muted)] text-xs mb-3 line-clamp-2">
              {opp.description}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/opportunities")}
                className="flex-1 py-2 bg-primary text-white font-bold text-xs rounded-xl"
              >
                Apply
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────
import { AnalyticsAI } from "@/services/ai/AnalyticsAI";

export function Home() {
  const { profile } = useAuth();
  const { notes, loading, createNote, deleteNote, editNote, refreshNotes } = useNotes();

  useEffect(() => {
    if (profile) {
      AnalyticsAI.trackEvent(profile.id, "page_view", "home");
    }
  }, [profile]);

  return (
    <div className="flex flex-col min-h-[100dvh] pb-32 pt-2">
      {/* 1. Stories */}
      <StoriesSection />

      {/* 2. Composer */}
      <div className="z-10 relative">
        <Composer 
          onSubmit={(content) => createNote(content, "text")}
          onNoteCreated={refreshNotes} 
        />
      </div>

      {/* 3. Active Voice Rooms */}
      <LiveRoomsBanner />

      {/* 3. People To Meet (Discovery Injected) */}
      <PeopleToMeetSection />

      {/* 4. Creator Opportunities */}
      <OpportunitiesSection />

      {/* 5. Trending Notes (Conversations) */}
      <div className="px-5 mb-3 mt-4">
        <h2 className="text-white text-sm font-bold tracking-wide">TRENDING CONVERSATIONS</h2>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <PremiumEmptyState
            icon={AlignLeft}
            title="No Conversations Yet"
            description="Start a conversation. Ask a question or share an idea."
            glowColor="primary"
            action={{
              label: "Ask a Question",
              onClick: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                // Focus the composer input after scrolling
                setTimeout(() => {
                  const input = document.querySelector<HTMLInputElement>('input[placeholder="What\'s on your mind?"]');
                  input?.focus();
                }, 500);
              },
            }}
          />
        ) : (
          <div>
            {notes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <FeedCard note={note} onDelete={deleteNote} onEdit={editNote} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
