import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoicePostProps {
  duration: string;
}

export function VoicePost({ duration }: VoicePostProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate some fake waveform bars for the visual
  const waveformBars = Array.from({ length: 40 }, () => Math.random() * 60 + 20);

  return (
    <div className="bg-card rounded-2xl p-4 flex items-center space-x-4 border border-border mt-3">
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-12 h-12 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform active:scale-95"
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
      </button>

      <div className="flex-1 flex flex-col justify-center space-y-1 overflow-hidden">
        <div className="flex items-center space-x-1 h-8 overflow-hidden">
          {waveformBars.map((height, i) => (
            <motion.div
              key={i}
              className={`w-1 rounded-full ${isPlaying ? 'bg-primary' : 'bg-muted-foreground/50'}`}
              animate={{ height: isPlaying ? [height * 0.5, height, height * 0.5] : height * 0.5 }}
              transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.5 + Math.random(), ease: "easeInOut" }}
              style={{ minHeight: '4px' }}
            />
          ))}
        </div>
        <div className="text-xs text-muted-foreground font-medium">{duration}</div>
      </div>
    </div>
  );
}
