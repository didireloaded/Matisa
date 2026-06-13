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

  const getRingStyle = () => {
    switch (node.state) {
      case 'online': return { background: 'linear-gradient(135deg, #4CAF7D, #1A5C3A)', boxShadow: '0 0 15px rgba(76, 175, 125, 0.4)' };
      case 'story': return { background: 'linear-gradient(135deg, #C8521A, #E8A055)', boxShadow: '0 0 15px rgba(200, 82, 26, 0.4)' };
      case 'voice': return { background: 'linear-gradient(135deg, #6B2D7D, #2A1040)', boxShadow: '0 0 15px rgba(107, 45, 125, 0.4)' };
      case 'verified': return { background: 'linear-gradient(135deg, #2D7DD2, #1A3A60)', boxShadow: '0 0 15px rgba(45, 125, 210, 0.4)' };
      default: return { background: '#2E2822' };
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
      <div className="relative group transition-transform duration-300 hover:scale-110 hover:z-20">
        <div 
          className="w-[50px] h-[50px] rounded-full p-[2px] transition-all duration-300"
          style={getRingStyle()}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-[#1C1814] border-2 border-[#0F0D0B]">
            {node.avatar_url ? (
              <img src={node.avatar_url} alt={node.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#8A7F74] font-bold text-lg" style={{ background: 'linear-gradient(135deg, #2E2822, #1C1814)' }}>
                {node.name.charAt(0)}
              </div>
            )}
          </div>
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
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-center w-max pointer-events-none opacity-90 transition-opacity group-hover:opacity-100">
        <span className="text-[10px] font-semibold tracking-wide text-[#F5F0EA] bg-[#0F0D0B]/60 backdrop-blur-md border border-[#2E2822] shadow-lg px-2 py-0.5 rounded-full">
          {node.name.split(' ')[0]}
        </span>
      </div>
    </motion.div>
  );
}
