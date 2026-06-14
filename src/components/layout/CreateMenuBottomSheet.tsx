import { motion, AnimatePresence } from 'framer-motion';
import { PenSquare, Image, CalendarDays, Music, Mic2, X } from 'lucide-react';

interface CreateMenuBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (action: string) => void;
}

export function CreateMenuBottomSheet({ open, onClose, onSelect }: CreateMenuBottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t p-6 pb-safe"
            style={{
              background: 'rgba(28,24,20,0.95)',
              backdropFilter: 'blur(20px)',
              borderColor: '#2E2822',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#F5F0EA]">Create</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F0D0B] text-[#8A7F74] transition hover:text-[#F5F0EA]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-y-6 gap-x-4">
              <MenuAction icon={<PenSquare size={24} />} label="Post" color="#E8A055" onClick={() => onSelect('post')} />
              <MenuAction icon={<Image size={24} />} label="Story" color="#C8521A" onClick={() => onSelect('story')} />
              <MenuAction icon={<CalendarDays size={24} />} label="Event" color="#4CAF7D" onClick={() => onSelect('event')} />
              <MenuAction icon={<Music size={24} />} label="Song" color="#2D7DD2" onClick={() => onSelect('song')} />
              <MenuAction icon={<PenSquare size={24} />} label="Note" color="#9C27B0" onClick={() => onSelect('note')} />
              <MenuAction icon={<Mic2 size={24} />} label="Voice Room" color="#F44336" onClick={() => onSelect('room')} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MenuAction({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 transition active:scale-95 group">
      <div 
        className="flex h-14 w-14 items-center justify-center rounded-full transition group-hover:scale-105"
        style={{ background: `${color}15`, color: color }}
      >
        {icon}
      </div>
      <span className="text-xs font-semibold text-[#8A7F74] transition group-hover:text-[#F5F0EA]">{label}</span>
    </button>
  );
}
