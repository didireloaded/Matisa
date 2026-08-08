import { describe, it, expect, vi } from "vitest";
import { MessageService } from "./messages";

vi.mock("../lib/supabase", () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        match: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: "conv-1" }, error: null }),
      })),
      rpc: vi.fn().mockResolvedValue({ data: "conv-123", error: null }),
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      }),
      removeChannel: vi.fn(),
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
          createSignedUrl: vi
            .fn()
            .mockResolvedValue({ data: { signedUrl: "https://signed.url" }, error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://public.url" } }),
        }),
      },
    },
  };
});

describe("MessageService", () => {
  it("creates or fetches direct conversation via atomic RPC", async () => {
    const convId = await MessageService.getOrCreateConversation("user-1", "user-2");
    expect(convId).toBe("conv-123");
  });

  it("sends text message via sendTextMessage", async () => {
    await expect(
      MessageService.sendTextMessage("conv-123", "user-1", "Hello world"),
    ).resolves.not.toThrow();
  });
});
