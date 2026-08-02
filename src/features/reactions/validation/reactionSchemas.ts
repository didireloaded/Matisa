import { z } from "zod";
import { reactionTargetTypes, reactionTypes } from "../types";

export const reactionInputSchema = z.object({
  userId: z.string().uuid("A signed-in user is required."),
  targetType: z.enum(reactionTargetTypes),
  targetId: z.string().trim().min(1, "A target is required.").max(128),
  reactionType: z.enum(reactionTypes),
});
