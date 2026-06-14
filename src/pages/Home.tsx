import { Map } from "lucide-react";

export function Home() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-full bg-[#1C1814] p-6 shadow-2xl border border-[#2E2822]">
        <Map size={48} className="text-[#C8521A] opacity-80" />
      </div>
      <h2 className="mb-2 text-[#F5F0EA] text-2xl font-bold">Map Discovery</h2>
      <p className="max-w-xs text-[#8A7F74]">
        The new map-based discovery experience is under construction.
      </p>
    </div>
  );
}
