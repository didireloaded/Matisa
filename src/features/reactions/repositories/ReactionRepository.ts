import type { SupabaseClient } from "@supabase/supabase-js";
import {
  emptyReactionCounts,
  reactionTypes,
  type ReactionInput,
  type ReactionSummary,
  type ReactionTargetType,
  type ReactionType,
} from "../types";

type ReactionRow = {
  reaction_type: ReactionType;
};

export class ReactionRepository {
  constructor(private readonly supabase: Pick<SupabaseClient, "from">) {}

  async getSummary(
    targetType: ReactionTargetType,
    targetId: string,
    userId?: string | null,
  ): Promise<ReactionSummary> {
    const { data, error } = await this.supabase
      .from("reactions")
      .select("reaction_type")
      .eq("target_type", targetType)
      .eq("target_id", targetId);

    if (error) throw error;

    const counts = emptyReactionCounts();
    for (const row of (data ?? []) as ReactionRow[]) {
      if (reactionTypes.includes(row.reaction_type)) counts[row.reaction_type] += 1;
    }

    let userReaction: ReactionType | null = null;
    if (userId) {
      const { data: userRows, error: userError } = await this.supabase
        .from("reactions")
        .select("reaction_type")
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .eq("user_id", userId);

      if (userError) throw userError;
      userReaction = ((userRows?.[0] as ReactionRow | undefined)?.reaction_type ??
        null) as ReactionType | null;
    }

    return { targetType, targetId, counts, userReaction };
  }

  async add(input: ReactionInput): Promise<void> {
    const { error } = await this.supabase.from("reactions").upsert(
      {
        user_id: input.userId,
        target_type: input.targetType,
        target_id: input.targetId,
        reaction_type: input.reactionType,
      },
      {
        onConflict: "user_id,target_type,target_id",
      },
    );

    if (error) throw error;
  }

  async remove(input: ReactionInput): Promise<void> {
    const { error } = await this.supabase
      .from("reactions")
      .delete()
      .eq("user_id", input.userId)
      .eq("target_type", input.targetType)
      .eq("target_id", input.targetId);

    if (error) throw error;
  }
}
