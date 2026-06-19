import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "@/types";
import { Analytics } from "@/services/analytics";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  needsOnboarding: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchProfile = async (userId: string) => {
    // Simple select — no joins to tables that may not exist yet
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[AuthContext] fetchProfile error:", error.message);
    }

    if (data) {
      setProfile(data as Profile);
      // Needs onboarding if username isn't set yet
      setNeedsOnboarding(!data.username);
    } else {
      console.log(
        "[AuthContext] Profile missing. Attempting to create default profile for:",
        userId,
      );
      // Create a default profile to prevent the app from hanging
      const defaultUsername = `user_${userId.substring(0, 8)}`;
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          username: defaultUsername,
          display_name: "New User",
          ghost_mode: "hidden",
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error("[AuthContext] Failed to create default profile:", insertError.message);
      }

      if (newProfile) {
        setProfile(newProfile as Profile);
        setNeedsOnboarding(true); // Must still go through onboarding to pick a real username
      } else {
        // Fallback if insert fails (shouldn't happen unless schema error)
        setProfile(null);
        setNeedsOnboarding(true);
      }
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) await fetchProfile(session.user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
        Analytics.track("app_opened", { source: "initial_load" });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        if (event === "SIGNED_IN") {
          Analytics.track("user_signed_in", { method: "email" });
        }
      } else {
        setProfile(null);
        setNeedsOnboarding(false);
        if (event === "SIGNED_OUT") {
          Analytics.track("user_signed_out", {});
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        needsOnboarding,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
