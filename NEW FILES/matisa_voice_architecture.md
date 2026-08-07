
# MATISA VOICE ARCHITECTURE
## Senior Engineering Design — Production-Grade Implementation

---

## TABLE OF CONTENTS

1. Voice Recording Pipeline
2. Audio Compression & Delivery
3. Playback Engine (Waveform + Scrubbing)
4. Voice Rooms (WebRTC SFU)
5. Karaoke System
6. Voice-to-Text (Whisper Pipeline)
7. Voice Messages (Chat)
8. Voice Intro (Profiles)
9. Full App Data Architecture
10. Real-Time Sync
11. Offline-First Strategy
12. Media Pipeline
13. Security & Privacy
14. Monitoring & Observability
15. Scaling Roadmap

---

## 1. VOICE RECORDING PIPELINE

### 1.1 The Problem

Recording voice in a browser is deceptively complex:
- Mobile browsers kill recording when the screen locks
- iOS Safari pauses `getUserMedia` when switching tabs
- Background noise, echo, and gain issues
- Memory leaks from `MediaRecorder` if not cleaned up
- Large file sizes if not compressed

### 1.2 The Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  USER DEVICE (Browser / Capacitor App)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ getUserMedia │→ │ AudioContext │→ │ ScriptProcessor  │   │
│  │ (Mic Stream) │  │ (Gain/Echo)  │  │ (Waveform Data)  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│         │                 │                   │              │
│         ▼                 ▼                   ▼              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          MediaRecorder (WebM/Opus chunks)            │   │
│  │  • Chunk every 1 second (resilient to crashes)       │   │
│  │  • Monitor audio levels for voice activity detection │   │
│  │  • Auto-stop on 5 minutes of silence                 │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Chunk Buffer (in-memory, max 50MB)          │   │
│  │  • Assemble chunks into single Blob                  │   │
│  │  • Generate waveform peaks (100 points for UI)       │   │
│  │  • Calculate duration                                │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Upload to Supabase Storage                  │   │
│  │  • Signed URL from edge function                     │   │
│  │  • Resumable upload (retry on failure)               │   │
│  │  • Progress tracking                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Implementation

```typescript
// src/lib/voice/recorder.ts
// Production-grade voice recorder with resilience

interface RecordingConfig {
  maxDurationMs: number;        // 5 minutes max
  chunkIntervalMs: number;      // 1 second chunks
  silenceThreshold: number;     // -50dB
  silenceTimeoutMs: number;     // 5 seconds of silence = auto-stop
  mimeType: string;             // 'audio/webm;codecs=opus'
}

interface RecordingState {
  status: 'idle' | 'requesting' | 'recording' | 'paused' | 'processing' | 'error';
  durationMs: number;
  chunks: Blob[];
  waveformPeaks: number[];      // 100 points, 0-1
  currentDb: number;            // Current audio level
  error?: Error;
}

class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private chunks: Blob[] = [];
  private waveformData: number[] = [];
  private startTime: number = 0;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private durationInterval: ReturnType<typeof setInterval> | null = null;
  private config: RecordingConfig;
  private onStateChange: (state: RecordingState) => void;

  constructor(
    config: Partial<RecordingConfig> = {},
    onStateChange: (state: RecordingState) => void
  ) {
    this.config = {
      maxDurationMs: 5 * 60 * 1000,  // 5 min
      chunkIntervalMs: 1000,
      silenceThreshold: -50,
      silenceTimeoutMs: 5000,
      mimeType: this.getSupportedMimeType(),
      ...config,
    };
    this.onStateChange = onStateChange;
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    throw new Error('No supported audio MIME type found');
  }

  async start(): Promise<void> {
    try {
      this.updateState({ status: 'requesting' });

      // Request microphone with noise suppression
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1, // Mono for voice
        },
      });

      // Set up AudioContext for waveform visualization
      this.audioContext = new AudioContext({ sampleRate: 48000 });
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      // ScriptProcessor for waveform data (deprecated but still most reliable)
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const peak = Math.max(...inputData.map(Math.abs));
        this.waveformData.push(peak);

        // Keep only last 100 points for UI
        if (this.waveformData.length > 100) {
          this.waveformData.shift();
        }

        // Voice activity detection
        const db = 20 * Math.log10(peak);
        this.updateState({ currentDb: db });

        if (db < this.config.silenceThreshold) {
          if (!this.silenceTimer) {
            this.silenceTimer = setTimeout(() => {
              this.stop(); // Auto-stop on prolonged silence
            }, this.config.silenceTimeoutMs);
          }
        } else {
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        }
      };
      this.analyser.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      // Set up MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.config.mimeType,
        audioBitsPerSecond: 24000, // 24kbps — perfect for voice
      });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.processRecording();
      };

      this.mediaRecorder.onerror = (e) => {
        this.updateState({ status: 'error', error: new Error(`Recorder error: ${e}`) });
        this.cleanup();
      };

      // Start recording
      this.mediaRecorder.start(this.config.chunkIntervalMs);
      this.startTime = Date.now();
      this.updateState({ status: 'recording', durationMs: 0 });

      // Duration timer
      this.durationInterval = setInterval(() => {
        const duration = Date.now() - this.startTime;
        this.updateState({ durationMs: duration });

        if (duration >= this.config.maxDurationMs) {
          this.stop();
        }
      }, 100);

    } catch (error) {
      this.updateState({ status: 'error', error: error as Error });
      this.cleanup();
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private processRecording(): void {
    this.updateState({ status: 'processing' });

    if (this.chunks.length === 0) {
      this.updateState({ status: 'error', error: new Error('No audio data recorded') });
      return;
    }

    const blob = new Blob(this.chunks, { type: this.config.mimeType });
    const duration = Date.now() - this.startTime;

    // Normalize waveform to 0-1 range
    const maxPeak = Math.max(...this.waveformData, 0.001);
    const normalizedPeaks = this.waveformData.map(p => p / maxPeak);

    this.updateState({
      status: 'idle',
      durationMs: duration,
      chunks: [blob],
      waveformPeaks: normalizedPeaks,
    });
  }

  private cleanup(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.chunks = [];
    this.waveformData = [];
  }

  private updateState(partial: Partial<RecordingState>): void {
    this.onStateChange({
      status: 'idle',
      durationMs: 0,
      chunks: [],
      waveformPeaks: [],
      currentDb: -100,
      ...partial,
    });
  }

  destroy(): void {
    this.stop();
    this.cleanup();
  }
}

export default VoiceRecorder;
```

