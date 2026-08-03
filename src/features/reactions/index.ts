import { supabase } from "@/utils/supabase";
import { ReactionRepository } from "./repositories/ReactionRepository";
import { ReactionService } from "./services/ReactionService";

export * from "./repositories/ReactionRepository";
export * from "./services/ReactionService";
export * from "./types";

export const reactionService = new ReactionService(new ReactionRepository(supabase));
