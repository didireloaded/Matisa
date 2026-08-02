import { describe, expect, it, vi } from "vitest";
import { ReactionService, type ReactionStore } from "./ReactionService";
import { emptyReactionCounts, type ReactionInput, type ReactionSummary } from "../types";

const input: ReactionInput = {
  userId: "11111111-1111-4111-8111-111111111111",
  targetType: "note",
  targetId: "note-1",
  reactionType: "heart",
};

function makeStore(): ReactionStore {
  return {
    getSummary: vi.fn(
      async () =>
        ({
          targetType: "note",
          targetId: "note-1",
          counts: { ...emptyReactionCounts(), heart: 2 },
          userReaction: "heart",
        }) satisfies ReactionSummary,
    ),
    add: vi.fn(async () => undefined),
    remove: vi.fn(async () => undefined),
  };
}

describe("ReactionService", () => {
  it("returns an empty summary for an empty target id", async () => {
    const store = makeStore();
    const service = new ReactionService(store);

    const summary = await service.getSummary("note", " ");

    expect(summary.counts).toEqual(emptyReactionCounts());
    expect(summary.userReaction).toBeNull();
    expect(store.getSummary).not.toHaveBeenCalled();
  });

  it("adds a reaction when the user has not selected that reaction", async () => {
    const store = makeStore();
    const service = new ReactionService(store);

    const next = await service.toggleReaction(input, null);

    expect(next).toBe("heart");
    expect(store.add).toHaveBeenCalledWith(input);
    expect(store.remove).not.toHaveBeenCalled();
  });

  it("removes a reaction when the same reaction is selected again", async () => {
    const store = makeStore();
    const service = new ReactionService(store);

    const next = await service.toggleReaction(input, "heart");

    expect(next).toBeNull();
    expect(store.remove).toHaveBeenCalledWith(input);
    expect(store.add).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated reaction writes before reaching the repository", async () => {
    const store = makeStore();
    const service = new ReactionService(store);

    await expect(service.toggleReaction({ ...input, userId: "" }, null)).rejects.toThrow(
      "A signed-in user is required.",
    );
    expect(store.add).not.toHaveBeenCalled();
    expect(store.remove).not.toHaveBeenCalled();
  });
});
