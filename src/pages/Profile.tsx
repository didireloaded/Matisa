import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Settings as SettingsIcon, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Avatar } from "@/components/common/Avatar";
import type { Post } from "@/types";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
export function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"Posts" | "Video" | "Tagged" | "notes">("Posts");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const targetId = id || currentUser?.id;
  const isOwnProfile = targetId === currentUser?.id;

  useEffect(() => {
    async function loadProfile() {
      if (!targetId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        // Fetch Profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", targetId)
          .single();

        if (profileData) {
          setUserProfile(profileData);
        }

        // Fetch Posts
        const { data: postsData } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", targetId)
          .order("created_at", { ascending: false });

        if (postsData) {
          setPosts(postsData as Post[]);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [targetId]);

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground pb-28 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 pt-4 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-white/70 hover:text-white transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {isOwnProfile ? (
          <Link
            to="/settings"
            className="p-2 -mr-2 text-white/70 hover:text-white transition bg-white/5 rounded-full"
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 mt-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <span className="text-white/50 text-sm">Loading profile...</span>
        </div>
      ) : !userProfile ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
          <PremiumEmptyState
            icon={!targetId ? SettingsIcon : MessageSquare}
            title={!targetId ? "Sign In Required" : "User Not Found"}
            description={
              !targetId
                ? "Create an account to set up your profile, track your activity, and connect with other creators."
                : "This account may have been deleted or does not exist."
            }
            action={
              !targetId
                ? { label: "Sign In / Sign Up", onClick: () => navigate("/auth") }
                : { label: "Go Home", onClick: () => navigate("/") }
            }
            glowColor="primary"
          />
        </div>
      ) : (
        <>
          {/* Profile Info Header */}
          <div className="px-6 flex flex-col mt-4">
            <div className="flex items-center gap-5">
              {/* Avatar with Gradient Ring */}
              <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#FF416C] to-[#8E2DE2] flex-shrink-0 relative">
                <div className="absolute inset-0 rounded-full bg-background border-4 border-background flex items-center justify-center overflow-hidden">
                  <Avatar profile={userProfile} size={88} />
                </div>
              </div>

              {/* Details & Actions */}
              <div className="flex flex-col flex-1">
                <h1 className="text-2xl font-bold tracking-wide">
                  {userProfile.display_name || userProfile.full_name || "Anonymous"}
                </h1>
                <span className="text-sm text-white/50 mb-4">
                  @{userProfile.username || userProfile.id.slice(0, 8)}
                </span>

                <div className="flex items-center gap-3">
                  {isOwnProfile ? (
                    <Link
                      to="/settings"
                      className="flex-1 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold text-center transition border border-white/5"
                    >
                      Edit Profile
                    </Link>
                  ) : (
                    <>
                      <button className="flex-1 py-2 rounded-full bg-[#FF416C] hover:bg-[#ff5b80] text-sm font-semibold transition shadow-[0_0_15px_rgba(255,65,108,0.3)]">
                        Follow
                      </button>
                      <button className="flex-1 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold transition border border-white/5">
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {userProfile.bio && (
              <p className="mt-6 text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                {userProfile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-6 bg-card p-4 rounded-3xl border border-border">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold">{posts.length}</span>
                <span className="text-[11px] text-white/50">Posts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold">{userProfile.followers_count || 0}</span>
                <span className="text-[11px] text-white/50">Followers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold">{userProfile.following_count || 0}</span>
                <span className="text-[11px] text-white/50">Following</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex border-b border-card">
            <button
              onClick={() => setActiveTab("Posts")}
              className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === "Posts" ? "text-white" : "text-white/40 hover:text-white/70"}`}
            >
              Posts
              {activeTab === "Posts" && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#FF416C] to-[#8E2DE2] rounded-t-full shadow-[0_0_10px_rgba(255,65,108,0.5)]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === "notes" ? "text-white" : "text-white/40 hover:text-white/70"}`}
            >
              Notes
              {activeTab === "notes" && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#FF416C] to-[#8E2DE2] rounded-t-full shadow-[0_0_10px_rgba(255,65,108,0.5)]" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-background pt-6 pb-24">
            {activeTab === "Posts" && (
              <div className="px-6">
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-white/40 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/10">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="font-medium">No posts yet</p>
                  </div>
                ) : (
                  <div className="columns-2 gap-4 space-y-4">
                    {posts.map((post, i) => (
                      <div
                        key={post.id}
                        className={`relative rounded-[24px] overflow-hidden break-inside-avoid bg-card group border border-white/5 shadow-lg
                      ${i % 3 === 0 ? "h-64" : i % 2 === 0 ? "h-48" : "h-56"}
                    `}
                      >
                        {/* Media representation (Gradient background) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-card to-background/50" />

                        {/* Text Preview */}
                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                          <p className="text-sm text-white/90 line-clamp-4 leading-relaxed font-medium">
                            {post.type === "voice" ? "🎵 Voice Note" : post.content}
                          </p>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-white/90 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md flex items-center gap-1 border border-white/10">
                              ❤️ {post.like_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex flex-col items-center justify-center h-48 text-center text-white/40 space-y-3">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/10">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="font-medium">No notes yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
