import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoicePlayerProps {
  url?: string;
  duration: number; // in seconds
}

export function VoicePlayer({ url, duration }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  
  const togglePlay = () => setIsPlaying(!isPlaying);

  const [waveform] = useState(() => Array.from({ length: 30 }, () => Math.max(20, Math.random() * 100)));

  return (
    <div className="flex items-center gap-3 bg-secondary/30 backdrop-blur-sm p-2 pr-4 rounded-full w-full">
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-lg shadow-primary/20 transition-transform active:scale-95"
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
      </button>

      <div className="flex-1 flex items-center gap-[2px] h-8">
        {waveform.map((h, i) => (
          <motion.div 
            key={i}
            className="flex-1 bg-primary rounded-full origin-center"
            initial={{ height: '20%' }}
            animate={{ 
              height: isPlaying ? `${h}%` : '20%',
              opacity: (progress / duration) > (i / 30) ? 1 : 0.5
            }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          />
        ))}
      </div>

      <div className="text-xs font-semibold text-muted-foreground shrink-0 tabular-nums">
        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
}