### 1.4 Key Decisions

| Decision | Why |
|----------|-----|
| **Mono (1 channel)** | Voice doesn't need stereo. Halves file size. |
| **24kbps bitrate** | Sweet spot for voice clarity vs. file size. 1 minute = ~180KB. |
| **Opus codec** | Best compression for voice. Supported by all modern browsers. |
| **1-second chunks** | If the browser crashes mid-recording, you don't lose everything. |
| **Auto-stop on silence** | Prevents 5-minute recordings of dead air. |
| **ScriptProcessorNode** | Deprecated but still the most reliable way to get raw waveform data across browsers. AudioWorklet is the future but has spotty mobile support. |

---

## 2. AUDIO COMPRESSION & DELIVERY

### 2.1 The Pipeline

```
Raw Recording (WebM/Opus, 24kbps)
    │
    ▼
┌─────────────────────────────────────┐
│  Client-Side Validation              │
│  • Max 5 minutes                     │
│  • Min 1 second                      │
│  • File size < 10MB                  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Upload to Supabase Storage          │
│  • Signed URL (expires in 60s)       │
│  • Resumable upload                  │
│  • Progress callback                 │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Edge Function: Post-Processing      │
│  • Generate waveform JSON (100 pts)  │
│  • Extract duration                  │
│  • Transcribe via Whisper            │
│  • Store metadata in DB              │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  CDN Delivery                        │
│  • Supabase Storage public URL       │
│  • Cached at edge                    │
│  • Range requests supported          │
└─────────────────────────────────────┘
```

### 2.2 Upload with Resilience

```typescript
// src/lib/voice/upload.ts
interface UploadResult {
  url: string;
  duration: number;
  waveformPeaks: number[];
  transcript?: string;
}

async function uploadVoiceRecording(
  blob: Blob,
  metadata: { userId: string; type: 'note' | 'message' | 'intro' | 'reply' }
): Promise<UploadResult> {
  const fileName = `${metadata.userId}/${metadata.type}/${Date.now()}.webm`;

  // 1. Get signed upload URL from edge function
  const { data: signedUrl } = await supabase.functions.invoke('get-upload-url', {
    body: { fileName, contentType: 'audio/webm' },
  });

  // 2. Upload with retry logic
  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(signedUrl.uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'audio/webm' },
      });

      if (response.ok) break;
      throw new Error(`Upload failed: ${response.status}`);
    } catch (error) {
      attempt++;
      if (attempt >= maxAttempts) throw error;
      await new Promise(r => setTimeout(r, 1000 * attempt)); // Exponential backoff
    }
  }

  // 3. Trigger post-processing edge function
  const { data: processed } = await supabase.functions.invoke('process-voice', {
    body: { fileName, userId: metadata.userId },
  });

  return {
    url: signedUrl.publicUrl,
    duration: processed.duration,
    waveformPeaks: processed.waveformPeaks,
    transcript: processed.transcript,
  };
}
```

### 2.3 Edge Function: Post-Processing

