export function RadarRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      
      {/* Radar Sweep Gradient */}
      <div className="absolute inset-0 rounded-full border border-[#C8521A]/10 overflow-hidden">
        <div 
          className="absolute top-0 right-1/2 bottom-1/2 left-0 origin-bottom-right"
          style={{
            background: 'conic-gradient(from 180deg at 100% 100%, transparent 0deg, rgba(200,82,26,0.02) 40deg, rgba(200,82,26,0.4) 90deg, transparent 90deg)',
            animation: 'radar-sweep 4s linear infinite'
          }}
        />
      </div>

      {/* SVG Rings */}
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" className="opacity-50">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ring 1 */}
        <circle cx="500" cy="500" r="140" fill="none" stroke="#C8521A" strokeOpacity="0.15" strokeWidth="1" filter="url(#glow)" />
        
        {/* Ring 2 */}
        <circle cx="500" cy="500" r="260" fill="none" stroke="#2D7DD2" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 8" style={{ transformOrigin: 'center', animation: 'spin-slow 60s linear infinite' }} />
        
        {/* Ring 3 */}
        <circle cx="500" cy="500" r="380" fill="none" stroke="#4CAF7D" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="2 10" style={{ transformOrigin: 'center', animation: 'spin-slow-reverse 90s linear infinite' }} />
        
        {/* Ring 4 */}
        <circle cx="500" cy="500" r="498" fill="none" stroke="#E8A055" strokeOpacity="0.05" strokeWidth="1" />
      </svg>
      
      {/* Global CSS for these specific animations */}
      <style>{`
        @keyframes radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-slow {
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          100% { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
