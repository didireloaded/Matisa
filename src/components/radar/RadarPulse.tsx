export function RadarPulse() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 w-[100px] h-[100px]">
      <div className="relative w-full h-full">
        {/* We use standard CSS animations for the pulse effect to ensure performance */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-[#C8521A] animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30" 
        />
        <div 
          className="absolute inset-0 rounded-full border-2 border-[#E8A055] animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"
          style={{ animationDelay: '1.5s' }}
        />
        <div 
          className="absolute inset-0 rounded-full border border-white animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] opacity-10"
          style={{ animationDelay: '3s' }}
        />
      </div>
    </div>
  );
}
