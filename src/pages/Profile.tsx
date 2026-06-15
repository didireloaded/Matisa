import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Settings as SettingsIcon, MessageSquare, Loader2, MapPin, Link2, BookOpen, Heart, Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import type { Post } from "@/types";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { useSaves } from "@/hooks/useSaves";
import { FollowButton } from "@/components/common/FollowButton";

export function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("Posts");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const targetId = id || currentUser?.id;
  const isOwnProfile = targetId === currentUser?.id;
  const PROFILE_TABS = isOwnProfile ? ["Posts", "Media", "Liked", "Saved"] : ["Posts", "Media", "Liked"];
  const { savedPosts, fetchSavedPosts, loading: savesLoading } = useSaves();

  useEffect(() => {
    if (activeTab === "Saved" && isOwnProfile) {
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
    <div className="flex flex-col min-h-full pb-28 relative bg-[#0B0B0B]">
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 mt-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9D2E] mb-4" />
          <span className="text-white/50 text-sm">Loading profile...</span>
        </div>
      ) : !userProfile ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 mt-10">
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
          {/* Cover + Avatar */}
          <div className="relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div
              className="h-36"
              style={{
                background: "linear-gradient(135deg, #1a0a00 0%, #2d0d5a 50%, #0a1a00 100%)",
              }}
            />
            <div className="absolute bottom-0 translate-y-1/2 left-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#0B0B0B]">
                  <ImageWithFallback 
                     src={userProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.id}`} 
                     alt={userProfile.display_name} 
                     className="w-full h-full object-cover" 
                  />
                </div>
                {/* Verified badge placeholder */}
                {userProfile.follower_count > 1000 && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#FF9D2E] rounded-full flex items-center justify-center border-2 border-[#0B0B0B]">
                    <span className="text-[9px] text-black font-bold">✓</span>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-3 right-4 flex gap-2">
              {isOwnProfile ? (
                <Link to="/settings" className="px-4 py-1.5 rounded-full bg-[#151515] border border-white/10 text-white/70 text-xs flex items-center gap-1.5 transition hover:bg-white/10">
                  <SettingsIcon size={12} />
                  Edit Profile
                </Link>
              ) : (
                <>
                  <FollowButton userId={targetId as string} />
                  <button onClick={() => navigate("/messages")} className="px-4 py-1.5 rounded-full bg-[#151515] border border-white/10 text-white/70 text-xs flex items-center gap-1.5 transition hover:bg-white/10">
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile info */}
          <div className="px-5 pt-14 pb-4">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-white text-xl font-extrabold">{userProfile.display_name || userProfile.full_name || "Anonymous"}</h1>
              {userProfile.follower_count > 1000 && <span className="text-[#FF9D2E] text-sm">✓</span>}
            </div>
            <p className="text-white/40 text-sm mb-2">@{userProfile.username || userProfile.id.slice(0, 8)}</p>
            {userProfile.bio && (
               <p className="text-white/70 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{userProfile.bio}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-white/40 mb-4">
              <span className="flex items-center gap-1"><MapPin size={11} />Namibia</span>
              <span className="flex items-center gap-1"><Link2 size={11} />matisa.na/@{userProfile.username || userProfile.id.slice(0, 8)}</span>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-white text-base font-bold">{userProfile.follower_count > 1000 ? (userProfile.follower_count / 1000).toFixed(1) + 'K' : userProfile.follower_count || 0}</p>
                <p className="text-white/40 text-xs">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-white text-base font-bold">{userProfile.following_count || 0}</p>
                <p className="text-white/40 text-xs">Following</p>
              </div>
              <div className="text-center">
                <p className="text-white text-base font-bold">{posts.length}</p>
                <p className="text-white/40 text-xs">Posts</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5 px-4 mb-4 mt-2 overflow-x-auto scrollbar-hide">
            {PROFILE_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="flex-1 py-3 px-4 min-w-max text-sm transition relative"
                style={{ color: activeTab === t ? "#FF9D2E" : "rgba(255,255,255,0.4)", fontWeight: activeTab === t ? 700 : 400 }}
              >
                {t}
                {activeTab === t && (
                  <motion.div
                    layoutId="profile-tab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-7 rounded-full bg-[#FF9D2E]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "Posts" && (
            <div className="px-4 space-y-3">
              {posts.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <BookOpen size={32} className="text-white/20 mb-3" />
                  <p className="text-white/40 text-sm">No posts yet</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-[#151515] rounded-2xl p-4 border border-white/5">
                    <p className="text-white/80 text-sm leading-relaxed">{post.type === "voice" ? "🎵 Voice Note" : post.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-white/30 text-xs flex items-center gap-1"><Heart size={11} />{post.like_count || 0}</span>
                      <span className="text-white/30 text-xs">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "Media" && (
            <div className="flex flex-col items-center py-16">
              <Grid3X3 size={32} className="text-white/20 mb-3" />
              <p className="text-white/40 text-sm">Media appears here</p>
            </div>
          )}

          {activeTab === "Liked" && (
            <div className="flex flex-col items-center py-16">
              <Heart size={32} className="text-white/20 mb-3" />
              <p className="text-white/40 text-sm">Liked posts appear here</p>
            </div>
          )}

          {activeTab === "Saved" && isOwnProfile && (
            <div className="px-4 space-y-3">
              {savesLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#FF9D2E]" /></div>
              ) : savedPosts.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <BookmarkIcon size={32} className="text-white/20 mb-3" />
                  <p className="text-white/40 text-sm">No saved posts yet</p>
                </div>
              ) : (
                savedPosts.map((post) => (
                  <div key={post.id} className="bg-[#151515] rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageWithFallback src={post.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} alt="avatar" className="w-5 h-5 rounded-full" />
                      <span className="text-xs text-white/50">@{post.profiles?.username || "user"}</span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{post.type === "voice" ? "🎵 Voice Note" : post.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-white/30 text-xs flex items-center gap-1"><Heart size={11} />{post.like_count || 0}</span>
                      <span className="text-white/30 text-xs">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