```typescript
// supabase/functions/process-voice/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { fileName, userId } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. Download the file
  const { data: audioData, error: downloadError } = await supabase
    .storage
    .from('voice')
    .download(fileName);

  if (downloadError) throw downloadError;

  // 2. Extract duration using ffprobe (via Deno FFI or external service)
  // For now, use the duration from client + server-side validation
  const arrayBuffer = await audioData.arrayBuffer();
  const duration = await extractDuration(arrayBuffer);

  // 3. Generate waveform peaks (server-side for consistency)
  const waveformPeaks = await generateWaveform(arrayBuffer);

  // 4. Transcribe with Whisper
  const transcript = await transcribeWithWhisper(arrayBuffer);

  // 5. Store metadata
  await supabase.from('voice_metadata').insert({
    file_name: fileName,
    user_id: userId,
    duration,
    waveform_peaks: waveformPeaks,
    transcript,
    processed_at: new Date().toISOString(),
  });

  return new Response(JSON.stringify({ duration, waveformPeaks, transcript }));
});

async function extractDuration(buffer: ArrayBuffer): Promise<number> {
  // Use Web Audio API in a Web Worker, or ffprobe
  // Simplified: parse WebM duration from header
  const view = new DataView(buffer);
  // WebM duration parsing logic...
  return 0; // Placeholder
}

async function generateWaveform(buffer: ArrayBuffer): Promise<number[]> {
  // Generate 100 normalized peaks
  // Use Web Audio API offline context
  return []; // Placeholder
}

async function transcribeWithWhisper(buffer: ArrayBuffer): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: 'audio/webm' }), 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiApiKey}` },
    body: formData,
  });

  const result = await response.json();
  return result.text || '';
}
```

---

## 3. PLAYBACK ENGINE

### 3.1 Requirements

- Waveform visualization (100 bars)
- Play/pause with one tap
- Scrubbing (drag to seek)
- Playback speed (1x, 1.5x, 2x)
- Preload next voice note in conversation
- Auto-play next message in sequence
- Memory management (don't keep 50 audio elements in DOM)

### 3.2 Architecture

```typescript
// src/lib/voice/player.ts
import { Howl } from 'howler'; // Or native Audio API

interface VoicePlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isLoading: boolean;
  error?: Error;
}

class VoicePlayer {
  private howl: Howl | null = null;
  private currentUrl: string | null = null;
  private onStateChange: (state: VoicePlayerState) => void;
  private preloadQueue: string[] = [];
  private preloaded: Map<string, Howl> = new Map();
  private maxPreloaded = 3; // Keep only 3 in memory

  constructor(onStateChange: (state: VoicePlayerState) => void) {
    this.onStateChange = onStateChange;
  }

  async play(url: string, startTime: number = 0): Promise<void> {
    // Stop current
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
    }

    // Check if preloaded
    if (this.preloaded.has(url)) {
      this.howl = this.preloaded.get(url)!;
    } else {
      this.howl = new Howl({
        src: [url],
        html5: true, // Force HTML5 Audio for streaming
        format: ['webm', 'opus'],
        preload: true,
        onload: () => {
          this.updateState({ isLoading: false, duration: this.howl!.duration() });
        },
        onplay: () => {
          this.updateState({ isPlaying: true });
          this.startProgressTracking();
        },
        onpause: () => {
          this.updateState({ isPlaying: false });
          this.stopProgressTracking();
        },
        onend: () => {
          this.updateState({ isPlaying: false, currentTime: 0 });
          this.stopProgressTracking();
          this.onPlaybackComplete();
        },
        onloaderror: (_id, error) => {
          this.updateState({ error: new Error(`Load error: ${error}`), isLoading: false });
        },
        onplayerror: (_id, error) => {
          this.updateState({ error: new Error(`Play error: ${error}`) });
        },
      });
    }

    this.currentUrl = url;
    this.updateState({ isLoading: true });

    if (startTime > 0) {
      this.howl.seek(startTime);
    }

    this.howl.play();
  }

  pause(): void {
    if (this.howl) {
      this.howl.pause();
    }
  }

  seek(time: number): void {
    if (this.howl) {
      this.howl.seek(time);
      this.updateState({ currentTime: time });
    }
  }

  setPlaybackRate(rate: number): void {
    if (this.howl) {
      this.howl.rate(rate);
      this.updateState({ playbackRate: rate });
    }
  }

  preload(urls: string[]): void {
    // Unload old preloads
    const toUnload = Array.from(this.preloaded.keys()).filter(
      k => !urls.includes(k)
    );
    toUnload.forEach(url => {
      this.preloaded.get(url)?.unload();
      this.preloaded.delete(url);
    });

    // Preload new
    urls.forEach(url => {
      if (!this.preloaded.has(url) && this.preloaded.size < this.maxPreloaded) {
        const howl = new Howl({
          src: [url],
          html5: true,
          preload: true,
        });
        this.preloaded.set(url, howl);
      }
    });
  }

  private progressInterval: ReturnType<typeof setInterval> | null = null;

  private startProgressTracking(): void {
    this.progressInterval = setInterval(() => {
      if (this.howl) {
        this.updateState({ currentTime: this.howl.seek() as number });
      }
    }, 100);
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private onPlaybackComplete(): void {
    // Auto-play next in queue if configured
  }

  private updateState(partial: Partial<VoicePlayerState>): void {
    this.onStateChange({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1,
      isLoading: false,
      ...partial,
    });
  }

  destroy(): void {
    this.stopProgressTracking();
    this.preloaded.forEach(h => h.unload());
    this.preloaded.clear();
    if (this.howl) {
      this.howl.unload();
      this.howl = null;
    }
  }
}

