import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Bell, Shield, Key, Moon, HelpCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

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

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 px-6 pt-12 pb-4 bg-background/80 backdrop-blur-xl border-b border-border flex items-center gap-4">
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
