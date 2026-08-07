// src/features/recorded-voice/recorder.ts
import { VOICE_LIMITS, VoiceMode } from "./config";
import { detectSupportedMimeType, getExtensionFromMime } from "./mime";
import { RecordedVoice, RecorderState } from "./types";
import { normalizeWaveform } from "./waveform";

export class RecordedVoiceEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private rawAmplitudes: number[] = [];
  private startTime: number = 0;
  private timer: number | null = null;
  private mode: VoiceMode;
  private onStateChange: (state: RecorderState) => void;

  private state: RecorderState;

  constructor(mode: VoiceMode, onStateChange: (state: RecorderState) => void) {
    this.mode = mode;
    this.onStateChange = onStateChange;
    this.state = {
      status: "idle",
      mode,
      elapsedSeconds: 0,
      maxSeconds: VOICE_LIMITS[mode],
      liveAmplitudes: [],
      recording: null,
    };
  }

  public getState(): RecorderState {
    return this.state;
  }

  private updateState(partial: Partial<RecorderState>): void {
    this.state = { ...this.state, ...partial };
    this.onStateChange(this.state);
  }

  public async start(): Promise<void> {
    this.cleanupMedia();
    this.updateState({ status: "requesting", permissionDenied: false, errorMessage: undefined });

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      this.updateState({
        status: "error",
        errorMessage: "Microphone recording is not supported in this browser or unsecure context.",
      });
      return;
    }

    try {
      // 1. Request microphone with speech audio constraints
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1, // Mono
        },
      });

      // 2. Set up AudioContext and AnalyserNode for live visual waveform
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.7;
      source.connect(this.analyser);

      // 3. Detect supported MIME type
      const mimeOpt = detectSupportedMimeType();

      // 4. Initialize MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeOpt.mimeType,
        audioBitsPerSecond: 32000, // 32kbps speech rate
      });

      this.chunks = [];
      this.rawAmplitudes = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.finishRecording(mimeOpt.mimeType, mimeOpt.extension);
      };

      this.mediaRecorder.onerror = (err) => {
        console.error("MediaRecorder error:", err);
        this.updateState({ status: "error", errorMessage: "Recording error occurred." });
        this.cleanupMedia();
      };

      // Start recording with 100ms chunk intervals
      this.mediaRecorder.start(100);
      this.startTime = Date.now();
      const maxDuration = VOICE_LIMITS[this.mode];

      this.updateState({
        status: "recording",
        elapsedSeconds: 0,
        maxSeconds: maxDuration,
        liveAmplitudes: [],
      });

      // 5. Live waveform and timer interval
      this.timer = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);

        // Extract live audio amplitude
        if (this.analyser) {
          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          this.analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          const amp = Math.min(100, Math.max(12, Math.round((avg / 128) * 100)));
          this.rawAmplitudes.push(amp);

          this.updateState({
            elapsedSeconds: elapsed,
            liveAmplitudes: this.rawAmplitudes.slice(-60),
          });
        } else {
          this.updateState({ elapsedSeconds: elapsed });
        }

        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          this.stop();
        }
      }, 100);
    } catch (err: any) {
      console.error("Microphone permission error:", err);
      const isDenied = err.name === "NotAllowedError" || err.name === "PermissionDeniedError";
      this.updateState({
        status: "error",
        permissionDenied: isDenied,
        errorMessage: isDenied
          ? "Microphone permission denied. Please allow microphone access in browser settings."
          : "Could not access microphone.",
      });
      this.cleanupMedia();
    }
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    } else if (this.state.status === "recording") {
      // Fallback if mediaRecorder stopped early
      this.finishRecording("audio/webm", "webm");
    }
  }

  private finishRecording(mimeType: string, extension: string): void {
    const elapsedMs = Date.now() - this.startTime;
    const durationSeconds = Math.max(1, Math.round(elapsedMs / 1000));
    const blob = new Blob(this.chunks, { type: mimeType });
    const fileSizeBytes = blob.size;
    const waveform = normalizeWaveform(this.rawAmplitudes, 64);

    const recordingResult: RecordedVoice = {
      blob,
      mimeType,
      extension: getExtensionFromMime(mimeType) || extension,
      durationSeconds,
      waveform,
      fileSizeBytes,
    };

    this.cleanupMedia();
    this.updateState({
      status: "preview",
      elapsedSeconds: durationSeconds,
      recording: recordingResult,
    });
  }

  public cancel(): void {
    this.cleanupMedia();
    this.updateState({
      status: "idle",
      elapsedSeconds: 0,
      liveAmplitudes: [],
      recording: null,
    });
  }

  public cleanupMedia(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}