export default VoicePlayer;
```

### 3.3 Waveform Component

```tsx
// src/components/VoiceWaveform.tsx
interface VoiceWaveformProps {
  peaks: number[];        // 100 values, 0-1
  progress: number;       // 0-1
  onSeek: (progress: number) => void;
  isPlaying: boolean;
  barColor?: string;
  playedColor?: string;
}

export function VoiceWaveform({
  peaks,
  progress,
  onSeek,
  isPlaying,
  barColor = 'rgba(255,255,255,0.2)',
  playedColor = '#00D9C0',
}: VoiceWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, x / rect.width));
    onSeek(newProgress);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="flex items-center gap-[2px] h-8 cursor-pointer select-none"
    >
      {peaks.map((peak, i) => {
        const isPlayed = i / peaks.length < progress;
        const height = Math.max(4, peak * 32);

        return (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-150"
            style={{
              height: `${height}px`,
              backgroundColor: isPlayed ? playedColor : barColor,
              opacity: isPlaying ? 1 : 0.7,
            }}
          />
        );
      })}
    </div>
  );
}
```

---

## 4. VOICE ROOMS (WebRTC SFU)

### 4.1 Architecture Decision: SFU vs. P2P vs. MCU

| Architecture | Pros | Cons | Best For |
|-------------|------|------|----------|
| **P2P (Mesh)** | Simple, no server | Doesn't scale past 4-5 people | 1:1 calls |
| **MCU (Mixer)** | One stream per user | High server cost, high latency | Broadcasting |
| **SFU (Selective Forwarding)** | Scales to 100+ people, low latency | Needs server infrastructure | **Voice rooms** |

**Matisa uses SFU via LiveKit.**

### 4.2 LiveKit Integration

```typescript
// src/lib/voice/room.ts
import { Room, RoomEvent, Track } from 'livekit-client';

interface RoomState {
  isConnected: boolean;
  participants: ParticipantInfo[];
  localParticipant: LocalParticipantInfo | null;
  dominantSpeaker: string | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
}

interface ParticipantInfo {
  sid: string;
  identity: string;
  name: string;
  avatarUrl: string;
  isSpeaking: boolean;
  audioLevel: number;
  isMuted: boolean;
  isHandRaised: boolean;
  role: 'host' | 'co_host' | 'speaker' | 'listener';
}

class VoiceRoomManager {
  private room: Room | null = null;
  private onStateChange: (state: RoomState) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(onStateChange: (state: RoomState) => void) {
    this.onStateChange = onStateChange;
  }

  async join(roomId: string, token: string): Promise<void> {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
      audioCaptureDefaults: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1,
      },
      publishDefaults: {
        audioBitrate: 24000,
        dtx: true, // Discontinuous Transmission — saves bandwidth when silent
        red: true, // Redundant encoding — helps with packet loss
      },
    });

    // Event handlers
    this.room.on(RoomEvent.Connected, () => {
      this.reconnectAttempts = 0;
      this.updateState();
    });

    this.room.on(RoomEvent.Disconnected, (reason) => {
      this.handleDisconnect(reason);
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      // Show reconnection UI
    });

    this.room.on(RoomEvent.ParticipantConnected, () => {
      this.updateState();
    });

    this.room.on(RoomEvent.ParticipantDisconnected, () => {
      this.updateState();
    });

    this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      this.updateState();
    });

    this.room.on(RoomEvent.ConnectionQualityChanged, (quality) => {
      this.updateState();
    });

    // Connect
    await this.room.connect('wss://your-livekit-server.com', token);

    // Publish audio
    await this.room.localParticipant.setMicrophoneEnabled(true);

    this.updateState();
  }

  async leave(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
  }

  async toggleMute(): Promise<void> {
    if (this.room) {
      const enabled = this.room.localParticipant.isMicrophoneEnabled;
      await this.room.localParticipant.setMicrophoneEnabled(!enabled);
      this.updateState();
    }
  }

  async raiseHand(): Promise<void> {
    // Send data message to signal hand raise
    if (this.room) {
      await this.room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify({ type: 'hand_raise' })),
        { reliable: true }
      );
    }
  }

  private handleDisconnect(reason: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        // Attempt reconnect
      }, 1000 * this.reconnectAttempts);
    }
  }

  private updateState(): void {
    if (!this.room) return;

    const participants: ParticipantInfo[] = [];

    this.room.participants.forEach((p) => {
      participants.push({
        sid: p.sid,
        identity: p.identity,
        name: p.name || p.identity,
        avatarUrl: '', // Fetch from your DB
        isSpeaking: p.isSpeaking,
        audioLevel: p.audioLevel,
        isMuted: !p.isMicrophoneEnabled,
        isHandRaised: false, // Track via data messages
        role: 'listener', // Determine from your DB
      });
    });

    this.onStateChange({
      isConnected: this.room.state === 'connected',
      participants,
      localParticipant: {
        sid: this.room.localParticipant.sid,
        identity: this.room.localParticipant.identity,
        isMuted: !this.room.localParticipant.isMicrophoneEnabled,
        isSpeaking: this.room.localParticipant.isSpeaking,
      },
      dominantSpeaker: this.room.activeSpeakers[0]?.identity || null,
      connectionQuality: 'good',
    });
  }
}

