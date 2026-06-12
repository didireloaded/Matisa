export function RadarRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" className="opacity-40">
        <defs>
          <radialGradient id="ringGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="80%" stopColor="#2E2822" stopOpacity="0" />
            <stop offset="100%" stopColor="#2E2822" stopOpacity="0.8" />
          </radialGradient>
        </defs>

        {/* Ring 1: Close Friends */}
        <circle cx="500" cy="500" r="120" fill="none" stroke="#2E2822" strokeWidth="1" />
        
        {/* Ring 2: Mutual Friends */}
        <circle cx="500" cy="500" r="220" fill="none" stroke="#2E2822" strokeWidth="1" />
        
        {/* Ring 3: Nearby Users */}
        <circle cx="500" cy="500" r="340" fill="none" stroke="#2E2822" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Ring 4: City Users */}
        <circle cx="500" cy="500" r="480" fill="none" stroke="#2E2822" strokeWidth="1" strokeDasharray="2 6" />
      </svg>
    </div>
  );
}
