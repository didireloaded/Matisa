import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  MessageSquare,
  Loader2,
  MapPin,
  Grid3X3,
  Mic,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type { Post } from "@/types";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { useSaves } from "@/hooks/useSaves";
import { FollowButton } from "@/components/common/FollowButton";
import { VoicePlayer } from "@/components/ui/VoicePlayer";
import { Avatar } from "@/components/common/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageService } from "@/services/messages";
import { toast } from "sonner";

export function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("notes");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [crewProfile, setCrewProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const targetId = id || currentUser?.id;
  const isOwnProfile = targetId === currentUser?.id;

  const PROFILE_TABS = isOwnProfile
    ? [
        { id: "notes", label: "Notes" },
        { id: "voice", label: "Voice" },
        { id: "rooms", label: "Rooms" },
        { id: "saved", label: "Saved" },
        { id: "crew", label: "Crew" },
      ]
    : [
        { id: "notes", label: "Notes" },
        { id: "voice", label: "Voice" },
        { id: "rooms", label: "Rooms" },
        { id: "crew", label: "Crew" },
      ];

  const { fetchSavedPosts } = useSaves();

  useEffect(() => {
    if (activeTab === "saved" && isOwnProfile) {
      fetchSavedPosts();
    }
  }, [activeTab, isOwnProfile, fetchSavedPosts]);

  useEffect(() => {
    async function loadProfile() {
      if (!targetId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select(
            "id, username, display_name, avatar_url, bio, location, follower_count, following_count",
          )
          .eq("id", targetId)
          .single();

        if (profileData) setUserProfile(profileData);

        const { data: postsData } = await supabase
          .from("posts")
          .select(
            "id, user_id, content, created_at, image_url, likes_count, comments_count, media, shares_count, is_public, updated_at",
          )
          .eq("user_id", targetId)
          .order("created_at", { ascending: false });

        if (postsData) setPosts(postsData as any as Post[]);

        const { data: crewData } = await supabase
          .from("crew_profiles")
          .select("id, categories, availability, hourly_rate, portfolio_url")
          .eq("id", targetId)
          .single();

        if (crewData) setCrewProfile(crewData);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [targetId]);

  return (
    <div className="flex flex-col min-h-full pb-28 relative bg-[var(--color-background)]">
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 mt-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mb-4" />
        </div>
      ) : !userProfile ? (
        <div className="flex-1 flex flex-col bg-[var(--color-background)]">
          {/* Gradient header */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] via-[#EC4899] to-[#FF416C]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <h1 className="text-white text-3xl font-display font-bold tracking-tight mb-1">Matisa</h1>
              <p className="text-white/70 text-sm font-medium">Namibia's Creative Platform</p>
            </div>
          </div>

          <div className="px-6 -mt-2 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-xl opacity-30 rounded-full bg-[#8B5CF6]" />
              <div className="relative w-20 h-20 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
                <SettingsIcon className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
              {!targetId ? "Join the Community" : "User Not Found"}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] max-w-[280px] mb-8 leading-relaxed">
              {!targetId
                ? "Sign in to create your profile, connect with creators, and share your talent."
                : "This account doesn't exist or has been removed."}
            </p>

            {/* Feature highlights */}
            {!targetId && (
              <div className="w-full space-y-3 mb-8">
                {[
                  { icon: "🎤", label: "Share voice notes & stories" },
                  { icon: "🤝", label: "Connect with Namibian creators" },
                  { icon: "💼", label: "Find gigs & opportunities" },
                  { icon: "🎵", label: "Join live voice rooms" },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)] rounded-2xl border border-[var(--color-border)]"
                  >
                    <span className="text-xl">{feature.icon}</span>
                    <span className="text-sm text-white/80 font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate(!targetId ? "/auth" : "/")}
              className="w-full max-w-[280px] px-6 py-3.5 rounded-full bg-[var(--color-primary)] text-white font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            >
              {!targetId ? "Sign In / Create Account" : "Go Home"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Cover */}
          <div className="relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div
              className="h-40"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-background) 0%, var(--color-primary) 100%)",
                opacity: 0.8,
              }}
            />

            {/* Avatar & Actions */}
            <div className="absolute -bottom-10 left-5 flex items-end justify-between w-[calc(100%-40px)]">
              <div className="relative rounded-full p-1 bg-[var(--color-background)]">
                <Avatar
                  size={80}
                  profile={{
                    id: userProfile.id,
                    display_name: userProfile.display_name,
                    avatar_url: userProfile.avatar_url,
                  }}
                />
              </div>

              <div className="flex gap-2 mb-2">
                {isOwnProfile ? (
                  <Link to="/settings">
                    <Button variant="glass" size="sm" className="h-8 text-xs font-semibold px-4">
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <>
                    <FollowButton userId={targetId as string} />
                    <Button
                      variant="glass"
                      size="sm"
                      className="h-8 text-xs font-semibold px-4"
                      onClick={async () => {
                        try {
                          const convId = await MessageService.getOrCreateConversation(
                            currentUser?.id as string,
                            targetId as string,
                          );
                          if (convId) navigate(`/messages/${convId}`);
                          else toast.error("Could not start conversation");
                        } catch (err) {
                          toast.error("Failed to start conversation");
                        }
                      }}
                    >
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-5 pt-14 pb-4">
            <h1 className="text-white text-2xl font-bold tracking-tight mb-0.5">
              {userProfile.display_name || userProfile.full_name || "Anonymous"}
            </h1>
            <p className="text-[var(--color-text-muted)] text-sm mb-3">
              @{userProfile.username || userProfile.id.slice(0, 8)}
            </p>

            {userProfile.bio && (
              <p className="text-white/80 text-sm leading-relaxed mb-4">{userProfile.bio}</p>
            )}

            {/* Badges / Stats */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full uppercase tracking-wider text-[10px] font-bold">
                Available
              </span>
              {userProfile.location && (
                <span className="px-3 py-1 bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-full uppercase tracking-wider text-[10px] font-bold flex items-center gap-1">
                  <MapPin size={10} />
                  {userProfile.location}
                </span>
              )}
              {userProfile.role && (
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full uppercase tracking-wider text-[10px] font-bold">
                  {userProfile.role}
                </span>
              )}
            </div>

            {/* Voice Intro */}
            {userProfile.voice_intro_url && (
              <div className="mb-6">
                <VoicePlayer
                  audioUrl={userProfile.voice_intro_url}
                  duration="0:30"
                  waveform={[4, 8, 12, 16, 12, 8, 14, 10, 6, 12, 18]}
                />
              </div>
            )}

            {/* Active Rooms */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-4">
              <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl px-4 py-2.5 flex items-center gap-2 shrink-0">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                <span className="text-xs text-[var(--color-primary)] font-bold tracking-wide">
                  In Room: Creator Chat
                </span>
              </div>
            </div>

            {/* Connections */}
            <div className="flex items-center gap-6 mb-6 pt-4 border-t border-[var(--color-border)]">
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg">
                  {userProfile.follower_count || 0}
                </span>
                <span className="text-[var(--color-text-muted)] text-xs font-medium">
                  Followers
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg">
                  {userProfile.following_count || 0}
                </span>
                <span className="text-[var(--color-text-muted)] text-xs font-medium">
                  Following
                </span>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="px-5 mb-4">
            <Tabs
              variant="pill"
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={PROFILE_TABS}
            />
          </div>

          {/* Content Feed */}
          <div className="px-5">
            {activeTab === "crew" ? (
              <div className="space-y-4">
                {crewProfile ? (
                  <Card variant="solid" className="p-5">
                    <h3 className="text-white font-bold text-lg mb-2">Crew Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-bold">
                          Categories
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {crewProfile.categories?.map((cat: string) => (
                            <span
                              key={cat}
                              className="px-2 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs rounded-lg font-semibold"
                            >
                              {cat}
                            </span>
                          )) || <span className="text-white/50 text-sm">None set</span>}
                        </div>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-bold">
                          Availability
                        </span>
                        <p className="text-white text-sm capitalize">
                          {crewProfile.availability || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-bold">
                          Hourly Rate
                        </span>
                        <p className="text-white text-sm">
                          {crewProfile.hourly_rate
                            ? `$${crewProfile.hourly_rate}/hr`
                            : "Negotiable"}
                        </p>
                      </div>
                      {crewProfile.portfolio_url && (
                        <div>
                          <span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-bold">
                            Portfolio
                          </span>
                          <a
                            href={crewProfile.portfolio_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-[var(--color-primary)] text-sm underline truncate"
                          >
                            {crewProfile.portfolio_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card
                    variant="solid"
                    className="p-8 flex flex-col items-center justify-center text-center"
                  >
                    <Grid3X3 className="text-[var(--color-text-muted)] mb-3" size={24} />
                    <h3 className="text-white font-bold mb-1">No Crew Profile</h3>
                    <p className="text-[var(--color-text-muted)] text-sm">
                      {isOwnProfile
                        ? "Set up your crew profile in settings to get hired."
                        : "This user hasn't set up a crew profile."}
                    </p>
                  </Card>
                )}
              </div>
            ) : posts.length === 0 ? (
              <Card
                variant="solid"
                className="p-8 flex flex-col items-center justify-center text-center"
              >
                <Grid3X3 className="text-[var(--color-text-muted)] mb-3" size={24} />
                <h3 className="text-white font-bold mb-1">No Posts Yet</h3>
                <p className="text-[var(--color-text-muted)] text-sm">
                  When they post something, it will show up here.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Map through posts and render FeedCards... for now just show a simple list */}
                {posts.map((p) => (
                  <Card key={p.id} variant="solid" className="p-4">
                    <p className="text-white text-sm">{p.content}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
