import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Music } from 'lucide-react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

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
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        
        // Ensure profile exists (upsert)
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            username: username || email.split('@')[0],
            full_name: fullName,
          });
          if (profileError) console.error("Profile creation error:", profileError);
        }

        toast.success('Account created! Welcome to Matisa.');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,209,220,0.5)]">
            <Music className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            {isLogin ? 'Welcome back' : 'Join Matisa'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {isLogin ? 'Enter your details to sign in.' : 'Create an account to start connecting.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-neutral-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-neutral-500"
                />
              </div>
            </>
          )}
          <div>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-neutral-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-neutral-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
