// src/features/recorded-voice/recorded-voice.test.ts
import { describe, it, expect } from "vitest";
import { VOICE_LIMITS } from "./config";
import { detectSupportedMimeType, getExtensionFromMime } from "./mime";
import { normalizeWaveform } from "./waveform";
import { isPrivateVoiceMode, getStorageBucketForMode, generateStoragePath } from "./storage";

describe("Recorded Voice Subsystem Tests", () => {
  describe("VOICE_LIMITS", () => {
    it("enforces exact mode limits as per specification", () => {
      expect(VOICE_LIMITS.intro).toBe(30);
      expect(VOICE_LIMITS.story).toBe(60);
      expect(VOICE_LIMITS.reply).toBe(120);
      expect(VOICE_LIMITS.voicemail).toBe(180);
      expect(VOICE_LIMITS.message).toBe(300);
      expect(VOICE_LIMITS.note).toBe(300);
    });
  });

  describe("MIME & Extension Utilities", () => {
    it("returns a default MIME option when MediaRecorder is unavailable", () => {
      const mime = detectSupportedMimeType();
      expect(mime).toBeDefined();
      expect(mime.mimeType).toBeTruthy();
      expect(mime.extension).toBeTruthy();
    });

    it("correctly maps MIME types to extensions", () => {
      expect(getExtensionFromMime("audio/webm;codecs=opus")).toBe("webm");
      expect(getExtensionFromMime("audio/mp4")).toBe("m4a");
      expect(getExtensionFromMime("audio/aac")).toBe("m4a");
      expect(getExtensionFromMime("audio/ogg;codecs=opus")).toBe("ogg");
    });
  });

  describe("Waveform Normalization", () => {
    it("returns target length normalized amplitude values between 10 and 100", () => {
      const rawAmplitudes = [5, 10, 25, 50, 100, 75, 40, 15];
      const normalized = normalizeWaveform(rawAmplitudes, 64);
      expect(normalized).toHaveLength(64);
      normalized.forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(10);
        expect(val).toBeLessThanOrEqual(100);
      });
    });

    it("handles empty amplitudes with deterministic fallback waveform", () => {
      const normalized = normalizeWaveform([], 64);
      expect(normalized).toHaveLength(64);
      expect(normalized[0]).toBeGreaterThan(0);
    });
  });

  describe("Storage Configuration & Paths", () => {
    it("identifies private vs public voice modes correctly", () => {
      expect(isPrivateVoiceMode("note")).toBe(false);
      expect(isPrivateVoiceMode("intro")).toBe(false);
      expect(isPrivateVoiceMode("story")).toBe(false);
      expect(isPrivateVoiceMode("message")).toBe(true);
      expect(isPrivateVoiceMode("voicemail")).toBe(true);
      expect(isPrivateVoiceMode("reply")).toBe(true);
    });

    it("assigns appropriate storage buckets per mode", () => {
      expect(getStorageBucketForMode("note")).toBe("voice_notes");
      expect(getStorageBucketForMode("intro")).toBe("voice_intros");
      expect(getStorageBucketForMode("story")).toBe("stories");
      expect(getStorageBucketForMode("message")).toBe("voice_messages");
      expect(getStorageBucketForMode("voicemail")).toBe("voice_mail");
      expect(getStorageBucketForMode("reply")).toBe("voice_replies");
    });

    it("generates correct folder structure for voice paths", () => {
      const notePath = generateStoragePath("note", "user-123", "webm");
      expect(notePath).toContain("voice_notes/user-123/");

      const msgPath = generateStoragePath("message", "user-123", "webm", {
        conversationId: "conv-999",
      });
      expect(msgPath).toContain("conv-999/user-123/");

      const replyPath = generateStoragePath("reply", "user-123", "m4a", {
        recipientId: "rec-555",
      });
      expect(replyPath).toContain("rec-555/user-123/");
    });
  });
});
