import { NextResponse } from "next/server";
import {
  createServiceClient,
  supabaseConfigured,
  serviceRoleConfigured,
} from "@/lib/supabase/server";
import {
  cashfreeConfigured,
  verifyWebhookSignature,
  finalizePaymentIntent,
} from "@/lib/cashfree";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.text();

  if (!supabaseConfigured() || !cashfreeConfigured() || !serviceRoleConfigured()) {
    return NextResponse.json({ error: "Webhook processing is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");
  if (!verifyWebhookSignature(timestamp, raw, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: {
    type?: string;
    order_id?: string;
    data?: {
      order?: { order_id?: string; order_status?: string; cf_order_id?: string };
      payment?: { payment_status?: string; payment_id?: string; cf_payment_id?: string };
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const data = event?.data;
  const orderId: string | undefined = data?.order?.order_id ?? event?.order_id ?? undefined;
  if (!orderId) {
    // Not an order event we track — acknowledge so Cashfree stops retrying.
    return NextResponse.json({ ok: true });
  }

  const orderStatus = data?.order?.order_status;
  const paymentStatus = data?.payment?.payment_status;
  const eventType = typeof event?.type === "string" ? event.type : "";
  const isPaid =
    orderStatus === "PAID" || paymentStatus === "SUCCESS" || /PAYMENT_SUCCESS/i.test(eventType);

  if (isPaid) {
    try {
      await finalizePaymentIntent(createServiceClient(), orderId, {
        cfOrderId: data?.order?.cf_order_id,
        paymentId: data?.payment?.cf_payment_id ?? data?.payment?.payment_id,
      });
    } catch {
      // The intent is marked failed server-side; still ACK the webhook.
    }
  }

  return NextResponse.json({ ok: true });
}