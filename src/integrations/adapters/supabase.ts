import { supabase } from "@/lib/supabase";
import { isIntegrationAvailable } from "../status";

export const supabaseAdapter = {
  getClient() {
    return supabase;
  },

  isAvailable() {
    return isIntegrationAvailable("supabase");
  },
};
