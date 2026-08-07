// src/lib/voice/player.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { VoicePlayer, VoicePlayerState } from "./player";

describe("VoicePlayer", () => {
  let onStateChange: (state: VoicePlayerState) => void;
  let stateHistory: VoicePlayerState[];

  beforeEach(() => {
    stateHistory = [];
    onStateChange = vi.fn((state) => {
      stateHistory.push(state);
    });
    vi.clearAllMocks();
  });

  it("initializes with default state", () => {
    const player = new VoicePlayer(onStateChange);
    expect(player).toBeDefined();
  });

  it("updates playback rate", () => {
    const player = new VoicePlayer(onStateChange);
    player.setPlaybackRate(1.5);
    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({ playbackRate: 1.5 }));
  });

  it("handles pause and stop gracefully when no audio is loaded", () => {
    const player = new VoicePlayer(onStateChange);
    player.pause();
    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({ isPlaying: false }));

    player.stop();
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ isPlaying: false, currentTime: 0 }),
    );
  });

  it("cleans up on destroy", () => {
    const player = new VoicePlayer(onStateChange);
    expect(() => player.destroy()).not.toThrow();
  });
});
