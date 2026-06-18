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

interface Note {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  type?: "text" | "voice";
  voice_url?: string;
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
          onClick={() => toast("Create story")}
        />

        {/* Your Story */}
        <StoryRing
          hasUnviewed={false}
          label="Your Story"
          avatarProps={{
            profile: { id: "me", display_name: "Me", avatar_url: profile?.avatar_url || "" },
          }}
          onClick={() => toast("View your story")}
        />

        {/* Other Stories */}
        {STORIES.map((story) => {
          const user = getUserById(story.userId);
          return (
            <StoryRing
              key={story.id}
              hasUnviewed={story.hasNew}
              label={user.name.split(" ")[0]}
              avatarProps={{
                profile: { id: user.id, display_name: user.name, avatar_url: user.avatar },
              }}
              onClick={() => toast(`Opening story: ${user.name}`)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPOSER
// ─────────────────────────────────────────────
function Composer() {
  const { profile } = useAuth();

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
          placeholder="What's on your mind?"
          className="flex-1 bg-transparent text-white placeholder-[var(--color-text-muted)] focus:outline-none"
        />
        <button className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary-light)] transition-colors">
          <Send size={18} className="text-white ml-1" />
        </button>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
        <ComposerAction icon={AlignLeft} label="Note" color="#A0AEC0" />
        <ComposerAction icon={Mic} label="Voice Note" color="#8B5CF6" />
        <ComposerAction icon={Video} label="Room" color="#EC4899" />
        <ComposerAction icon={Calendar} label="Event" color="#00E5FF" />
      </div>
    </Card>
  );
}

function ComposerAction({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <button className="flex flex-col items-center gap-1.5 group">
      <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center transition-colors group-hover:bg-[var(--color-surface-3)]">
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-[10px] font-semibold text-[var(--color-text-muted)] group-hover:text-white transition-colors">
        {label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
// FEED CARD
// ─────────────────────────────────────────────
function FeedCard({ note }: { note: Note }) {
  const [reacted, setReacted] = useState(false);
  const timeString = new Date(note.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
              <span className="text-[var(--color-text-muted)] text-[12px] font-medium">2m ago</span>
            </div>
            <span className="text-[var(--color-text-muted)] text-[12px]">
              @{note.profiles?.username || "user"}
            </span>
          </div>
        </div>
        <button className="text-[var(--color-text-muted)] hover:text-white transition-colors">
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
      </div>

      {note.type === "voice" && note.voice_url ? (
        <VoicePlayer
          audioUrl={note.voice_url}
          duration={note.duration_seconds ? `0:${note.duration_seconds}` : "0:18"}
          waveform={note.waveform_data}
        />
      ) : (
        <p className="text-white text-[15px] leading-relaxed mb-4 mt-3">{note.content}</p>
      )}

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
        <button
          onClick={() => setReacted(!reacted)}
          className={`flex items-center gap-1.5 ${reacted ? "text-pink-500" : "text-[var(--color-text-muted)]"} hover:text-pink-500 transition-colors`}
        >
          <Heart size={18} className={reacted ? "fill-current" : ""} />
          <span className="text-[12px] font-bold">{reacted ? 25 : 24}</span>
        </button>
        <button className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-white transition-colors">
          <MessageCircle size={18} />
          <span className="text-[12px] font-bold">Reply</span>
        </button>
        <button className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-purple-400 transition-colors">
          <Mic size={18} />
          <span className="text-[12px] font-bold">Voice Reply</span>
        </button>
        <button className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-white transition-colors ml-auto bg-surface-2 px-3 py-1.5 rounded-full">
          <span className="text-[12px] font-bold">Join Discussion</span>
        </button>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// NEW HOME UX SECTIONS
// ─────────────────────────────────────────────
function PeopleToMeetSection() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-white text-sm font-bold tracking-wide">PEOPLE TO MEET</h2>
        <button className="text-[var(--color-primary)] text-xs font-semibold">See all</button>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 pb-2">
        {USERS.slice(1, 4).map((user) => (
          <Card
            key={user.id}
            variant="glass"
            className="min-w-[160px] p-4 flex flex-col items-center text-center"
          >
            <Avatar
              size={60}
              profile={{ id: user.id, display_name: user.name, avatar_url: user.avatar }}
            />
            <h3 className="text-white font-bold text-sm mt-3">{user.name.split(" ")[0]}</h3>
            <p className="text-[var(--color-text-muted)] text-[11px] mt-1 mb-3">
              3 mutual connections 🤝
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

function ActiveRoomsSection() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-white text-sm font-bold tracking-wide">LIVE ROOMS</h2>
        <button className="text-[var(--color-primary)] text-xs font-semibold">See all</button>
      </div>
      <div className="px-5 flex flex-col gap-3">
        <Card
          variant="glass"
          className="p-4 flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-colors"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live Now
            </span>
            <h3 className="text-white font-bold text-sm">Late Night R&B Vibes 🎶</h3>
            <p className="text-[var(--color-text-muted)] text-[11px] mt-1">
              Host: Sarah • 14 listening
            </p>
          </div>
          <button className="px-4 py-2 bg-white text-black font-bold text-xs rounded-full">
            Join
          </button>
        </Card>
      </div>
    </div>
  );
}

function OpportunitiesSection() {
  const navigate = useNavigate();
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
        <Card variant="glass" className="p-4 border-l-4 border-l-pink-500">
          <div className="flex justify-between items-start mb-2">
            <span className="text-pink-400 text-[10px] font-bold uppercase tracking-wider">
              Collab Request
            </span>
            <span className="text-[var(--color-text-muted)] text-[10px]">Los Angeles</span>
          </div>
          <h3 className="text-white font-bold text-[15px] mb-1">Looking for a Videographer</h3>
          <p className="text-[var(--color-text-muted)] text-xs mb-3">
            Shooting a music video this weekend. Need someone with a drone.
          </p>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-primary text-white font-bold text-xs rounded-xl">
              Apply
            </button>
            <button className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-xl">
              Message
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────
export function Home() {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("*, profiles(*)")
          .gt("created_at", new Date(Date.now() - 86400000).toISOString())
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotes((data as any[]) || []);
      } catch (e) {
        console.warn("Failed to fetch notes", e);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [profile]);

  return (
    <div className="flex flex-col min-h-[100dvh] pb-32 pt-2">
      {/* 1. Stories */}
      <StoriesSection />

      {/* 2. Active Voice Rooms */}
      <ActiveRoomsSection />

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
              onClick: () => toast.success("Opening composer..."),
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
                <FeedCard note={note} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
