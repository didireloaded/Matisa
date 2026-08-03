import { describe, it, expect, vi, beforeEach } from "vitest";
import { NoteService } from "./NoteService";

// Mock Supabase client
vi.mock("../lib/supabase", () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      }),
      removeChannel: vi.fn(),
    },
  };
});

describe("NoteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTemporaryNote", () => {
    it("truncates content over 200 characters for temporary notes", async () => {
      const longText = "a".repeat(250);
      const spy = vi.spyOn(NoteService, "createNoteWithLifetime").mockResolvedValue({
        id: "note-123",
        user_id: "user-1",
        content: "a".repeat(200),
        created_at: new Date().toISOString(),
        note_kind: "temporary",
      });

      const res = await NoteService.createTemporaryNote("user-1", longText);
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][1]).toHaveLength(200);
      expect(spy.mock.calls[0][2]).toBe("temporary");
    });
  });

  describe("createPermanentNote", () => {
    it("allows up to 5000 characters for permanent notes", async () => {
      const text = "Permanent thought content";
      const spy = vi.spyOn(NoteService, "createNoteWithLifetime").mockResolvedValue({
        id: "note-456",
        user_id: "user-1",
        content: text,
        created_at: new Date().toISOString(),
        note_kind: "permanent",
      });

      const res = await NoteService.createPermanentNote("user-1", text);
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][2]).toBe("permanent");
    });
  });
});
