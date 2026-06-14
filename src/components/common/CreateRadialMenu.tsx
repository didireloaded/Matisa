import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image, Music, MapPin, AlignLeft, Mic, Video, Users } from 'lucide-react';

interface CreateRadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRadialMenu({ isOpen, onClose }: CreateRadialMenuProps) {
  const menuItems = [
    { icon: <Image className="w-5 h-5 text-white" />, label: 'Story', color: 'bg-blue-500' },
    { icon: <AlignLeft className="w-5 h-5 text-white" />, label: 'Note', color: 'bg-green-500' },
    { icon: <Mic className="w-5 h-5 text-white" />, label: 'Voice', color: 'bg-yellow-500' },
    { icon: <Users className="w-5 h-5 text-white" />, label: 'Room', color: 'bg-purple-500' },
    { icon: <Video className="w-5 h-5 text-white" />, label: 'Live', color: 'bg-red-500' },
  ];

  // Calculate positions in a semi-circle or full circle
  // We'll arrange them in an arc above the center button
  const radius = 90; // distance from center
  const getTransform = (index: number, total: number) => {
    // Spread evenly across a 180-degree arc above the center
    const angleRange = Math.PI; // 180 degrees
    const startAngle = Math.PI; // start from left (180 deg)
    
    // If there's only 1 item, put it straight up
    if (total === 1) return { x: 0, y: -radius };
    
    // Calculate angle for this item
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
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#0F0D0B]/80 backdrop-blur-sm"
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
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 25, 
                    delay: index * 0.05 
                  }}
                  className="absolute left-1/2 bottom-0 -ml-7 pointer-events-auto"
                  onClick={() => {
                    // Action handler
                    onClose();
                  }}
                >
                  <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${item.color} shadow-lg shadow-black/50 transform transition-transform group-hover:scale-110 group-active:scale-95`}>
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Close / Trigger Button overlay */}
            <motion.button
              initial={{ rotate: 0 }}
              animate={{ rotate: 45 }}
              exit={{ rotate: 0 }}
              onClick={onClose}
              className="absolute left-1/2 bottom-0 -translate-x-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-xl pointer-events-auto z-10 hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-7 h-7" />
            </motion.button>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
