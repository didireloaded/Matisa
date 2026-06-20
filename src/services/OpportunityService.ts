import { supabase } from "@/lib/supabase";
import { Analytics } from "@/services/analytics";

export interface OpportunityProfile {
  display_name: string;
  avatar_url: string;
  username: string;
}

export interface Opportunity {
  id: string;
  creator_id: string;
  type: string;
  role_needed: string;
  description: string;
  location: string;
  budget?: string;
  created_at: string;
  profiles?: OpportunityProfile;
}

export const OpportunityService = {
  /**
   * Fetches all opportunities ordered by newest first.
   */
  async getOpportunities(): Promise<Opportunity[]> {
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*, profiles(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Failed to load opportunities:", err);
      return [];
    }
  },

  /**
   * Applies to an opportunity.
   */
  async applyToOpportunity(
    opportunityId: string,
    applicantId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("opportunity_applications")
        .insert({ opportunity_id: opportunityId, applicant_id: applicantId, status: "pending" });

      if (error) {
        if (error.code === "23505") {
          return { success: false, error: "already_applied" };
        }
        throw error;
      }

      Analytics.track("apply_opportunity", { opportunity_id: opportunityId });
      return { success: true };
    } catch (err) {
      console.error("Failed to apply to opportunity:", err);
      return { success: false, error: "unknown" };
    }
  },

  /**
   * Creates a new opportunity.
   */
  async createOpportunity(
    opportunityData: Omit<Opportunity, "id" | "created_at" | "profiles">,
  ): Promise<Opportunity | null> {
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .insert(opportunityData)
        .select("*, profiles(*)")
        .single();

      if (error) throw error;

      Analytics.track("post_opportunity", { type: opportunityData.type });
      return data;
    } catch (err) {
      console.error("Failed to create opportunity:", err);
      return null;
    }
  },
};
