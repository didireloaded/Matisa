import { useState } from 'react';
import { motion } from 'framer-motion';
import { RadarFilters, RadarFilterType } from './RadarFilters';
import { RadarRings } from './RadarRings';
import { RadarAvatar, RadarNodeData } from './RadarAvatar';
import { RadarBottomSheet } from './RadarBottomSheet';
import { centerPulseAnimation } from './RadarAnimations';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../shared';

// Generate some fake users distributed around the radar
const mockNodes: RadarNodeData[] = [
  { id: '1', name: 'Sarah', avatar_url: null, distance: '1.2 km', status: 'Listening to Amapiano', mutuals: 12, state: 'online', angle: 45, radius: 0.3 },
  { id: '2', name: 'Jason', avatar_url: null, distance: '3.4 km', status: 'At the mall', mutuals: 4, state: 'story', angle: 135, radius: 0.5 },
  { id: '3', name: 'Mike', avatar_url: null, distance: '800 m', status: 'Chilling', mutuals: 2, state: 'offline', angle: 220, radius: 0.2 },
  { id: '4', name: 'Emma', avatar_url: null, distance: '5.1 km', status: 'Gym time', mutuals: 8, state: 'voice', angle: 310, radius: 0.6 },
  { id: '5', name: 'John', avatar_url: null, distance: '12 km', status: 'Working', mutuals: 1, state: 'verified', angle: 15, radius: 0.8 },
  { id: '6', name: 'Lisa', avatar_url: null, distance: '2.2 km', status: 'Coffee shop', mutuals: 22, state: 'online', angle: 180, radius: 0.4 },
  { id: '7', name: 'David', avatar_url: null, distance: '900 m', status: 'Out walking', mutuals: 0, state: 'story', angle: 275, radius: 0.35 },
  { id: '8', name: 'Anna', avatar_url: null, distance: '15 km', status: 'Studying', mutuals: 5, state: 'offline', angle: 90, radius: 0.9 },
];

import { useRadar } from '../../hooks/useRadar';

export function RadarCanvas() {
  const { profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState<RadarFilterType>('people');
  const [selectedNode, setSelectedNode] = useState<RadarNodeData | null>(null);
  const { nearbyUsers, onlineUserIds, loading } = useRadar();

  const displayedNodes: RadarNodeData[] = (nearbyUsers || []).map((u, i) => {
    // Generate deterministic angle and radius based on ID so they don't jump around
    const angle = (parseInt(u.id.replace(/-/g, '').substring(0, 8), 16) % 360);
    const radius = Math.min(0.2 + (u.distance / 50000) * 0.8, 1.0); // scale max 50km
    const isOnline = onlineUserIds.has(u.id);

    return {
      id: u.id,
      name: (u.full_name || u.username || 'User').split(' ')[0],
      avatar_url: u.avatar_url,
      distance: u.distance < 1000 ? `${Math.round(u.distance)} m` : `${(u.distance / 1000).toFixed(1)} km`,
      status: isOnline ? 'Online' : 'Offline',
      mutuals: 0,
      state: isOnline ? 'online' : 'offline',
      angle,
      radius
    };
  });

  return (
    <div className="relative flex-1 w-full bg-[#0F0D0B] overflow-hidden flex items-center justify-center">
      
      <RadarFilters activeFilter={activeFilter} onChange={setActiveFilter} />

      {/* The Radar Universe Space */}
      <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
        
        <RadarRings />

        {/* Center Node (Current User) */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          variants={centerPulseAnimation}
          animate="animate"
        >
          <div className="relative">
            {profile ? (
              <Avatar profile={profile} size={72} ring className="border-[#C8521A] shadow-[0_0_30px_rgba(200,82,26,0.5)]" />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full border-4 border-[#C8521A] bg-[#1C1814] flex items-center justify-center shadow-[0_0_30px_rgba(200,82,26,0.5)] text-[#E8A055] font-bold text-xl">
                YOU
              </div>
            )}
            
            {/* Center Pulse Ring */}
            <span className="absolute inset-0 rounded-full border border-[#C8521A] animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          </div>
        </motion.div>

        {/* Avatar Nodes */}
        {displayedNodes.map((node, i) => (
          <RadarAvatar 
            key={node.id} 
            node={node} 
            index={i} 
            onClick={setSelectedNode} 
          />
        ))}

        {/* Empty states for other filters visually */}
        {activeFilter !== 'people' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-32">
            <p className="text-[#8A7F74] text-sm font-medium bg-[#1C1814]/80 px-4 py-1.5 rounded-full backdrop-blur-md">
              No {activeFilter} nearby
            </p>
          </div>
        )}

      </div>

      <RadarBottomSheet 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />

    </div>
  );
}
