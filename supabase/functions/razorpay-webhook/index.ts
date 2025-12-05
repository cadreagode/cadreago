// supabase/functions/razorpay-webhook/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

// 🔐 Environment variables (set via `supabase secrets set`)
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("PROJECT_SERVICE_ROLE_KEY") ?? "";

// Create Supabase client (server-side, safe)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Razorpay sends raw body + signature header
  const bodyText = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  // 1️⃣ Verify webhook signature
  const isValid = await verifyRazorpaySignature(
    bodyText,
    signature,
    RAZORPAY_WEBHOOK_SECRET,
  );

  if (!isValid) {
    console.error("❌ Invalid Razorpay signature");
    return new Response("Invalid signature", { status: 400 });
  }

  // 2️⃣ Parse event JSON
  let event: any;
  try {
    event = JSON.parse(bodyText);
  } catch (err) {
    console.error("❌ Invalid JSON body", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = event?.event;
  const payload = event?.payload;

  console.log("✅ Razorpay event received:", eventType);

  // 3️⃣ Handle payment.captured
  if (eventType === "payment.captured") {
    const payment = payload?.payment?.entity;

    if (!payment) {
      console.error("❌ No payment entity in payload");
    } else {
      // Update existing payment record using transaction_id
      const { error } = await supabase
        .from("payments")
        .update({
          status: payment.captured ? "completed" : "pending",
          payment_method: payment.method,
          payment_gateway: "razorpay",
          transaction_id: payment.id,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", payment.id);

      if (error) {
        console.error("❌ Error updating payment:", error);
      } else {
        console.log("✅ Payment updated:", payment.id);
      }
    }
  }

  // 4️⃣ Handle payment.failed
  if (eventType === "payment.failed") {
    const payment = payload?.payment?.entity;

    if (!payment) {
      console.error("❌ No payment entity in payload");
    } else {
      const { error } = await supabase
        .from("payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", payment.id);

      if (error) {
        console.error("❌ Error updating failed payment:", error);
      } else {
        console.log("✅ Failed payment updated:", payment.id);
      }
    }
  }

  // Always respond quickly so Razorpay is happy
  return new Response("ok", { status: 200 });
});

// ---------------- Signature verification helper ----------------

async function verifyRazorpaySignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set");
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const bodyData = encoder.encode(body);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, bodyData);
    const expectedSignature = bufferToHex(signatureBuffer);

    return expectedSignature === signature;
  } catch (err) {
    console.error("Error verifying Razorpay signature:", err);
    return false;
  }
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
