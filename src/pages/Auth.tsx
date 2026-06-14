import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Target, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        toast.success('Welcome back!');
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            username: email.split('@')[0],
          });
          if (profileError) console.error("Profile creation error:", profileError);
        }

        toast.success('Account created! Welcome to Matisa.');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    // Guest mode bypasses auth entirely for now.
    // We handle session persistence checks in MainLayout.
    localStorage.setItem('guestMode', 'true');
    toast('Browsing as Guest');
    navigate('/');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0B0B0B] text-white overflow-hidden flex flex-col font-sans">
      
      {/* Decorative Wavy Lines / Background */}
      <div className="absolute top-0 left-0 w-full h-64 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full opacity-30">
          <path d="M0,50 Q25,20 50,50 T100,50 L100,0 L0,0 Z" fill="none" stroke="url(#grad)" strokeWidth="0.5" />
          <path d="M0,60 Q30,80 60,60 T100,60 L100,0 L0,0 Z" fill="none" stroke="url(#grad2)" strokeWidth="0.5" />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF9D2E" />
              <stop offset="100%" stopColor="#FF6B6B" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#6B2D7D" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <Target className="w-6 h-6 text-black" />
        </div>
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white transition-colors"
        >
          <User className="w-4 h-4" />
          {isLogin ? 'Sign Up' : 'Sign In'}
        </button>
      </div>

      {/* Main Form */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full">
        <h1 className="text-[2.5rem] font-bold text-center mb-10 tracking-tight">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h1>

        <form onSubmit={handleAuth} className="space-y-6 flex flex-col items-center w-full">
          
          <div className="w-full space-y-1">
            <label className="text-xs text-[#A0A0A0] ml-4">Email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hannadowie@gmail.com"
              className="text-center"
            />
          </div>

          <div className="w-full space-y-1">
            <label className="text-xs text-[#A0A0A0] ml-4">Password</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="text-center"
            />
          </div>

          <div className="pt-2 w-full">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-full relative group overflow-hidden bg-transparent border border-white/20 hover:border-transparent transition-all"
            >
              {/* Gradient border effect using pseudo element on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF9D2E] to-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-[1px] bg-[#0B0B0B] rounded-full flex items-center justify-center">
                <span className="bg-gradient-to-r from-[#FF9D2E] to-[#FF6B6B] bg-clip-text text-transparent font-bold">
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                </span>
              </div>
            </button>
          </div>
          
          {isLogin && (
            <button type="button" className="text-xs text-[#A0A0A0] hover:text-white transition-colors">
              Forgot password?
            </button>
          )}

        </form>

        <div className="mt-12 flex flex-col items-center">
          <span className="text-sm text-[#A0A0A0] mb-6">or {isLogin ? 'Sign In' : 'Sign Up'} with</span>
          
          <div className="flex items-center gap-4">
            {['G', 'Ig', 'X', 'Tt'].map((provider) => (
              <button 
                key={provider}
                className="w-12 h-12 rounded-full bg-[#151515] hover:bg-[#222222] border border-[#222222] flex items-center justify-center transition-colors text-sm font-bold text-[#A0A0A0] hover:text-white"
              >
                {provider}
              </button>
            ))}
          </div>

          <Button 
            variant="ghost" 
            className="mt-12 text-[#A0A0A0] hover:text-white"
            onClick={handleGuest}
          >
            Browse as Guest
          </Button>
        </div>

      </div>

    </div>
  );
}
