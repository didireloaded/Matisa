import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRadar } from '@/hooks/useRadar';
import { RawRadarUser, useRadarPositions } from './useRadarPositions';
import { RadarNode } from './radarUtils';
import { RadarRing } from './RadarRing';
import { RadarCenter } from './RadarCenter';
import { RadarPulse } from './RadarPulse';
import { RadarUser } from './RadarUser';
import { RadarBottomSheet } from './RadarBottomSheet';
import { Radar as RadarIcon, Users, MessageCircle } from 'lucide-react';

export function Radar() {
  const { profile } = useAuth();
  const { nearbyUsers, onlineUserIds, loading } = useRadar();
  const [selectedNode, setSelectedNode] = useState<RadarNode | null>(null);
  
  // We need the container size for the positioning hook
  // A standard square constraint ensures circles don't stretch into ovals
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Use the smaller dimension to maintain a square radar
        const minDim = Math.min(entry.contentRect.width, entry.contentRect.height);
        if (minDim > 0) {
          setContainerSize(minDim);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Map supabase users to RawRadarUser
  const rawUsers: RawRadarUser[] = useMemo(() => {
    if (!nearbyUsers) return [];
    return nearbyUsers.map(u => ({
      id: u.id,
      name: (u.display_name || u.username || 'User').split(' ')[0],
      avatar: u.avatar_url,
      // Convert meters to km
      distanceKm: (u.distance_m ?? 0) / 1000,
      online: onlineUserIds.has(u.id)
    }));
  }, [nearbyUsers, onlineUserIds]);

  const positionedNodes = useRadarPositions(rawUsers, containerSize);

  return (
    <div className="relative flex-1 w-full h-full bg-[#0F0D0B] overflow-hidden flex flex-col items-center">
      
      {/* Top Live Counters */}
      <div className="absolute top-4 left-0 right-0 z-30 flex justify-center gap-4 px-4 pointer-events-none">
        <div className="bg-[#1C1814]/80 backdrop-blur-md border border-[#2E2822] rounded-full px-4 py-2 flex items-center gap-2 shadow-xl pointer-events-auto">
          <Users size={14} className="text-[#C8521A]" />
          <span className="text-xs font-bold text-[#F5F0EA]">{positionedNodes.length} Nearby</span>
        </div>
        <div className="bg-[#1C1814]/80 backdrop-blur-md border border-[#2E2822] rounded-full px-4 py-2 flex items-center gap-2 shadow-xl pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span className="text-xs font-bold text-[#F5F0EA]">
            {positionedNodes.filter(n => n.online).length} Online
          </span>
        </div>
      </div>

      {/* Main Radar Container */}
      <div 
        ref={containerRef}
        className="relative flex-1 w-full h-full flex items-center justify-center p-4 max-h-[900px] max-w-[900px] mx-auto"
      >
        <div 
          className="relative rounded-full border border-[#2E2822]"
          style={{ width: containerSize, height: containerSize }}
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-radial from-[#C8521A]/5 to-transparent mix-blend-screen rounded-full" />
          
          <RadarRing />
          <RadarPulse />
          <RadarCenter />

          {/* Render Users */}
          {positionedNodes.map(node => (
            <RadarUser key={node.id} node={node} onClick={setSelectedNode} />
          ))}

          {/* Empty State */}
          {!loading && positionedNodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none text-center px-8">
              <RadarIcon size={48} className="text-[#8A7F74] mb-4 opacity-50 animate-pulse" />
              <h3 className="text-[#F5F0EA] font-bold text-lg">Radar Scanning...</h3>
              <p className="text-[#8A7F74] text-sm mt-2 max-w-[200px]">
                Expand your search radius or discover communities nearby.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet Details */}
      <RadarBottomSheet 
        nearbyNodes={positionedNodes} 
        selectedNode={selectedNode} 
        onCloseSelection={() => setSelectedNode(null)} 
      />
    </div>
  );
}