export default VoiceRoomManager;
```

### 4.3 LiveKit Server Setup

```yaml
# livekit.yaml (server config)
port: 7880
bind_addresses:
  - "0.0.0.0"

rtc:
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: true
  # TURN server for NAT traversal
  turn_servers:
    - host: turn.your-domain.com
      port: 3478
      protocol: udp
      username: your-turn-user
      credential: your-turn-pass

# Redis for distributed state
redis:
  address: localhost:6379

# Webhooks to your backend
webhook:
  urls:
    - https://your-api.com/webhooks/livekit
  api_key: your-webhook-api-key

# API keys
keys:
  your-api-key: your-api-secret
```

### 4.4 Token Generation (Edge Function)

```typescript
// supabase/functions/livekit-token/index.ts
import { AccessToken } from 'https://esm.sh/livekit-server-sdk@1';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { roomId, userId, username, role } = await req.json();

  const apiKey = Deno.env.get('LIVEKIT_API_KEY')!;
  const apiSecret = Deno.env.get('LIVEKIT_API_SECRET')!;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: username,
  });

  // Permissions based on role
  const canPublish = role === 'host' || role === 'co_host' || role === 'speaker';

  at.addGrant({
    roomJoin: true,
    room: roomId,
    canPublish: canPublish,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = at.toJwt();

  return new Response(JSON.stringify({ token }));
});
```

---

## 5. KARAOKE SYSTEM

### 5.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  KARAOKE ROOM                                               │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Audio Track │  │ Lyrics LRC  │  │  Pitch Detection    │  │
│  │ (MP3/OGG)   │  │  (Synced)   │  │  (Optional)         │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘  │
│         │                │                                   │
│         ▼                ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Synchronized Playback Engine                │   │
│  │  • Web Audio API for precise timing                  │   │
│  │  • Lyrics highlight at exact timestamps              │   │
│  │  • Countdown before performance                      │   │
│  │  • Recording of user's voice + track                 │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Audience Experience                         │   │
│  │  • Real-time reactions (emoji rain)                  │   │
│  │  • Voting/rating after performance                   │   │
│  │  • Chat messages during performance                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 LRC Lyrics Format

```
[ti:Kapana Vibes]
[ar:Gaza Jam Session]
[al:Namibian Hits]
[length:03:45.00]

[00:00.00]Under the Namibian sky
[00:03.50]We sing as one
[00:06.20]The rhythm of the desert
[00:09.00]Has just begun
[00:12.50]Feel the beat in your soul
[00:15.80]Let the music take control
[00:19.00]Kapana vibes, Gaza style
[00:22.50]Make you dance, make you smile
```

### 5.3 Karaoke Player Implementation

```typescript
// src/lib/karaoke/player.ts
interface LyricLine {
  time: number;      // milliseconds
  text: string;
  duration: number;  // milliseconds
}

interface KaraokeState {
  status: 'idle' | 'countdown' | 'playing' | 'paused' | 'finished';
  currentTime: number;
  currentLineIndex: number;
  countdown: number;
  isRecording: boolean;
}

class KaraokePlayer {
  private audioContext: AudioContext | null = null;
  private trackSource: AudioBufferSourceNode | null = null;
  private vocalGain: GainNode | null = null;
  private trackGain: GainNode | null = null;
  private lyrics: LyricLine[] = [];
  private startTime: number = 0;
  private pauseTime: number = 0;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private onStateChange: (state: KaraokeState) => void;

  constructor(onStateChange: (state: KaraokeState) => void) {
    this.onStateChange = onStateChange;
  }

