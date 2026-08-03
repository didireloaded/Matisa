// Supabase Edge Function: auth-phone-otp
// Description: Phone number verification using SMS OTP (Africa's Talking / Twilio integration contract)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, country_code = "+264" } = await req.json();

    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fullPhone = phone.startsWith("+") ? phone : `${country_code}${phone.replace(/^0/, "")}`;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { error } = await supabaseClient.auth.signInWithOtp({
      phone: fullPhone,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: `OTP challenge issued to ${fullPhone}`,
        expires_in: 300,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to issue SMS OTP" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
