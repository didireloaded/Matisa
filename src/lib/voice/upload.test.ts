// src/lib/voice/upload.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadVoiceRecording } from "./upload";

vi.mock("../supabase", () => {
  return {
    supabase: {
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({
            data: { path: "user123/note/123456789.webm" },
            error: null,
          }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: {
              publicUrl:
                "https://example.supabase.co/storage/v1/object/public/voice/user123/note/123456789.webm",
            },
          }),
        }),
      },
      functions: {
        invoke: vi.fn().mockResolvedValue({
          data: { transcript: "Sample transcribed text" },
          error: null,
        }),
      },
    },
  };
});

describe("uploadVoiceRecording", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads a voice recording blob and returns metadata with public URL", async () => {
    const mockBlob = new Blob(["audio data"], { type: "audio/webm" });
    const result = await uploadVoiceRecording(
      mockBlob,
      { userId: "user123", type: "note" },
      [0.2, 0.5, 0.8, 0.3],
      5000,
    );

    expect(result.url).toBe(
      "https://example.supabase.co/storage/v1/object/public/voice/user123/note/123456789.webm",
    );
    expect(result.duration).toBe(5);
    expect(result.waveformPeaks).toEqual([0.2, 0.5, 0.8, 0.3]);
    expect(result.transcript).toBe("Sample transcribed text");
  });
});
