import { reactionInputSchema } from "../validation/reactionSchemas";
import {
  emptyReactionCounts,
  type ReactionInput,
  type ReactionSummary,
  type ReactionTargetType,
  type ReactionType,
} from "../types";

export interface ReactionStore {
  getSummary(
    targetType: ReactionTargetType,
    targetId: string,
    userId?: string | null,
  ): Promise<ReactionSummary>;
  add(input: ReactionInput): Promise<void>;
  remove(input: ReactionInput): Promise<void>;
}

export class ReactionService {
  constructor(private readonly store: ReactionStore) {}

  async getSummary(
    targetType: ReactionTargetType,
    targetId: string,
    userId?: string | null,
  ): Promise<ReactionSummary> {
    if (!targetId.trim()) {
      return { targetType, targetId, counts: emptyReactionCounts(), userReaction: null };
    }

    return this.store.getSummary(targetType, targetId, userId);
  }

  async toggleReaction(
    input: ReactionInput,
    currentReaction: ReactionType | null,
  ): Promise<ReactionType | null> {
    const parsed = reactionInputSchema.parse(input);

    if (currentReaction === parsed.reactionType) {
      await this.store.remove(parsed);
      return null;
    }

    await this.store.add(parsed);
    return parsed.reactionType;
  }
}
