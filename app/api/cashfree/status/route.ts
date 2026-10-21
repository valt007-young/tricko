import { NextResponse } from "next/server";
import {
  getServerUser,
  createClient,
  createServiceClient,
  serviceRoleConfigured,
  supabaseConfigured,
} from "@/lib/supabase/server";
import {
  cashfreeConfigured,
  getCashfreeOrder,
  finalizePaymentIntent,
} from "@/lib/cashfree";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });
  }

  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "You must be signed in to view an order." }, { status: 401 });
  }

  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Missing order id." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: intent } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  if (!intent) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (intent.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const meta = {
    species_name: (intent.payload as { species?: { name?: string } } | null)?.species?.name ?? null,
    region: (intent.payload as { region?: string } | null)?.region ?? null,
    planter_myself: Boolean((intent.payload as { planterMyself?: boolean } | null)?.planterMyself),
  };

  if (intent.status === "completed") {
    const treeId = (intent.payload as { tree_id?: string } | null)?.tree_id ?? null;
    return NextResponse.json({ status: "completed", treeId, meta });
  }

  if (intent.status === "failed") {
    return NextResponse.json({ status: "failed", meta });
  }

  // Still pending locally — ask Cashfree for the authoritative order state.
  if (cashfreeConfigured()) {
    try {
      const order = await getCashfreeOrder(orderId);
      if (order.order_status === "PAID") {
        if (!serviceRoleConfigured()) {
          return NextResponse.json({ status: "pending", meta, paymentSessionId: intent.payment_session_id ?? null });
        }
        const result = await finalizePaymentIntent(createServiceClient(), orderId);
        if (result) {
          return NextResponse.json({ status: "completed", treeId: result.treeId, meta });
        }
        return NextResponse.json({
          status: (await intentFromAdmin(orderId)) ?? "pending",
          treeId: null,
          meta,
        });
      }
      if (["EXPIRED", "CANCELLED"].includes(order.order_status)) {
        return NextResponse.json({ status: "failed", meta });
      }
    } catch {
      // Keep polling — transient network issue.
    }
  }

  return NextResponse.json({
    status: "pending",
    paymentSessionId: intent.payment_session_id ?? null,
    meta,
  });
}

async function intentFromAdmin(orderId: string): Promise<string | null> {
  try {
    const admin = createServiceClient();
    const { data } = await admin
      .from("payment_intents")
      .select("status")
      .eq("order_id", orderId)
      .maybeSingle();
    return data?.status ?? null;
  } catch {
    return null;
  }
}