  async loadTrack(trackUrl: string, lyricsLrc: string): Promise<void> {
    this.audioContext = new AudioContext();
    this.lyrics = this.parseLrc(lyricsLrc);

    // Load audio track
    const response = await fetch(trackUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // Set up audio graph
    this.trackSource = this.audioContext.createBufferSource();
    this.trackSource.buffer = audioBuffer;

    this.trackGain = this.audioContext.createGain();
    this.trackGain.gain.value = 0.7; // Reduce track volume so singer can hear themselves

    this.vocalGain = this.audioContext.createGain();
    this.vocalGain.gain.value = 1.0;

    // Connect: track → trackGain → destination
    this.trackSource.connect(this.trackGain);
    this.trackGain.connect(this.audioContext.destination);

    // Connect mic → vocalGain → destination
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const micSource = this.audioContext.createMediaStreamSource(micStream);
    micSource.connect(this.vocalGain);
    this.vocalGain.connect(this.audioContext.destination);

    // Set up recording
    this.mediaRecorder = new MediaRecorder(micStream);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data);
    };
  }

  async start(): Promise<void> {
    // Countdown
    for (let i = 3; i > 0; i--) {
      this.updateState({ status: 'countdown', countdown: i });
      await new Promise(r => setTimeout(r, 1000));
    }

    // Start playback
    this.trackSource!.start(0);
    this.mediaRecorder!.start();
    this.startTime = this.audioContext!.currentTime;

    this.updateState({ status: 'playing', isRecording: true });
    this.startLyricTracking();
  }

  private startLyricTracking(): void {
    const track = () => {
      if (!this.audioContext) return;

      const currentTime = (this.audioContext.currentTime - this.startTime) * 1000;
      const currentLine = this.lyrics.findIndex(
        (l, i) => currentTime >= l.time && 
        (i === this.lyrics.length - 1 || currentTime < this.lyrics[i + 1].time)
      );

      this.updateState({
        currentTime,
        currentLineIndex: Math.max(0, currentLine),
      });

      if (this.trackSource && this.audioContext.currentTime - this.startTime < this.trackSource.buffer!.duration) {
        requestAnimationFrame(track);
      } else {
        this.finish();
      }
    };
    requestAnimationFrame(track);
  }

  pause(): void {
    this.audioContext?.suspend();
    this.mediaRecorder?.pause();
    this.updateState({ status: 'paused' });
  }

  resume(): void {
    this.audioContext?.resume();
    this.mediaRecorder?.resume();
    this.updateState({ status: 'playing' });
  }

  private finish(): void {
    this.mediaRecorder?.stop();
    this.updateState({ status: 'finished', isRecording: false });

    // Upload recording
    const recording = new Blob(this.recordedChunks, { type: 'audio/webm' });
    // Upload to server...
  }

  private parseLrc(lrcText: string): LyricLine[] {
    const lines: LyricLine[] = [];
    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

    lrcText.split('\n').forEach(line => {
      const match = line.match(regex);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const ms = parseInt(match[3].padEnd(3, '0'));
        const time = (minutes * 60 + seconds) * 1000 + ms;
        lines.push({ time, text: match[4].trim(), duration: 0 });
      }
    });

    // Calculate durations
    for (let i = 0; i < lines.length - 1; i++) {
      lines[i].duration = lines[i + 1].time - lines[i].time;
    }

    return lines;
  }

  private updateState(partial: Partial<KaraokeState>): void {
    this.onStateChange({
      status: 'idle',
      currentTime: 0,
      currentLineIndex: 0,
      countdown: 0,
      isRecording: false,
      ...partial,
    });
  }
}
```

---

## 6. VOICE-TO-TEXT (WHISPER PIPELINE)

### 6.1 Architecture

```
Voice Recording (WebM/Opus)
    │
    ▼
