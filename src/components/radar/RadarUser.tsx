import React from 'react';
import { RadarNode } from './radarUtils';
import { User } from 'lucide-react';

interface RadarUserProps {
  node: RadarNode;
  onClick: (node: RadarNode) => void;
}

export const RadarUser = React.memo(({ node, onClick }: RadarUserProps) => {
  return (
    <div 
      className="absolute top-1/2 left-1/2 z-30 cursor-pointer group"
      style={{
        transform: `translate(calc(-50% + ${node.x}px), calc(-50% + ${node.y}px))`,
      }}
      onClick={() => onClick(node)}
    >
      {/* The floating animation wrapper */}
      <div 
        className="flex flex-col items-center justify-center relative transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
        style={{
          animation: `float ${node.animDuration} ease-in-out infinite`,
          animationDelay: node.animDelay,
        }}
      >
        {/* Avatar Ring */}
        <div 
          className="relative rounded-full border-2 p-0.5"
          style={{ 
            borderColor: node.online ? '#22c55e' : '#8A7F74',
            width: node.size,
            height: node.size
          }}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-[#1C1814] border border-[#0F0D0B] flex items-center justify-center text-[#8A7F74]">
            {node.avatar ? (
              <img src={node.avatar} alt={node.name} className="w-full h-full object-cover" />
            ) : (
              <User size={node.size * 0.5} />
            )}
          </div>
          
          {/* Online Indicator Badge */}
          {node.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22c55e] border-2 border-[#0F0D0B]" />
          )}
        </div>

        {/* Name Label */}
        <div className="absolute -bottom-6 w-max">
          <span className="bg-[#1C1814]/90 backdrop-blur-sm border border-[#2E2822] px-2 py-0.5 rounded-full text-[10px] font-bold text-[#F5F0EA] shadow-xl">
            {node.name}
          </span>
        </div>
      </div>
    </div>
  );
});

// Add the keyframes globally or within index.css
// To avoid touching css right now, we can inject it
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes float {
      0% { transform: translate(0px, 0px); }
      50% { transform: translate(4px, -6px); }
      100% { transform: translate(0px, 0px); }
    }
  `;
  document.head.appendChild(style);
}
