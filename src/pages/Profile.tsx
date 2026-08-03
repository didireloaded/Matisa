import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Settings as SettingsIcon,
  MessageCircle,
  MapPin,
  Mic,
  Calendar,
  Bookmark,
  Video,
  FileText,
  Edit,
  Share2,
} from "lucide-react";
import { VoiceIntroPlayer } from "@/components/voice/VoiceIntroPlayer";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/common/Avatar";
import { toast } from "sonner";
import { USERS } from "@/data/dummy";

export function Profile() {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const { profile: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"notes" | "voice" | "events" | "videos" | "saved">(
    "notes",
  );
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile =
    !username || username === currentUser?.username || username === currentUser?.id;

  useEffect(() => {
    async function loadProfileData() {
      setLoading(true);
      try {
        if (isOwnProfile && currentUser) {
          setUserProfile(currentUser);
        } else {
          const searchVal = username || "";
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .or(`username.eq.${searchVal},id.eq.${searchVal}`)
            .maybeSingle();

          if (data) {
            setUserProfile(data);
          } else {
            setUserProfile({
              id: "dummy-user",
              display_name: USERS[0].name,
              username: USERS[0].username,
              avatar_url: USERS[0].avatar,
              bio: USERS[0].bio || "Namibian content creator & story teller.",
              location: "Windhoek, Namibia",
              followers_count: 1240,
              following_count: 380,
            });
          }
        }

        // Fetch profile notes
        const targetId = userProfile?.id || currentUser?.id;
        if (targetId) {
          const { data: notesData } = await supabase
            .from("notes")
            .select("*")
            .eq("author_id", targetId)
            .order("created_at", { ascending: false });

          if (notesData) setUserNotes(notesData);
        }
      } catch (err) {
        console.error("Error loading profile", err);
      }
      {
        setLoading(false);
      }
    }
    loadProfileData();
  }, [username, currentUser, isOwnProfile]);

  const profileData = userProfile || {
    display_name: currentUser?.display_name || "Hanna Dowie",
    username: currentUser?.username || "hanna_d",
    avatar_url: currentUser?.avatar_url || USERS[0].avatar,
    bio: "Windhoek born 🌿 Creative director & storyteller",
    location: "Windhoek, Namibia",
    followers_count: 1240,
    following_count: 380,
  };

  const tabs = [
    { id: "notes", label: "Notes", icon: FileText },
    { id: "voice", label: "Voice", icon: Mic },
    { id: "events", label: "Events", icon: Calendar },
    { id: "videos", label: "Videos", icon: Video },
    ...(isOwnProfile ? [{ id: "saved", label: "Saved", icon: Bookmark }] : []),
  ];

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* 1. Cover Header Banner */}
      <div className="relative h-44 w-full bg-gradient-to-r from-[#FF9D2E]/40 via-[#24A3C7]/40 to-[#6139F2]/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#06101D] via-transparent to-transparent" />

        {isOwnProfile && (
          <button
            onClick={() => navigate("/settings")}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition active:scale-95 border border-white/20 z-10"
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </button>
        )}
      </div>

      {/* 2. User Info & Avatar Overlay */}
      <div className="px-5 -mt-16 relative z-10 space-y-3">
        <div className="flex items-end justify-between">
          <div className="relative">
            <div className="h-24 w-24 rounded-full p-1 bg-[#06101D] shadow-2xl">
              <Avatar
                size={88}
                profile={{
                  id: profileData.id || "me",
                  display_name: profileData.display_name,
                  avatar_url: profileData.avatar_url,
                }}
                className="w-full h-full"
              />
            </div>
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-[#35C67A] border-2 border-[#06101D]" />
          </div>

          <div className="flex items-center gap-2 mb-1">
            {isOwnProfile ? (
              <button
                onClick={() => toast.info("Opening Edit Profile...")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-panel text-white text-xs font-bold border border-white/20 hover:bg-white/10 transition active:scale-95"
              >
                <Edit size={14} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsFollowing((prev) => !prev)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition active:scale-95 ${
                    isFollowing
                      ? "glass-panel text-white border border-white/20"
                      : "bg-[#24A3C7] text-white shadow-lg"
                  }`}
                >
                  {isFollowing ? "Following" : "+ Follow"}
                </button>
                <button
                  onClick={() => navigate("/messages")}
                  className="flex h-9 w-9 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition border border-white/20"
                >
                  <MessageCircle size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Display Name & Handle */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {profileData.display_name}
          </h1>
          <p className="text-xs text-white/50">@{profileData.username}</p>

          {profileData.location && (
            <div className="flex items-center gap-1 text-[11px] text-[#39B7F2] font-semibold mt-1">
              <MapPin size={12} />
              <span>{profileData.location}</span>
            </div>
          )}

          {profileData.bio && (
            <p className="text-xs text-white/80 leading-relaxed mt-2">{profileData.bio}</p>
          )}
        </div>

        {/* Voice Introduction */}
        <div className="mt-3">
          <VoiceIntroPlayer
            audioUrl={profileData.voice_intro_url || null}
            isOwner={isOwnProfile}
            profileId={profileData.id || "me"}
            onUpdated={(url) => {
              setUserProfile((prev: any) => (prev ? { ...prev, voice_intro_url: url } : prev));
            }}
          />
        </div>

        {/* Followers / Following Stats */}
        <div className="flex items-center gap-5 pt-1 text-xs">
          <div>
            <span className="font-bold text-white text-sm">
              {profileData.followers_count || 1240}
            </span>{" "}
            <span className="text-white/50">Followers</span>
          </div>
          <div>
            <span className="font-bold text-white text-sm">
              {profileData.following_count || 380}
            </span>{" "}
            <span className="text-white/50">Following</span>
          </div>
        </div>
      </div>

      {/* 3. Reelio 5 Profile Category Tabs */}
      <div className="px-5 mt-5 border-b border-white/10">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-1.5 py-3 px-2 border-b-2 text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? "border-[#24A3C7] text-[#39B7F2]"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tab Content Feed Area */}
      <div className="px-5 mt-4 flex-1">
        {activeTab === "notes" && (
          <div className="space-y-3">
            {userNotes.length > 0 ? (
              userNotes.map((note) => (
                <div key={note.id} className="glass-panel p-4 rounded-[22px] text-xs text-white">
                  {note.content}
                </div>
              ))
            ) : (
              <div className="glass-panel p-8 text-center rounded-[24px] text-white/50 text-xs">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                No permanent notes posted yet.
              </div>
            )}
          </div>
        )}

        {activeTab === "voice" && (
          <div className="glass-panel p-8 text-center rounded-[24px] text-white/50 text-xs">
            <Mic size={32} className="mx-auto mb-2 opacity-30" />
            No voice notes or voicemails published yet.
          </div>
        )}

        {activeTab === "events" && (
          <div className="glass-panel p-8 text-center rounded-[24px] text-white/50 text-xs">
            <Calendar size={32} className="mx-auto mb-2 opacity-30" />
            No upcoming hosted events.
          </div>
        )}

        {activeTab === "videos" && (
          <div className="glass-panel p-8 text-center rounded-[24px] text-white/50 text-xs">
            <Video size={32} className="mx-auto mb-2 opacity-30" />
            No video broadcasts recorded.
          </div>
        )}

        {activeTab === "saved" && isOwnProfile && (
          <div className="glass-panel p-8 text-center rounded-[24px] text-white/50 text-xs">
            <Bookmark size={32} className="mx-auto mb-2 opacity-30" />
            Your saved notes and events collection is empty.
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
