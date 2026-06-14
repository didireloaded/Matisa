import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Navigation2, X } from 'lucide-react';
import { RadarNode } from './radarUtils';

interface RadarBottomSheetProps {
  nearbyNodes: RadarNode[];
  selectedNode: RadarNode | null;
  onCloseSelection: () => void;
}

export function RadarBottomSheet({ nearbyNodes, selectedNode, onCloseSelection }: RadarBottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  // If a node is selected, force open the sheet to show their details
  const showDetail = !!selectedNode;
  const isExpanded = isOpen || showDetail;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-4 md:px-8">
      <AnimatePresence>
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: isExpanded ? 0 : "calc(100% - 64px)" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md mx-auto bg-[#1C1814]/95 backdrop-blur-xl border border-[#2E2822] rounded-3xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          style={{ 
            height: isExpanded ? '50vh' : 'auto',
            maxHeight: '400px',
            minHeight: '64px'
          }}
        >
          {/* Header Area / Drag Handle */}
          <div 
            className="h-16 flex items-center justify-between px-6 cursor-pointer border-b border-[#2E2822]"
            onClick={() => {
              if (showDetail) {
                onCloseSelection();
              } else {
                setIsOpen(!isOpen);
              }
            }}
          >
            <div className="flex items-center gap-3">
              {showDetail && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onCloseSelection(); }}
                  className="p-1 rounded-full bg-[#2E2822] hover:bg-[#3D362E] transition"
                >
                  <X size={16} className="text-[#F5F0EA]" />
                </button>
              )}
              <h3 className="font-bold text-[#F5F0EA] text-lg">
                {showDetail ? selectedNode.name : 'Nearby People'}
              </h3>
            </div>
            {!showDetail && (
              <ChevronUp 
                size={20} 
                className={`text-[#8A7F74] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
              />
            )}
          </div>

          {/* Content Area */}
          <div className="h-[calc(100%-64px)] overflow-y-auto no-scrollbar p-4 space-y-3">
            {showDetail ? (
              <div className="flex flex-col items-center pt-4">
                <div className="w-24 h-24 rounded-full bg-[#2E2822] overflow-hidden mb-4 border-2 border-[#C8521A]">
                  {selectedNode.avatar ? (
                    <img src={selectedNode.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#8A7F74]">
                      {selectedNode.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-[#F5F0EA]">{selectedNode.name}</h2>
                <p className="text-[#8A7F74] flex items-center gap-1 mt-1 font-medium">
                  <Navigation2 size={14} />
                  {selectedNode.distanceKm < 1 ? Math.round(selectedNode.distanceKm * 1000) + 'm' : selectedNode.distanceKm.toFixed(1) + 'km'} away
                </p>
                <div className="flex gap-3 mt-6 w-full">
                  <button className="flex-1 bg-[#C8521A] text-white py-3 rounded-xl font-bold text-sm">Message</button>
                  <button className="flex-1 bg-[#2E2822] text-[#F5F0EA] py-3 rounded-xl font-bold text-sm">View Profile</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyNodes.map(node => (
                  <div key={node.id} className="flex items-center gap-4 bg-[#0F0D0B] p-3 rounded-2xl border border-[#2E2822]">
                    <div className="relative w-12 h-12 rounded-full bg-[#2E2822] overflow-hidden">
                      {node.avatar && <img src={node.avatar} className="w-full h-full object-cover" />}
                      {node.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0F0D0B]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[#F5F0EA] font-bold truncate">{node.name}</h4>
                        <span className="text-xs font-bold text-[#E8A055]">
                          {node.distanceKm < 1 ? Math.round(node.distanceKm * 1000) + 'm' : node.distanceKm.toFixed(1) + 'km'}
                        </span>
                      </div>
                      <p className="text-[#8A7F74] text-xs truncate mt-0.5">
                        {node.online ? 'Active now' : 'Recently active'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {nearbyNodes.length === 0 && (
                  <div className="text-center text-[#8A7F74] py-8 font-medium">
                    Nobody nearby right now.
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
