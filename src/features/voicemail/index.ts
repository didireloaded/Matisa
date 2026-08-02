import { supabase } from "@/lib/supabase";
import { VoicemailRepository } from "./repositories/VoicemailRepository";
import { VoicemailService } from "./services/VoicemailService";

export * from "./services/VoicemailService";
export * from "./types";

export const voicemailService = new VoicemailService(new VoicemailRepository(supabase));
