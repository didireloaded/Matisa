import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Bell, Shield, Key, Moon, HelpCircle, Ghost, Gem, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";

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
      setGhostMode(profile.ghost_mode as string);
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
    <div className="flex flex-col min-h-full bg-[var(--color-background)] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 px-5 pt-4 pb-4 bg-[var(--color-background)]/90 backdrop-blur-xl flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-white hover:bg-[var(--color-surface-3)] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white">Settings</h1>
      </header>

      <main className="flex-1 px-5 space-y-6">
        {/* Account Info Preview */}
        <Card variant="solid" className="flex items-center gap-4 p-4">
          <Avatar
            size={60}
            profile={{
              id: profile?.id || "unknown",
              display_name: profile?.display_name || "User",
              avatar_url: profile?.avatar_url || "",
            }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-white truncate">
              {profile?.display_name || profile?.full_name || "Anonymous"}
            </h2>
            <p className="text-[var(--color-text-muted)] text-sm truncate">
              @{profile?.username || profile?.id.slice(0, 8)}
            </p>
          </div>
          <Button variant="glass" size="sm" className="font-bold">
            Edit
          </Button>
        </Card>

        {/* Preferences */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-2">
            Wallet & Economics
          </h3>
          <Card
            variant="solid"
            className="overflow-hidden p-0 mb-6 cursor-pointer hover:bg-[var(--color-surface-3)] transition-colors"
          >
            <button
              onClick={() => navigate("/wallet")}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <Gem size={16} className="text-[var(--color-primary)]" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-white text-[15px]">My Wallet</span>
                  <span className="text-[12px] font-medium text-[var(--color-text-muted)]">Manage your coins and gifts</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-[var(--color-text-muted)]" />
            </button>
          </Card>

          <h3 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-2">
            Preferences
          </h3>

          <Card
            variant="solid"
            className="overflow-hidden divide-y divide-[var(--color-border)] p-0"
          >
            <button className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-surface-3)] transition">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[var(--color-text-muted)]" />
                <span className="font-semibold text-white">Push Notifications</span>
              </div>
              <div className="w-11 h-6 bg-[var(--color-primary)] rounded-full relative">
                <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full shadow-sm" />
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-surface-3)] transition">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-[var(--color-text-muted)]" />
                <span className="font-semibold text-white">Dark Mode</span>
              </div>
              <div className="w-11 h-6 bg-[var(--color-primary)] rounded-full relative">
                <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full shadow-sm" />
              </div>
            </button>
          </Card>
        </section>

        {/* Privacy & Security */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-2">
            Privacy & Security
          </h3>

          <Card
            variant="solid"
            className="overflow-hidden divide-y divide-[var(--color-border)] p-0"
          >
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Ghost className="w-5 h-5 text-[var(--color-text-muted)]" />
                <div className="flex-1">
                  <span className="font-semibold text-white block">Ghost Mode</span>
                  <span className="text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5 block">
                    Control how accurately your location is shared
                  </span>
                </div>
              </div>
              <div className="flex bg-[var(--color-surface-3)] rounded-full p-1 mt-2">
                <button
                  disabled={updating}
                  onClick={() => handleGhostModeChange("precise")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition ${
                    ghostMode === "precise"
                      ? "bg-white text-black shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-white"
                  }`}
                >
                  Precise
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleGhostModeChange("approximate")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition ${
                    ghostMode === "approximate"
                      ? "bg-white text-black shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-white"
                  }`}
                >
                  Approx (5km)
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleGhostModeChange("hidden")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition ${
                    ghostMode === "hidden"
                      ? "bg-white text-black shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-white"
                  }`}
                >
                  Hidden
                </button>
              </div>
            </div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-surface-3)] transition">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[var(--color-text-muted)]" />
                <span className="font-semibold text-white">Privacy Settings</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-surface-3)] transition">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-[var(--color-text-muted)]" />
                <span className="font-semibold text-white">Password & Security</span>
              </div>
            </button>
          </Card>
        </section>

        {/* Support */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-2">
            Support
          </h3>
          <Card variant="solid" className="overflow-hidden p-0">
            <button className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-surface-3)] transition">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-[var(--color-text-muted)]" />
                <span className="font-semibold text-white">Help Center</span>
              </div>
            </button>
          </Card>
        </section>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full mt-8 border-red-500/30 text-red-500 hover:bg-red-500/10 gap-2"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </Button>

        <div className="text-center pb-8 pt-4">
          <p className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-widest font-bold">
            Matisa v1.0.0
          </p>
        </div>
      </main>
    </div>
  );
}

export default Settings;
