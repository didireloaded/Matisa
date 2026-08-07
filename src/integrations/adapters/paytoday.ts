import { isIntegrationAvailable } from "../status";
import { supabaseAdapter } from "./supabase";

export interface PaymentInitiationResult {
  checkoutUrl?: string;
  transactionId?: string;
  available: boolean;
  error?: string;
}

export const paytodayAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("paytoday");
  },

  async createCheckoutSession(
    eventId: string,
    amount: number,
    currency = "NAD",
  ): Promise<PaymentInitiationResult> {
    if (!this.isAvailable()) {
      console.warn(
        "[PayToday] Payment service not configured. Unable to process paid event ticket.",
      );
      return {
        available: false,
        error:
          "Paid ticket purchasing is currently disabled in development. Free events remain available.",
      };
    }

    try {
      const supabase = supabaseAdapter.getClient();
      const { data, error } = await supabase.functions.invoke("create-payment-checkout", {
        body: { eventId, amount, currency },
      });

      if (error || !data?.checkoutUrl) {
        return {
          available: false,
          error: error?.message || "Failed to initialize payment gateway session",
        };
      }

      return {
        checkoutUrl: data.checkoutUrl,
        transactionId: data.transactionId,
        available: true,
      };
    } catch (err: any) {
      return {
        available: false,
        error: err?.message || "Payment service network error",
      };
    }
  },
};
