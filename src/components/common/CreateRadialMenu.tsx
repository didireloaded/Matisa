import { motion, AnimatePresence } from "framer-motion";
import { Plus, Image, AlignLeft, Mic, Users, X } from "lucide-react";

interface CreateRadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (action: string) => void;
}

export function CreateRadialMenu({ isOpen, onClose, onSelect }: CreateRadialMenuProps) {
  const menuItems = [
    {
      icon: <Image className="w-5 h-5 text-white" />,
      label: "Story",
      color: "bg-blue-500 shadow-blue-500/50",
    },
    {
      icon: <AlignLeft className="w-5 h-5 text-white" />,
      label: "Note",
      color: "bg-green-500 shadow-green-500/50",
    },
    {
      icon: <Mic className="w-5 h-5 text-white" />,
      label: "Voice",
      color: "bg-yellow-500 shadow-yellow-500/50",
    },
    {
      icon: <Users className="w-5 h-5 text-white" />,
      label: "Room",
      color: "bg-purple-500 shadow-purple-500/50",
    },
  ];

  // Calculate positions in an arc above the center button
  const radius = 90; // distance from center
  const getTransform = (index: number, total: number) => {
    const angleRange = Math.PI; // 180 degrees
    const startAngle = Math.PI; // start from left (180 deg)

    if (total === 1) return { x: 0, y: -radius };

    const angle = startAngle - (angleRange / (total - 1)) * index;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xl"
          />

          {/* Radial Menu Container - Anchored to bottom center */}
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            {/* Menu Items */}
            {menuItems.map((item, index) => {
              const pos = getTransform(index, menuItems.length);
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
                  exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 25,
                    delay: index * 0.04,
                  }}
                  className="absolute left-1/2 bottom-0 -ml-7 pointer-events-auto"
                  onClick={() => {
                    if (onSelect) onSelect(item.label.toLowerCase());
                    onClose();
                  }}
                >
                  <div className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center ${item.color} shadow-2xl transform transition-all duration-200 group-hover:scale-110 group-active:scale-95`}
                    >
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-bold text-white bg-black/40 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Close / Trigger Button overlay */}
            <motion.button
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={onClose}
              className="absolute left-1/2 bottom-0 -translate-x-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] pointer-events-auto z-10 hover:bg-gray-100 transition-colors active:scale-90"
            >
              <X className="w-7 h-7" />
            </motion.button>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
