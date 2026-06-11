import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MapPin, SlidersHorizontal, UserX, UserCheck } from 'lucide-react';

export function Radar() {
  const { ghostMode, setGhostMode } = useAppStore();
  const [distance, setDistance] = useState(5); // 5km default

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] relative bg-background">
      {/* Map Background (Placeholder) */}
      <div className="absolute inset-0 bg-[#1A1A1A]">
        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/17.0628,-22.5609,13,0/1200x800?access_token=YOUR_MAPBOX_TOKEN')] bg-cover bg-center opacity-60" />
        {/* Animated Radar Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 radar-ring pointer-events-none" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-background/80 to-transparent pt-safe">
        <h1 className="text-2xl font-display font-bold text-foreground">Radar</h1>
        
        {/* Ghost Mode Toggle */}
        <button 
          onClick={() => setGhostMode(ghostMode === 'exact' ? 'invisible' : 'exact')}
          className={`p-2 rounded-full backdrop-blur-md transition-colors ${
            ghostMode === 'invisible' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
          }`}
        >
          {ghostMode === 'invisible' ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
        </button>
      </div>

      {/* Floating Action Button for Filters */}
      <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-3">
        <div className="bg-card/80 backdrop-blur-md border border-border p-3 rounded-2xl flex flex-col items-center gap-4 shadow-xl">
          <div className="flex flex-col items-center
<truncated 1912 bytes>


