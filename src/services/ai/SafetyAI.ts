import { supabase } from "../../lib/supabase";

export const SafetyAI = {
  /**
   * Evaluates an account for fake/bot behavior.
   */
  async checkAccountRisk(targetUserId: string) {
    const { data, error } = await supabase.functions.invoke("detectFakeAccounts", {
      body: { targetUserId },
    });

    if (error) {
      console.error("Error checking account risk:", error);
      return null;
    }

    return data;
  },
};
