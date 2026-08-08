import { describe, it, expect, vi } from "vitest";
import { ModerationService } from "./moderation";

vi.mock("@/lib/supabase", () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        insert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: "rep-123" }, error: null }),
      })),
      rpc: vi.fn().mockResolvedValue({ data: "rep-123", error: null }),
    },
  };
});

describe("ModerationService", () => {
  it("submits report via submit_report RPC", async () => {
    const reportId = await ModerationService.submitReport({
      targetType: "note",
      targetId: "note-123",
      reason: "Inappropriate content",
    });
    expect(reportId).toBe("rep-123");
  });

  it("blocks user via block_user RPC", async () => {
    await expect(ModerationService.blockUser("usr-blocked")).resolves.not.toThrow();
  });

  it("mutes user via mute_user RPC", async () => {
    await expect(ModerationService.muteUser("usr-muted")).resolves.not.toThrow();
  });
});
