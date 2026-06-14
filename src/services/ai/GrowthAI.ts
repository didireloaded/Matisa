import { supabase } from "../../lib/supabase";

export const GrowthAI = {
  /**
   * Fetches the optimal time to send notifications to this user.
   */
  async getOptimalNotificationTime(userId: string) {
    const { data, error } = await supabase
      .from("notification_behavior")
      .select("best_time_of_day")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data.best_time_of_day;
  },

  /**
   * Checks retention risk (churn prediction)
   */
  async getRetentionRisk(userId: string) {
    const { data, error } = await supabase
      .from("retention_predictions")
      .select("churn_risk, factors")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data;
  },
};
