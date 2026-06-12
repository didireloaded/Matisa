import { motion } from 'framer-motion';
import { generateFloatAnimation } from './RadarAnimations';

export interface RadarNodeData {
  id: string;
  name: string;
  avatar_url: string | null;
  distance: string;
  status: string;
  mutuals: number;
  state: 'online' | 'story' | 'voice' | 'verified' | 'offline';
  angle: number; // 0-360
  radius: number; // Percentage or absolute distance from center
}

interface RadarAvatarProps {
  node: RadarNodeData;
  index: number;
  onClick: (node: RadarNodeData) => void;
}

export function RadarAvatar({ node, index, onClick }: RadarAvatarProps) {
  // Convert polar coordinates to CSS positioning
  // Assuming a 300px max radius for the component space
  const maxRadius = 150; // Half of container approx
  const x = Math.cos((node.angle * Math.PI) / 180) * (node.radius * maxRadius);
  const y = Math.sin((node.angle * Math.PI) / 180) * (node.radius * maxRadius);

  const getRingColor = () => {
    switch (node.state) {
      case 'online': return 'border-green-500';
      case 'story': return 'border-orange-500';
      case 'voice': return 'border-purple-500';
      case 'verified': return 'border-yellow-500';
      default: return 'border-transparent';
    }
  };

  return (
    <motion.div
      variants={generateFloatAnimation(index)}
      initial="initial"
      animate="animate"
      className="absolute cursor-pointer"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)' // Center the avatar on the coordinate
      }}
      onClick={() => onClick(node)}
    >
      <div className="relative">
        <div className={`w-12 h-12 rounded-full border-2 ${getRingColor()} overflow-hidden shadow-lg bg-[#1C1814]`}>
          {node.avatar_url ? (
            <img src={node.avatar_url} alt={node.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8A7F74] font-bold text-lg">
              {node.name.charAt(0)}
            </div>
          )}
        </div>
        
        {/* Pulse Effect for Online */}
        {node.state === 'online' && (
          <span className="absolute bottom-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-[#0F0D0B]"></span>
          </span>
        )}
      </div>
      
      {/* Name Label */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-center w-max">
        <span className="text-[10px] font-medium text-[#F5F0EA] bg-[#0F0D0B]/80 px-1.5 py-0.5 rounded backdrop-blur-sm">
          {node.name.split(' ')[0]}
        </span>
      </div>
    </motion.div>
  );
}
