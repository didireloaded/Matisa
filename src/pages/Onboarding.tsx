import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { AudioRecorder } from "@/components/ui/AudioRecorder";
import {
  UserPlus,
  Check,
  Camera,
  Music,
  Video,
  Gamepad,
  Briefcase,
  Shirt,
  Dumbbell,
  Car,
  Plane,
  Cpu,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";

const INTERESTS = [
  { id: "Music", icon: Music },
  { id: "Film", icon: Video },
  { id: "Photography", icon: Camera },
  { id: "Gaming", icon: Gamepad },
  { id: "Business", icon: Briefcase },
  { id: "Fashion", icon: Shirt },
  { id: "Fitness", icon: Dumbbell },
  { id: "Cars", icon: Car },
  { id: "Travel", icon: Plane },
  { id: "Technology", icon: Cpu },
];

export function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSavingInterests, setIsSavingInterests] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  useEffect(() => {
    if (step === 5) {
      supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .neq("id", profile?.id)
        .limit(3)
        .then(({ data }) => {
          if (data) setSuggestedUsers(data);
        });
    }
  }, [step, profile]);

  const handleNext = () => setStep((s) => s + 1);

  const saveInterests = async () => {
    if (selectedInterests.length === 0) {
      toast.error("Please pick at least one interest");
      return;
    }
    setIsSavingInterests(true);
    try {
      if (profile) {
        const inserts = selectedInterests.map((interest) => ({
          profile_id: profile.id,
          interest,
        }));
        await supabase.from("profile_interests").upsert(inserts);
      }
      handleNext();
    } catch (err: any) {
      toast.error("Failed to save interests: " + err.message);
    } finally {
      setIsSavingInterests(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);

      await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profile.id);
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleVoiceRecording = async (blob: Blob) => {
    if (!profile) return;
    try {
      const filePath = `${profile.id}/intro_${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage.from("audio").upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("audio").getPublicUrl(filePath);
      setVoiceUrl(data.publicUrl);

      await supabase
        .from("profiles")
        .update({ voice_intro_url: data.publicUrl })
        .eq("id", profile.id);
    } catch (err: any) {
      toast.error("Failed to save voice intro: " + err.message);
    }
  };

  const finishOnboarding = async () => {
    try {
      if (profile) {
        await supabase
          .from("profiles")
          .update({ has_completed_onboarding: true })
          .eq("id", profile.id);
        await refreshProfile();
      }
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--color-background)] text-white flex flex-col relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[var(--color-primary)]/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Progress */}
      <div className="h-1 w-full bg-[var(--color-surface-2)] fixed top-0 z-50">
        <div
          className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-20 pb-10 z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-3xl font-display font-bold mb-4">Welcome to Matisa</h1>
              <p className="text-[var(--color-text-muted)] mb-auto">
                Let's set up your creative profile so you can connect with the right people.
              </p>
              <Button
                variant="solid"
                onClick={handleNext}
                className="w-full h-14 rounded-full font-bold shadow-lg"
              >
                Get Started
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-3xl font-display font-bold mb-2">What are you into?</h1>
              <p className="text-[var(--color-text-muted)] mb-8">
                Pick at least one to personalize your feed.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-auto">
                {INTERESTS.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      if (selectedInterests.includes(id)) {
                        setSelectedInterests((prev) => prev.filter((i) => i !== id));
                      } else {
                        setSelectedInterests((prev) => [...prev, id]);
                      }
                    }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      selectedInterests.includes(id)
                        ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg"
                        : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-semibold text-sm">{id}</span>
                  </button>
                ))}
              </div>

              <Button
                variant="solid"
                onClick={saveInterests}
                disabled={isSavingInterests}
                className="w-full h-14 rounded-full font-bold mt-8"
              >
                {isSavingInterests ? "Saving..." : "Continue"}
              </Button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-3xl font-display font-bold mb-2">Add a photo</h1>
              <p className="text-[var(--color-text-muted)] mb-12">
                Show the community who you are.
              </p>

              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative mb-8">
                  <div className="w-40 h-40 rounded-full border-2 border-dashed border-[var(--color-border)] p-2">
                    <div className="w-full h-full rounded-full bg-[var(--color-surface-2)] overflow-hidden flex items-center justify-center relative">
                      {avatarUrl || profile?.avatar_url ? (
                        <img
                          src={avatarUrl || profile?.avatar_url || ""}
                          className="w-full h-full object-cover"
                          alt="Avatar"
                        />
                      ) : (
                        <Camera size={40} className="text-[var(--color-text-muted)]" />
                      )}
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-12 h-12 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  >
                    <Plus size={24} className="ml-1" />
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="glass"
                  onClick={handleNext}
                  className="flex-1 h-14 rounded-full font-bold"
                >
                  Skip
                </Button>
                <Button
                  variant="solid"
                  onClick={handleNext}
                  className="flex-[2] h-14 rounded-full font-bold"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-3xl font-display font-bold mb-2">Voice Intro</h1>
              <p className="text-[var(--color-text-muted)] mb-12">
                Introduce yourself to the community in 30 seconds or less.
              </p>

              <div className="flex-1 flex flex-col items-center justify-center">
                {voiceUrl ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={40} />
                    </div>
                    <p className="text-white font-bold">Intro recorded!</p>
                  </div>
                ) : (
                  <AudioRecorder onRecordingComplete={handleVoiceRecording} />
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="glass"
                  onClick={handleNext}
                  className="flex-1 h-14 rounded-full font-bold"
                >
                  Skip
                </Button>
                <Button
                  variant="solid"
                  onClick={handleNext}
                  className="flex-[2] h-14 rounded-full font-bold"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-3xl font-display font-bold mb-2">People to follow</h1>
              <p className="text-[var(--color-text-muted)] mb-8">Start building your network.</p>

              <div className="flex-1 space-y-4">
                {suggestedUsers.map((user) => {
                  const isFollowing = followedIds.includes(user.id);
                  return (
                    <Card
                      key={user.id}
                      variant="surface"
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar size={48} profile={user} />
                        <div>
                          <p className="text-white font-bold text-sm">
                            {user.display_name || user.username}
                          </p>
                          <p className="text-[var(--color-text-muted)] text-xs">@{user.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (isFollowing) {
                            setFollowedIds((prev) => prev.filter((id) => id !== user.id));
                          } else {
                            setFollowedIds((prev) => [...prev, user.id]);
                          }
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isFollowing
                            ? "bg-[var(--color-surface-3)] text-white"
                            : "bg-[var(--color-primary)] text-white"
                        }`}
                      >
                        {isFollowing ? <Check size={18} /> : <UserPlus size={18} />}
                      </button>
                    </Card>
                  );
                })}
              </div>

              <Button
                variant="solid"
                onClick={finishOnboarding}
                className="w-full h-14 rounded-full font-bold mt-8 shadow-lg"
              >
                Finish Setup
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
