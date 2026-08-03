import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotes } from "./useNotes";
import { NoteService } from "@/services/NoteService";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    profile: { id: "test-user-id", username: "testuser" },
    session: { user: { id: "test-user-id" } },
  }),
}));

vi.mock("@/services/NoteService", () => ({
  NoteService: {
    getFeedNotes: vi
      .fn()
      .mockResolvedValue([
        {
          id: "note-1",
          user_id: "user-1",
          content: "Feed Note 1",
          created_at: "2026-08-03T10:00:00Z",
        },
      ]),
    getFollowingNotes: vi
      .fn()
      .mockResolvedValue([
        {
          id: "note-2",
          user_id: "user-2",
          content: "Following Note 2",
          created_at: "2026-08-03T11:00:00Z",
        },
      ]),
    createTemporaryNote: vi.fn().mockResolvedValue({
      id: "note-3",
      user_id: "test-user-id",
      content: "Temp Note",
      created_at: "2026-08-03T12:00:00Z",
      note_kind: "temporary",
    }),
    likeNote: vi.fn().mockResolvedValue(true),
    unlikeNote: vi.fn().mockResolvedValue(true),
    saveNote: vi.fn().mockResolvedValue(true),
    unsaveNote: vi.fn().mockResolvedValue(true),
    subscribeToNotes: vi.fn().mockReturnValue({}),
    unsubscribe: vi.fn(),
  },
}));

describe("useNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with discover tab and fetches feed notes", async () => {
    const { result } = renderHook(() => useNotes());

    expect(result.current.feedTab).toBe("discover");
    await act(async () => {
      await result.current.refreshNotes();
    });

    expect(NoteService.getFeedNotes).toHaveBeenCalled();
    expect(result.current.notes).toHaveLength(1);
    expect(result.current.notes[0].id).toBe("note-1");
  });

  it("fetches following notes when tab is switched to following", async () => {
    const { result } = renderHook(() => useNotes("following"));

    expect(result.current.feedTab).toBe("following");
    await act(async () => {
      await result.current.refreshNotes();
    });

    expect(NoteService.getFollowingNotes).toHaveBeenCalledWith("test-user-id");
    expect(result.current.notes[0].id).toBe("note-2");
  });

  it("creates a temporary note and prepends it to notes", async () => {
    const { result } = renderHook(() => useNotes());

    await act(async () => {
      const created = await result.current.createTemporaryNote("Temp Note");
      expect(created?.id).toBe("note-3");
    });

    expect(result.current.notes[0].id).toBe("note-3");
  });
});
