import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { useState } from 'react';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-40 p-3 pb-safe">
      <div className="flex items-center gap-3 max-w-md mx-auto">
        <div className="w-12 h-12 bg-secondary rounded-md overflow-hidden shrink-0 shadow-sm">
          <img src="https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?w=100&h=100&fit=crop" alt="Album Cover" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate">Ondjila</h4>
          <p className="text-xs text-muted-foreground truncate">Gazza</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md transition-transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
      {/* Mini Progress Bar */}
      <div className="absolute top-0 left-0 h-[2px] bg-primary w-1/3"></div>
    </div>
  );
}
