import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { User, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          // If it's a generic "Invalid login credentials", give a hint
          if (error.message === "Invalid login credentials") {
            throw new Error("Invalid login credentials. Have you confirmed your email address?");
          }
          throw error;
        }
        toast.success("Welcome back!");
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // If email confirmation is required, session will be null
        if (data.user && !data.session) {
          toast.success("Account created! Please check your email to confirm your account.");
          // Do not navigate to / yet, since they can't log in
        } else {
          toast.success("Account created! Welcome to Matisa.");
          navigate("/");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    localStorage.setItem("guestMode", "true");
    toast("Browsing as Guest");
    navigate("/");
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[var(--color-background)] text-white overflow-hidden flex flex-col font-sans">
      {/* Decorative Wavy Lines */}
      <div className="absolute top-0 left-0 w-full h-80 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full opacity-80">
          <path
            d="M0,45 C30,30 50,70 100,20 L100,0 L0,0 Z"
            fill="none"
            stroke="url(#gradLine1)"
            strokeWidth="0.5"
          />
          <path
            d="M0,55 C40,80 60,30 100,10 L100,0 L0,0 Z"
            fill="none"
            stroke="url(#gradLine2)"
            strokeWidth="0.3"
          />
          <defs>
            <linearGradient id="gradLine1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF416C" />
              <stop offset="100%" stopColor="#FF4B2B" />
            </linearGradient>
            <linearGradient id="gradLine2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8E2DE2" />
              <stop offset="100%" stopColor="#4A00E0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-10">
        <div className="w-10 h-10 bg-[var(--color-surface-2)] rounded-xl flex items-center justify-center transform rotate-45 shadow-lg border border-[var(--color-border)]">
          <div className="w-4 h-4 bg-white rounded-sm transform -rotate-45" />
        </div>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-white transition-colors"
        >
          <User className="w-4 h-4" />
          {isLogin ? "Sign Up" : "Sign In"}
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 -mt-10">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm font-medium">
            {isLogin
              ? "Enter your details to access your account."
              : "Join the creative network for musicians."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="h-14 rounded-2xl bg-[var(--color-surface-2)] border-transparent"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="h-14 rounded-2xl bg-[var(--color-surface-2)] border-transparent"
          />

          <Button
            variant="primary"
            disabled={loading}
            className="w-full h-14 rounded-2xl font-bold text-base mt-4 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-px bg-[var(--color-border)] flex-1" />
          <span className="text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-wider">
            Or
          </span>
          <div className="h-px bg-[var(--color-border)] flex-1" />
        </div>

        <Button
          variant="glass"
          onClick={handleGuest}
          className="w-full h-14 rounded-2xl font-bold mt-8"
        >
          Continue as Guest
        </Button>
      </div>
    </div>
  );
}

export default Auth;
