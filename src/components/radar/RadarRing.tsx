export function RadarRing() {
  return (
    <>
      {/* 4 Rings mapping to the 4 distance bands */}
      {/* Edge Ring (20km+) */}
      <div className="absolute top-1/2 left-1/2 w-[95%] h-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 opacity-40 pointer-events-none" />
      
      {/* Outer Ring (10km-20km) */}
      <div className="absolute top-1/2 left-1/2 w-[70%] h-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 opacity-50 pointer-events-none" />
      
      {/* Middle Ring (2km-10km) */}
      <div className="absolute top-1/2 left-1/2 w-[45%] h-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#E8A055]/20 opacity-60 pointer-events-none" />
      
      {/* Inner Ring (0-2km) */}
      <div className="absolute top-1/2 left-1/2 w-[25%] h-[25%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C8521A]/30 opacity-80 pointer-events-none shadow-[0_0_20px_rgba(200,82,26,0.1)]" />

      {/* Crosshairs */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5 -translate-x-1/2 pointer-events-none" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/5 -translate-y-1/2 pointer-events-none" />
    </>
  );
}
