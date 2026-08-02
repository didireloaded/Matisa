export const reactionTargetTypes = [
  "note",
  "story",
  "message",
  "voice",
  "room",
  "karaoke_performance",
  "event",
] as const;

export const reactionTypes = ["heart", "fire", "laugh", "applause"] as const;

export type ReactionTargetType = (typeof reactionTargetTypes)[number];
export type ReactionType = (typeof reactionTypes)[number];

export type ReactionInput = {
  userId: string;
  targetType: ReactionTargetType;
  targetId: string;
  reactionType: ReactionType;
};

export type ReactionCounts = Record<ReactionType, number>;

export type ReactionSummary = {
  targetType: ReactionTargetType;
  targetId: string;
  counts: ReactionCounts;
  userReaction: ReactionType | null;
};

export const emptyReactionCounts = (): ReactionCounts => ({
  heart: 0,
  fire: 0,
  laugh: 0,
  applause: 0,
});
