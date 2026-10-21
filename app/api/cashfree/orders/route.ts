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
  createCashfreeOrder,
  finalizePaymentIntent,
  newOrderId,
} from "@/lib/cashfree";
import { pricingBreakdown, SITE_URL, REGIONS, DEMO_MODE } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });
  }
  if (!DEMO_MODE && !cashfreeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured. Add CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET." },
      { status: 503 }
    );
  }

  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "You must be signed in to plant a tree." }, { status: 401 });
  }

  let body: {
    speciesSlug?: string;
    region?: string;
    mode?: "sponsor" | "myself";
    customName?: string;
    dedication?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { speciesSlug, region, mode } = body;
  if (!speciesSlug || !region) {
    return NextResponse.json({ error: "Missing species or region." }, { status: 400 });
  }

  // Pricing is computed server-side from the catalog so clients can't
  // tamper with the charged amount.
  const supabase = await createClient();
  const { data: species } = await supabase
    .from("tree_species")
    .select("*")
    .eq("slug", speciesSlug)
    .maybeSingle();
  if (!species) {
    return NextResponse.json({ error: "Unknown species." }, { status: 400 });
  }
  // Any region is allowed — it just has to be a real one.
  if (!REGIONS.some((r) => r.id === region)) {
    return NextResponse.json({ error: "Unknown region." }, { status: 400 });
  }
  const pricing = pricingBreakdown(species);

  const orderId = newOrderId();
  const planterMyself = mode === "myself";
  const payload = {
    species: {
      id: species.id,
      slug: species.slug,
      name: species.name,
      emoji: species.emoji,
      image_url: species.image_url ?? null,
    },
    region,
    planterMyself,
    customName: body.customName,
    dedication: body.dedication,
    pricing: {
      plantingCost: pricing.plantingCost,
      verificationFee: pricing.verificationFee,
      planterPayout: pricing.planterPayout,
      total: pricing.total,
    },
  };

  const { error: insertError } = await supabase.from("payment_intents").insert({
    order_id: orderId,
    user_id: user.id,
    amount: pricing.total,
    currency: "INR",
    payload,
    status: "created",
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Demo mode: settle the intent immediately — no cash changes hands.
  if (DEMO_MODE) {
    const payClient = serviceRoleConfigured() ? createServiceClient() : supabase;
    try {
      const result = await finalizePaymentIntent(payClient, orderId, {
        paymentId: `DEMO-${Date.now().toString(36).toUpperCase()}`,
        provider: "demo",
      });
      if (!result) {
        return NextResponse.json(
          { error: "Could not complete the demo payment." },
          { status: 500 }
        );
      }
      return NextResponse.json({ orderId, demo: true });
    } catch (err) {
      await supabase.from("payment_intents").update({ status: "failed" }).eq("order_id", orderId);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Could not complete the demo payment." },
        { status: 502 }
      );
    }
  }

  try {
    const order = await createCashfreeOrder({
      orderId,
      amount: pricing.total,
      customerId: user.id,
      customerName: (user.user_metadata?.full_name as string) || undefined,
      customerEmail: user.email ?? undefined,
      returnUrl: `${SITE_URL}/plant?order=${orderId}`,
      notifyUrl: `${SITE_URL}/api/cashfree/webhook`,
    });
    await supabase
      .from("payment_intents")
      .update({
        cf_order_id: order.cf_order_id ?? null,
        payment_session_id: order.payment_session_id,
      })
      .eq("order_id", orderId);

    return NextResponse.json({
      orderId,
      paymentSessionId: order.payment_session_id,
    });
  } catch (err) {
    await supabase
      .from("payment_intents")
      .update({ status: "failed" })
      .eq("order_id", orderId);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start the checkout." },
      { status: 502 }
    );
  }
}