┌─────────────────────────────────────┐
│  Option A: Real-time (Streaming)    │
│  • Chunk audio every 5 seconds      │
│  • Send to Whisper API              │
│  • Display partial transcript       │
│  • Cost: ~$0.006/minute             │
│  • Latency: 2-3 seconds             │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Option B: Batch (Post-processing)  │
│  • Record full audio                │
│  • Upload to server                 │
│  • Transcribe in background         │
│  • Display when ready               │
│  • Cost: Same, but deferred         │
│  • Latency: 5-30 seconds            │
└─────────────────────────────────────┘
```

**Recommendation for Matisa:** Use **Option B (Batch)** for notes and messages. Use **Option A (Streaming)** only for voice room captions (accessibility feature, future).

### 6.2 Implementation

```typescript
// Edge function: transcribe-voice
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { filePath, language = 'en' } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Download from storage
  const { data: audioBlob } = await supabase
    .storage
    .from('voice')
    .download(filePath);

  // Transcribe with Whisper
  const formData = new FormData();
  formData.append('file', audioBlob!, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', language);
  formData.append('response_format', 'json');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: formData,
  });

  const result = await response.json();

  // Store transcript
  await supabase.from('voice_transcripts').insert({
    file_path: filePath,
    transcript: result.text,
    language: result.language,
    confidence: result.segments?.[0]?.avg_logprob || 0,
  });

  return new Response(JSON.stringify({ transcript: result.text }));
});
```

### 6.3 Cost Optimization

| Feature | Calls/Month | Cost/Call | Monthly Cost |
|---------|------------|-----------|--------------|
| Note voice transcription | 3,000 | $0.006/min | ~$90 |
| Message voice transcription | 10,000 | $0.006/min | ~$300 |
| Voice intro transcription | 500 | $0.006/min | ~$15 |
| **Total** | | | **~$405/mo** |

**Ways to reduce cost:**
1. Only transcribe notes > 10 seconds (skip short replies)
2. Cache transcripts (don't re-transcribe)
3. Use Whisper locally (self-host open-source Whisper on a $20/mo server)
4. Batch process during off-peak hours

---

## 7. FULL APP DATA ARCHITECTURE

### 7.1 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (React + Capacitor)                                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ TanStack     │  │ Zustand      │  │ React Query      │   │
│  │ Query        │  │ (State)      │  │ (Server State)   │   │
│  │ (Cache)      │  │              │  │                  │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                    │             │
│         └─────────────────┴────────────────────┘             │
│                           │                                  │
│                    ┌──────┴──────┐                          │
│                    │  Sync Layer │                          │
│                    │  (Optimistic│                          │
│                    │   Updates)  │                          │
│                    └──────┬──────┘                          │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  SUPABASE                                                   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ PostgreSQL   │  │ Realtime     │  │ Edge Functions   │   │
│  │ (Source of   │  │ (WebSocket   │  │ (Business Logic) │   │
│  │  Truth)      │  │  Events)     │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  EXTERNAL SERVICES                                          │
│  LiveKit (Voice) │ OpenAI (Whisper) │ FCM (Push)           │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 State Management

```typescript
// src/stores/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Auth
  user: User | null;
  session: Session | null;

  // UI
  theme: 'light' | 'dark' | 'system';
  dataSaver: boolean;

  // Voice
  currentRoom: string | null;
  isRecording: boolean;

  // Cache
  cachedNotes: Map<string, Note>;
  cachedProfiles: Map<string, Profile>;

  // Actions
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setDataSaver: (enabled: boolean) => void;
  cacheNote: (note: Note) => void;
  cacheProfile: (profile: Profile) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      theme: 'system',
      dataSaver: false,
      currentRoom: null,
      isRecording: false,
      cachedNotes: new Map(),
      cachedProfiles: new Map(),

      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setDataSaver: (enabled) => set({ dataSaver: enabled }),
      cacheNote: (note) => set((state) => ({
        cachedNotes: new Map(state.cachedNotes).set(note.id, note),
      })),
      cacheProfile: (profile) => set((state) => ({
        cachedProfiles: new Map(state.cachedProfiles).set(profile.id, profile),
      })),
    }),
    {
      name: 'matisa-storage',
      partialize: (state) => ({
        theme: state.theme,
        dataSaver: state.dataSaver,
      }),
    }
  )
);
```

### 7.3 React Query Patterns

```typescript
// src/hooks/useNotes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_personalized_feed', { limit: 20 });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Poll every minute
  });
}

