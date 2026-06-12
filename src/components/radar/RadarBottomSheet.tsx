import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, UserPlus, Hand, PlayCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { RadarNodeData } from './RadarAvatar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface RadarBottomSheetProps {
  node: RadarNodeData | null;
  onClose: () => void;
}

export function RadarBottomSheet({ node, onClose }: RadarBottomSheetProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleFollow = async () => {
    if (!profile || !node) return;
    setLoadingAction('follow');
    const { error } = await supabase.from('follows').insert({ follower_id: profile.id, following_id: node.id });
    setLoadingAction(null);
    if (!error) toast.success(`Following ${node.name}`);
    else toast.error('Failed to follow');
  };

  const handleWave = async () => {
    if (!profile || !node) return;
    setLoadingAction('wave');
    const { error } = await supabase.from('notifications').insert({
      user_id: node.id,
      actor_id: profile.id,
      type: 'wave',
      read: false
    });
    setLoadingAction(null);
    if (!error) toast.success(`Waved at ${node.name}! 👋`);
  };

  const handleMessage = async () => {
    if (!profile || !node) return;
    setLoadingAction('message');
    // Simplified: in reality, check for existing conversation
    const { data: conv, error } = await supabase.from('conversations').insert({ is_group: false }).select().single();
    if (conv) {
      await supabase.from('conversation_participants').insert([
        { conversation_id: conv.id, user_id: profile.id },
        { conversation_id: conv.id, user_id: node.id }
      ]);
      navigate(`/messages`);
    }
    setLoadingAction(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {node && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-[#1C1814] rounded-t-3xl border-t border-[#2E2822] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-5 flex flex-col items-center">
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-[#2E2822] rounded-full mb-6" />

              <button 
                onClick={onClose}
                className="absolute top-5 right-5 p-2 bg-[#2E2822]/50 text-[#8A7F74] rounded-full hover:bg-[#2E2822] transition-colors"
              >
                <X size={18} />
              </button>

              {/* Profile Info */}
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full border-2 border-[#C8521A] overflow-hidden bg-[#0F0D0B]">
                  {node.avatar_url ? (
                    <img src={node.avatar_url} alt={node.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8A7F74] font-bold text-3xl">
                      {node.name.charAt(0)}
                    </div>
                  )}
                </div>
                {node.state === 'online' && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-[#1C1814] rounded-full" />
                )}
              </div>

              <h2 className="text-2xl font-display font-bold text-[#F5F0EA]">{node.name}</h2>
              <p className="text-[#8A7F74] text-sm font-medium mb-1">{node.status}</p>
              
              <div className="flex gap-4 text-xs font-bold text-[#E8A055] mt-2 mb-8 bg-[#C8521A]/10 px-3 py-1.5 rounded-full">
                <span>{node.distance} away</span>
                <span className="text-[#8A7F74]">•</span>
                <span>{node.mutuals} mutual friends</span>
              </div>

              {/* Actions Grid */}
              <div className="w-full grid grid-cols-4 gap-3">
                <button onClick={handleMessage} disabled={loadingAction === 'message'} className="flex flex-col items-center gap-2 text-[#F5F0EA] group">
                  <div className="w-12 h-12 rounded-full bg-[#C8521A] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    {loadingAction === 'message' ? <Loader2 size={20} className="animate-spin text-white" /> : <MessageSquare size={20} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-bold">Message</span>
                </button>
                <button onClick={handleFollow} disabled={loadingAction === 'follow'} className="flex flex-col items-center gap-2 text-[#8A7F74] hover:text-[#F5F0EA] transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-[#2E2822] flex items-center justify-center group-hover:bg-[#3E3832] transition-colors">
                    {loadingAction === 'follow' ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
                  </div>
                  <span className="text-[10px] font-bold">Follow</span>
                </button>
                <button onClick={handleWave} disabled={loadingAction === 'wave'} className="flex flex-col items-center gap-2 text-[#8A7F74] hover:text-[#F5F0EA] transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-[#2E2822] flex items-center justify-center group-hover:bg-[#3E3832] transition-colors">
                    {loadingAction === 'wave' ? <Loader2 size={20} className="animate-spin" /> : <Hand size={20} />}
                  </div>
                  <span className="text-[10px] font-bold">Wave</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-[#8A7F74] hover:text-[#F5F0EA] transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-[#2E2822] flex items-center justify-center group-hover:bg-[#3E3832] transition-colors">
                    <PlayCircle size={20} className="text-purple-400" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-400">Intro</span>
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
