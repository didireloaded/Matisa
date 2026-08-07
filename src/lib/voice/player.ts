// src/lib/voice/player.ts
// Production-grade voice playback engine with waveform seeking, preloading, and speed controls

export interface VoicePlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isLoading: boolean;
  error?: Error;
}

export class VoicePlayer {
  private audioElement: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private onStateChange: (state: VoicePlayerState) => void;
  private preloaded: Map<string, HTMLAudioElement> = new Map();
  private maxPreloaded = 3;
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private state: VoicePlayerState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    isLoading: false,
  };

  constructor(onStateChange: (state: VoicePlayerState) => void) {
    this.onStateChange = onStateChange;
  }

  async play(url: string, startTime: number = 0): Promise<void> {
    if (this.currentUrl !== url) {
      this.stop();

      if (this.preloaded.has(url)) {
        this.audioElement = this.preloaded.get(url)!;
        this.preloaded.delete(url);
      } else {
        this.audioElement = new Audio(url);
      }

      this.currentUrl = url;
      this.setupAudioListeners();
    }

    if (!this.audioElement) return;

    this.updateState({ isLoading: true });

    if (startTime > 0) {
      this.audioElement.currentTime = startTime;
    }

    try {
      await this.audioElement.play();
      this.updateState({ isPlaying: true, isLoading: false });
      this.startProgressTracking();
    } catch (error) {
      this.updateState({ error: error as Error, isLoading: false, isPlaying: false });
    }
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.updateState({ isPlaying: false });
    this.stopProgressTracking();
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.updateState({ isPlaying: false, currentTime: 0 });
    this.stopProgressTracking();
  }

  seek(time: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
    this.updateState({ currentTime: time });
  }

  setPlaybackRate(rate: number): void {
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
    this.updateState({ playbackRate: rate });
  }

  preload(urls: string[]): void {
    const toUnload = Array.from(this.preloaded.keys()).filter((k) => !urls.includes(k));
    toUnload.forEach((url) => {
      const audio = this.preloaded.get(url);
      if (audio) {
        audio.src = "";
        audio.load();
      }
      this.preloaded.delete(url);
    });

    urls.forEach((url) => {
      if (
        !this.preloaded.has(url) &&
        this.preloaded.size < this.maxPreloaded &&
        url !== this.currentUrl
      ) {
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = url;
        this.preloaded.set(url, audio);
      }
    });
  }

  private setupAudioListeners(): void {
    if (!this.audioElement) return;

    this.audioElement.onloadedmetadata = () => {
      this.updateState({ duration: this.audioElement?.duration || 0, isLoading: false });
    };

    this.audioElement.onended = () => {
      this.updateState({ isPlaying: false, currentTime: 0 });
      this.stopProgressTracking();
    };

    this.audioElement.onerror = () => {
      this.updateState({
        error: new Error(this.audioElement?.error?.message || "Playback error"),
        isLoading: false,
        isPlaying: false,
      });
      this.stopProgressTracking();
    };
  }

  private startProgressTracking(): void {
    this.stopProgressTracking();
    this.progressInterval = setInterval(() => {
      if (this.audioElement) {
        this.updateState({ currentTime: this.audioElement.currentTime });
      }
    }, 100);
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private updateState(partial: Partial<VoicePlayerState>): void {
    this.state = { ...this.state, ...partial };
    this.onStateChange(this.state);
  }

  destroy(): void {
    this.stop();
    this.preloaded.forEach((audio) => {
      audio.src = "";
      audio.load();
    });
    this.preloaded.clear();
    if (this.audioElement) {
      this.audioElement.src = "";
      this.audioElement.load();
      this.audioElement = null;
    }
  }
}

export default VoicePlayer;