export function useNote(noteId: string) {
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*, author:profiles(*)')
        .eq('id', noteId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!noteId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: CreateNoteInput) => {
      const { data, error } = await supabase
        .from('notes')
        .insert(note)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (newNote) => {
      // Optimistically update feed
      queryClient.setQueryData(['feed'], (old: Note[] = []) => [newNote, ...old]);
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
```

---

## 8. REAL-TIME SYNC

### 8.1 Supabase Realtime Channels

```typescript
// src/lib/realtime.ts
import { supabase } from './supabase';

export function subscribeToFeed(callback: (payload: any) => void) {
  const channel = supabase
    .channel('feed_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notes' },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function subscribeToRoom(roomId: string, callback: (payload: any) => void) {
  const channel = supabase
    .channel(`room_${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` },
      callback
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function subscribeToMessages(conversationId: string, callback: (payload: any) => void) {
  const channel = supabase
    .channel(`chat_${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      callback
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
```

### 8.2 Presence (Who's Online)

```typescript
// Track online status
const room = supabase.channel('online_users');

room
  .on('presence', { event: 'sync' }, () => {
    const state = room.presenceState();
    console.log('Online users:', state);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await room.track({ user_id: currentUser.id, online_at: new Date().toISOString() });
    }
  });
```

---

## 9. OFFLINE-FIRST STRATEGY

### 9.1 What to Cache

| Data | Strategy | Storage |
|------|----------|---------|
| User profile | Always cache | IndexedDB |
| Feed notes | Cache last 50 | IndexedDB |
| Messages | Cache last 100 per convo | IndexedDB |
| Voice recordings | Queue for upload | IndexedDB + Filesystem |
| Images | Cache thumbnails | Cache API |
| App settings | Always cache | localStorage |

### 9.2 Offline Queue

```typescript
// src/lib/offline/queue.ts
interface QueuedAction {
  id: string;
  type: 'create_note' | 'send_message' | 'like_note' | 'follow_user';
  payload: any;
  timestamp: string;
  retryCount: number;
}

class OfflineQueue {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('matisa_offline', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore('actions', { keyPath: 'id' });
        db.createObjectStore('drafts', { keyPath: 'id' });
      };
    });
  }

  async enqueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const fullAction: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    const tx = this.db!.transaction('actions', 'readwrite');
    tx.objectStore('actions').add(fullAction);

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    const tx = this.db!.transaction('actions', 'readonly');
    const actions = await tx.objectStore('actions').getAll();

    for (const action of actions) {
      try {
        await this.executeAction(action);
        // Remove from queue on success
        const deleteTx = this.db!.transaction('actions', 'readwrite');
        deleteTx.objectStore('actions').delete(action.id);
      } catch (error) {
        // Increment retry count
        action.retryCount++;
        if (action.retryCount > 3) {
          // Move to dead letter queue or notify user
          const deleteTx = this.db!.transaction('actions', 'readwrite');
          deleteTx.objectStore('actions').delete(action.id);
        } else {
          const updateTx = this.db!.transaction('actions', 'readwrite');
          updateTx.objectStore('actions').put(action);
        }
      }
    }
  }

  private async executeAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'create_note':
        await supabase.from('notes').insert(action.payload);
        break;
      case 'send_message':
        await supabase.from('messages').insert(action.payload);
        break;
      // ... etc
    }
  }
}
```

---

## 10. SECURITY & PRIVACY

### 10.1 Row Level Security (RLS)

```sql
-- Notes: Users can read public notes, only edit their own
CREATE POLICY "Notes are viewable by everyone" ON notes
  FOR SELECT USING (true);

CREATE POLICY "Users can create notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = author_id);

-- Messages: Only conversation members can read
CREATE POLICY "Messages viewable by members" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Voice rooms: Public rooms readable by all, private by invite
CREATE POLICY "Public rooms are viewable" ON voice_rooms
  FOR SELECT USING (is_private = false OR auth.uid() = host_id);
```

### 10.2 Content Moderation

```typescript
// Edge function: moderate-content
async function moderateContent(text: string): Promise<{ safe: boolean; flags: string[] }> {
  // OpenAI Moderation API
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: text }),
  });

  const result = await response.json();
  const flagged = result.results[0].flagged;
  const categories = result.results[0].categories;

  const flags = Object.entries(categories)
    .filter(([, v]) => v)
    .map(([k]) => k);

  return { safe: !flagged, flags };
}
```

---

## 11. MONITORING & OBSERVABILITY

### 11.1 What to Track

| Metric | Tool | Alert Threshold |
|--------|------|----------------|
| API error rate | Sentry | > 1% |
| Voice room drop rate | LiveKit metrics | > 5% |
| Page load time | Web Vitals | > 3s |
| Database query time | Supabase | > 500ms |
| Push notification delivery | FCM | < 95% |
| User retention (Day 1) | PostHog | < 30% |

### 11.2 Health Check Endpoint

```typescript
// Edge function: health-check
serve(async () => {
  const checks = await Promise.all([
    checkDatabase(),
    checkStorage(),
    checkLiveKit(),
    checkOpenAI(),
  ]);

  const allHealthy = checks.every(c => c.healthy);

  return new Response(
    JSON.stringify({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: Object.fromEntries(checks.map(c => [c.name, c.healthy])),
    }),
    { status: allHealthy ? 200 : 503 }
  );
});
```

---

## 12. SCALING ROADMAP

### Phase 1: Beta (0-1,000 users) — CURRENT
- Single Supabase project
- LiveKit Cloud free tier
- OpenAI API for transcription
- All on free tiers, ~$50/month

### Phase 2: Growth (1,000-10,000 users)
- Supabase Pro ($25/month)
- LiveKit Cloud paid ($50-200/month)
- Self-hosted Whisper on VPS ($20/month)
- CDN for media (Cloudflare R2, $5/month)
- **Total: ~$300/month**

### Phase 3: Scale (10,000-100,000 users)
- Supabase + read replicas
- Dedicated LiveKit cluster
- Redis for caching (Upstash)
- Elasticsearch for search
- Separate analytics DB
- **Total: ~$2,000/month**

### Phase 4: Massive (100,000+ users)
- Multi-region Supabase
- Kubernetes for edge functions
- Custom transcription model
- In-house push notification service
- **Total: ~$10,000+/month**

---

## SUMMARY: THE SENIOR DEV'S CHECKLIST

Before you ship voice features:

- [ ] Recording works on iOS Safari (test on real device)
- [ ] Recording works with screen locked (Android only)
- [ ] Audio quality is clear at 24kbps
- [ ] Waveform renders smoothly (60fps)
- [ ] Playback supports 1x/1.5x/2x speed
- [ ] Seeking/scrubbing works precisely
- [ ] Voice rooms handle 50+ people
- [ ] Reconnection works after network drop
- [ ] Karaoke lyrics sync within 100ms
- [ ] Whisper transcription < 10 seconds
- [ ] Offline queue processes when reconnected
- [ ] Push notifications arrive for room invites
- [ ] RLS prevents unauthorized access
- [ ] Content moderation catches harmful audio
- [ ] Error tracking captures all failures
- [ ] Performance metrics are monitored

**Voice is the hardest feature in your app.** Get it right, and Matisa becomes indispensable. Get it wrong, and users will tolerate nothing.
