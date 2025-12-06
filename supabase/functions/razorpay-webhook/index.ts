// supabase/functions/razorpay-webhook/index.ts

// @ts-nocheck
// This file runs in Deno when deployed. TypeScript/IDE diagnostics in the
// editor may not resolve remote Deno imports; we disable type checking here
// to avoid spurious 'Cannot find module' and 'Cannot find name Deno' errors.
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
      try {
        // Razorpay supports sending back custom notes. We include the local
        // payment record id in notes when opening checkout so the webhook can
        // directly map the Razorpay payment to our payments row.
        const notes = payment?.notes || {};
        let paymentRow = null;

        if (notes?.payment_id) {
          // If frontend passed our payment id into Razorpay notes, update by id
          const { error: updErr } = await supabase
            .from("payments")
            .update({
              status: payment.captured ? "completed" : "pending",
              payment_method: payment.method,
              payment_gateway: "razorpay",
              transaction_id: payment.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", notes.payment_id);

          if (updErr) {
            console.error("❌ Error updating payment by id:", updErr);
          } else {
            console.log("✅ Payment updated by id:", notes.payment_id);
          }

          // Fetch the payment row we just updated
          const { data: fetched, error: fetchErr } = await supabase
            .from("payments")
            .select("*")
            .eq("id", notes.payment_id)
            .maybeSingle();

          if (fetchErr) console.error('❌ Error fetching payment by id:', fetchErr);
          paymentRow = fetched || null;
        } else {
          // Fallback: try to update by transaction_id (in case we already set it earlier)
          const { error: updErr } = await supabase
            .from("payments")
            .update({
              status: payment.captured ? "completed" : "pending",
              payment_method: payment.method,
              payment_gateway: "razorpay",
              transaction_id: payment.id,
              updated_at: new Date().toISOString(),
            })
            .eq("transaction_id", payment.id);

          if (updErr) {
            console.error("❌ Error updating payment by transaction_id:", updErr);
          } else {
            console.log("✅ Payment updated by transaction_id:", payment.id);
          }

          const { data: fetched, error: fetchErr } = await supabase
            .from("payments")
            .select("*")
            .eq("transaction_id", payment.id)
            .maybeSingle();

          if (fetchErr) console.error('❌ Error fetching payment by transaction_id:', fetchErr);
          paymentRow = fetched || null;
        }

        // If we located a payment row and it references a booking, attempt to finalize
        // the booking (mark confirmed). Handle any DB errors gracefully.
        if (paymentRow && paymentRow.booking_id) {
          try {
            const { error: bookingErr } = await supabase
              .from('bookings')
              .update({ status: 'confirmed', updated_at: new Date().toISOString() })
              .eq('id', paymentRow.booking_id);

            if (bookingErr) {
              // If database constraint prevents confirmation (e.g., overlap constraint), log it.
              console.error('❌ Error confirming booking for booking_id', paymentRow.booking_id, bookingErr);
              // Optionally you could mark payment as 'issue' or notify admins here.
            } else {
              console.log('✅ Booking confirmed for booking_id', paymentRow.booking_id);
            }
          } catch (err) {
            console.error('❌ Unexpected error while confirming booking:', err);
          }
        } else {
          console.log('ℹ️ No local payment row found or no booking_id present to confirm.');
        }
      } catch (err) {
        console.error('❌ Error handling payment.captured webhook:', err);
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
    // Razorpay sends base64-encoded HMAC-SHA256 signature. Convert the
    // raw signature bytes to base64 for comparison.
    const expectedSignature = bufferToBase64(signatureBuffer);

    return expectedSignature === signature;
  } catch (err) {
    console.error("Error verifying Razorpay signature:", err);
    return false;
  }
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  // Convert bytes to binary string then to base64
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa is available in Deno runtime
  return btoa(binary);
}
