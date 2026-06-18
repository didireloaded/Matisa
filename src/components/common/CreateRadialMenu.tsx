import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Camera, Mic, CalendarDays, Radio } from "lucide-react";

interface CreateRadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (action: string) => void;
}

import { HelpCircle, Briefcase } from "lucide-react";

const CREATE_ITEMS = [
  { id: "voice", label: "Voice", icon: Mic, color: "#2D7DD2", angle: -150 },
  { id: "note", label: "Note", icon: FileText, color: "#FF9D2E", angle: -90 },
  { id: "room", label: "Room", icon: Radio, color: "#FF6B6B", angle: -30 },
  { id: "event", label: "Event", icon: CalendarDays, color: "#22c55e", angle: 30 },
  { id: "question", label: "Ask", icon: HelpCircle, color: "#A855F7", angle: 90 },
  { id: "opportunity", label: "Post", icon: Briefcase, color: "#F43F5E", angle: 150 },
];

export function CreateRadialMenu({ isOpen, onClose, onSelect }: CreateRadialMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2">
            {CREATE_ITEMS.map((item, i) => {
              const rad = (item.angle - 90) * (Math.PI / 180);
              const r = 88;
              const x = Math.cos(rad) * r;
              const y = Math.sin(rad) * r;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, x, y, scale: 1 }}
                  exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 22 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                  style={{ left: 0, top: 0 }}
                  onClick={() => {
                    if (onSelect) onSelect(item.id);
                    onClose();
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: item.color + "22", border: `1.5px solid ${item.color}55` }}
                  >
                    <Icon size={20} style={{ color: item.color }} />
                  </div>
                  <span className="text-white/80 text-[10px] font-semibold">{item.label}</span>
                </motion.button>
              );
            })}

            <motion.button
              initial={{ rotate: 0 }}
              animate={{ rotate: 45 }}
              exit={{ rotate: 0 }}
              onClick={onClose}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full flex items-center justify-center"
              style={{
                left: 0,
                top: 0,
                background: "linear-gradient(135deg, #FF9D2E, #A855F7)",
                boxShadow: "0 4px 20px rgba(255,157,46,0.5)",
              }}
            >
              <Plus size={26} className="text-black" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
