import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Bell, Shield, Key, Moon, HelpCircle, Ghost } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export function Settings() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const [ghostMode, setGhostMode] = useState<string>("approximate");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile?.ghost_mode) {
      setGhostMode(profile.ghost_mode);
    }
  }, [profile]);

  const handleGhostModeChange = async (mode: string) => {
    if (!profile) return;
    setGhostMode(mode);
    setUpdating(true);
    try {
      await supabase.from("profiles").update({ ghost_mode: mode }).eq("id", profile.id);
    } catch (err) {
      console.error("Failed to update ghost mode", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 px-6 pt-4 pb-4 bg-background/80 backdrop-blur-xl border-b border-border flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-white/70 hover:text-white transition rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
      </header>

      <main className="flex-1 p-6 space-y-8">
        {/* Account Info Preview */}
        <div className="flex items-center gap-4 bg-card p-4 rounded-[24px] border border-border">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF416C] to-[#8E2DE2] p-[2px]">
            <img
              src={
                profile?.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`
              }
              className="w-full h-full rounded-full bg-black object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">
              {profile?.display_name || profile?.full_name || "Anonymous"}
            </h2>
            <p className="text-white/50 text-sm truncate">
              @{profile?.username || profile?.id.slice(0, 8)}
            </p>
          </div>
          <button className="px-4 py-2 bg-white/10 rounded-full text-sm font-bold hover:bg-white/20 transition">
            Edit
          </button>
        </div>

        {/* Preferences */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider px-2">
            Preferences
          </h3>

          <div className="bg-card rounded-[24px] border border-border overflow-hidden divide-y divide-border/50">
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-white/70" />
                <span className="font-medium">Push Notifications</span>
              </div>
              <div className="w-10 h-6 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full shadow-sm" />
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-white/70" />
                <span className="font-medium">Dark Mode</span>
              </div>
              <span className="text-white/50 text-sm">System</span>
            </button>
            
            <div className="w-full flex flex-col p-4 hover:bg-white/5 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Ghost className="w-5 h-5 text-white/70" />
                  <span className="font-medium">Ghost Mode</span>
                </div>
                {updating && <span className="text-xs text-primary">Saving...</span>}
              </div>
              <p className="text-xs text-white/40 mb-3 leading-relaxed">
                Control who can see your location on the map and discover you locally.
              </p>
              <select 
                className="bg-[#0B0B0B] border border-white/10 rounded-xl p-2.5 text-sm text-white/70 focus:outline-none focus:border-primary w-full"
                value={ghostMode}
                onChange={(e) => handleGhostModeChange(e.target.value)}
                disabled={updating}
              >
                <option value="exact">Exact (Show precise distance)</option>
                <option value="approximate">Approximate (Show region only)</option>
                <option value="hidden">Hidden (Completely invisible)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Security & Support */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider px-2">Account</h3>

          <div className="bg-card rounded-[24px] border border-border overflow-hidden divide-y divide-border/50">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition">
              <Shield className="w-5 h-5 text-white/70" />
              <span className="font-medium text-left flex-1">Privacy & Safety</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition">
              <Key className="w-5 h-5 text-white/70" />
              <span className="font-medium text-left flex-1">Security</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition">
              <HelpCircle className="w-5 h-5 text-white/70" />
              <span className="font-medium text-left flex-1">Help & Support</span>
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-500 rounded-[24px] hover:bg-red-500/20 transition font-bold"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </section>
      </main>
    </div>
  );
}
