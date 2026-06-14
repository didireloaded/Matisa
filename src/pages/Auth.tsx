import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { User, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            username: email.split("@")[0],
          });
          if (profileError) console.error("Profile creation error:", profileError);
        }

        toast.success("Account created! Welcome to Matisa.");
        navigate("/");
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
    <div className="relative min-h-screen w-full bg-[#0A0A0A] text-white overflow-hidden flex flex-col font-sans">
      {/* Decorative Wavy Lines exactly matching the reference */}
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

      {/* Header matching reference */}
      <div className="relative z-10 flex items-center justify-between p-6 mt-4">
        {/* Logo icon placeholder */}
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center transform rotate-45 shadow-lg">
          <div className="w-4 h-4 bg-black rounded-sm transform -rotate-45" />
        </div>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          <User className="w-4 h-4" />
          {isLogin ? "Sign Up" : "Sign In"}
        </button>
      </div>

      {/* Main Form */}
      <div className="relative z-10 flex-1 flex flex-col pt-12 px-8 max-w-md mx-auto w-full">
        <h1 className="text-4xl font-bold mb-12 tracking-tight">
          {isLogin ? "Sign In" : "Sign Up"}
        </h1>

        <form onSubmit={handleAuth} className="space-y-6 flex flex-col w-full">
          <div className="w-full flex flex-col items-center space-y-2">
            <label className="text-[11px] text-white/50 tracking-wider uppercase font-semibold">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hannadowie@gmail.com"
              className="w-full bg-[#1A1A1A] rounded-full px-6 py-4 text-center text-white text-sm outline-none placeholder:text-white/30 focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          <div className="w-full flex flex-col items-center space-y-2">
            <label className="text-[11px] text-white/50 tracking-wider uppercase font-semibold">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#1A1A1A] rounded-full px-6 py-4 text-center text-white text-sm outline-none placeholder:text-white/30 focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          <div className="pt-4 w-full">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full relative overflow-hidden flex items-center justify-center group"
            >
              {/* Gradient Border Button specific to reference */}
              <div className="absolute inset-0 rounded-full border border-transparent [background:linear-gradient(90deg,#0A0A0A,#0A0A0A)_padding-box,linear-gradient(90deg,#FF416C,#8E2DE2)_border-box]" />

              <span className="relative z-10 flex items-center gap-2 font-bold text-white">
                <span className="w-4 h-4 border border-white/40 rounded flex items-center justify-center text-[8px] opacity-70">
                  →
                </span>
                {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
              </span>
            </button>
          </div>
        </form>

        <div className="mt-16 flex flex-col items-center">
          <span className="text-[11px] text-white/40 mb-6">
            or {isLogin ? "Sign In" : "Sign Up"} with
          </span>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
              <span className="text-black font-bold text-sm">G</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
              <span className="text-black font-bold text-sm">O</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
              <span className="text-black font-bold text-sm">X</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
              <span className="text-black font-bold text-sm">♪</span>
            </button>
          </div>

          <button
            className="mt-12 text-[11px] text-white/40 hover:text-white transition-colors"
            onClick={handleGuest}
          >
            Browse as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
