import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Music } from 'lucide-react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Check your email to verify your account!');
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
          <div>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) 
<truncated 1426 bytes>