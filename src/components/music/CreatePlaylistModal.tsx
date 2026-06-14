import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Music2, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function CreatePlaylistModal({ children, onCreated }: { children: React.ReactNode, onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !profile) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('playlists').insert({
        title: title.trim(),
        author_id: profile.id,
      });

      if (error) throw error;
      
      toast.success('Playlist created successfully!');
      setOpen(false);
      setTitle('');
      onCreated();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-[#1C1814] border-[#2E2822]">
        <DialogHeader>
          <DialogTitle className="text-[#F5F0EA] flex items-center gap-2 text-xl font-display">
            <div className="p-2 rounded-full bg-[#C8521A]/20 text-[#C8521A]">
              <Music2 size={20} />
            </div>
            Create Playlist
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#8A7F74] uppercase tracking-wider">
              Playlist Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chill Vibes, Workout Mix"
              className="w-full bg-[#0F0D0B] border border-[#2E2822] rounded-xl px-4 py-3 text-[#F5F0EA] placeholder:text-[#8A7F74] focus:outline-none focus:border-[#C8521A] transition"
              autoFocus
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={!title.trim() || loading}
            className="w-full py-3 rounded-xl bg-[#C8521A] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-[#E8A055]"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            Create Playlist
          </motion.button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
