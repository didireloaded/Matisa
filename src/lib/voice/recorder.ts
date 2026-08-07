// src/lib/voice/recorder.ts
// Production-grade voice recorder with resilience and waveform generation

export interface RecordingConfig {
  maxDurationMs: number; // Max recording duration (e.g. 5 min)
  chunkIntervalMs: number; // Chunk duration for resilience (e.g. 1s)
  silenceThreshold: number; // Silence threshold in dB (e.g. -50dB)
  silenceTimeoutMs: number; // Auto-stop timeout on silence
  mimeType: string; // Audio MIME type
}

export interface RecordingState {
  status: "idle" | "requesting" | "recording" | "paused" | "processing" | "error";
  durationMs: number;
  chunks: Blob[];
  waveformPeaks: number[]; // 100 normalized points (0-1)
  currentDb: number; // Current audio volume level in dB
  error?: Error;
}

export class VoiceRecorder {
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
    onStateChange: (state: RecordingState) => void,
  ) {
    this.config = {
      maxDurationMs: 5 * 60 * 1000, // 5 min default
      chunkIntervalMs: 1000,
      silenceThreshold: -50,
      silenceTimeoutMs: 5000,
      mimeType: this.getSupportedMimeType(),
      ...config,
    };
    this.onStateChange = onStateChange;
  }

  private getSupportedMimeType(): string {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
    for (const type of types) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "audio/webm";
  }

  async start(): Promise<void> {
    try {
      this.updateState({ status: "requesting" });

      // Request microphone with echo cancellation and noise suppression
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
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: 48000 });
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      // ScriptProcessor for waveform data extraction
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let maxVal = 0;
        for (let i = 0; i < inputData.length; i++) {
          const abs = Math.abs(inputData[i]);
          if (abs > maxVal) maxVal = abs;
        }
        this.waveformData.push(maxVal);

        if (this.waveformData.length > 100) {
          this.waveformData.shift();
        }

        // Voice activity detection
        const db = maxVal > 0 ? 20 * Math.log10(maxVal) : -100;
        this.updateState({ currentDb: db });

        if (db < this.config.silenceThreshold) {
          if (!this.silenceTimer) {
            this.silenceTimer = setTimeout(() => {
              this.stop();
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
        audioBitsPerSecond: 24000, // 24kbps for voice
      });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.processRecording();
      };

      this.mediaRecorder.onerror = (e) => {
        this.updateState({ status: "error", error: new Error(`Recorder error: ${e}`) });
        this.cleanup();
      };

      // Start recording with chunk intervals
      this.mediaRecorder.start(this.config.chunkIntervalMs);
      this.startTime = Date.now();
      this.updateState({ status: "recording", durationMs: 0 });

      // Duration tracking interval
      this.durationInterval = setInterval(() => {
        const duration = Date.now() - this.startTime;
        this.updateState({ durationMs: duration });

        if (duration >= this.config.maxDurationMs) {
          this.stop();
        }
      }, 100);
    } catch (error) {
      this.updateState({ status: "error", error: error as Error });
      this.cleanup();
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private processRecording(): void {
    this.updateState({ status: "processing" });

    if (this.chunks.length === 0) {
      this.updateState({ status: "error", error: new Error("No audio data recorded") });
      return;
    }

    const blob = new Blob(this.chunks, { type: this.config.mimeType });
    const duration = Date.now() - this.startTime;

    const maxPeak = Math.max(...this.waveformData, 0.001);
    const normalizedPeaks = this.waveformData.map((p) => Math.round((p / maxPeak) * 100) / 100);

    this.updateState({
      status: "idle",
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
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  private updateState(partial: Partial<RecordingState>): void {
    this.onStateChange({
      status: "idle",
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
