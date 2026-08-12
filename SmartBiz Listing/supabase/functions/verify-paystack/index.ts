import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { reference, businessId } = await request.json();
    if (!reference || !businessId) throw new Error("Reference and business ID are required.");

    const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secretKey) throw new Error("Paystack secret key is not configured.");

    const verification = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` }
    });
    const result = await verification.json();
    const transaction = result?.data;
    const matches = result?.status && transaction?.status === "success" &&
      transaction.amount === 1500000 && transaction.currency === "NGN" &&
      transaction.metadata?.business_id === businessId;

    if (!matches) return Response.json({ verified: false, message: "Paystack did not confirm the expected payment." }, { status: 400, headers: corsHeaders });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await admin.from("businesses").update({ payment_status: "paid" }).eq("id", businessId).eq("payment_status", "pending");
    if (error) throw error;

    return Response.json({ verified: true }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ verified: false, message: error instanceof Error ? error.message : "Verification failed." }, { status: 400, headers: corsHeaders });
  }
});
