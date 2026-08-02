import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn(() => ({ auth: {}, from: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient }));

describe("Supabase browser client", () => {
  beforeEach(() => {
    vi.resetModules();
    createClient.mockClear();
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "public-test-key");
  });

  it("is shared by extracted frontend features", async () => {
    await import("@/lib/supabase");
    await import("@/features/reactions");
    await import("@/features/voicemail");
    expect(createClient).toHaveBeenCalledTimes(1);
  });
});
