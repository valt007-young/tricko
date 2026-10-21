import crypto from "node:crypto";
import { pricingBreakdown } from "./constants";
import { speciesBySlug } from "./species";
import { countUserTrees, unlockAchievements, logActivity } from "./client-service";
import type { SupabaseClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/*  Cashfree Payments Gateway — server-side helpers                    */
/*  Webhook signature: base64( HMAC_SHA256( timestamp + rawBody,       */
/*  client_secret ) ) compared to the x-webhook-signature header.      */
/* ------------------------------------------------------------------ */

export function cashfreeConfigured(): boolean {
  return Boolean(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET);
}

export function cashfreeMode(): "sandbox" | "production" {
  return process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";
}

function apiBase(): string {
  return process.env.CASHFREE_API_BASE ?? `https://${cashfreeMode()}.cashfree.com`;
}

export function newOrderId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TKO-${stamp}-${rand}`;
}

function apiHeaders() {
  return {
    "Content-Type": "application/json",
    "x-api-version": "2023-08-01",
    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
    "x-client-environment": cashfreeMode(),
  };
}

export interface CreateOrderInput {
  orderId: string;
  amount: number;
  currency?: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  returnUrl: string;
  notifyUrl: string;
}

export async function createCashfreeOrder(input: CreateOrderInput) {
  const res = await fetch(`${apiBase()}/pg/orders`, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amount,
      order_currency: input.currency ?? "INR",
      order_note: "Plant a tree on TRIKO",
      customer_details: {
        customer_id: input.customerId,
        customer_name: input.customerName ?? "TRIKO Friend",
        customer_email: input.customerEmail ?? "friend@triko.app",
      },
      order_meta: {
        return_url: input.returnUrl,
        notify_url: input.notifyUrl,
      },
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw new Error(data?.message ?? `Cashfree order failed (${res.status})`);
  }
  if (!data.payment_session_id) {
    throw new Error("Cashfree did not return a payment session id.");
  }
  return data as {
    cf_order_id?: string;
    order_id: string;
    order_status: string;
    payment_session_id: string;
  };
}

export async function getCashfreeOrder(orderId: string) {
  const res = await fetch(`${apiBase()}/pg/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: apiHeaders(),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw new Error(data?.message ?? `Cashfree order lookup failed (${res.status})`);
  }
  return data as {
    order_id: string;
    order_amount: number;
    order_currency: string;
    order_status: string;
    cf_order_id: string;
  };
}

/** Constant-time webhook signature check. */
export function verifyWebhookSignature(
  timestamp: string | null,
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature || !timestamp || !process.env.CASHFREE_CLIENT_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", process.env.CASHFREE_CLIENT_SECRET)
    .update(timestamp + rawBody)
    .digest("base64");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ------------------------------------------------------------------ */
/*  Finalizer — idempotently turns a paid intent into a tree.          */
/*  Uses the service-role client (bypasses RLS).                       */
/* ------------------------------------------------------------------ */

export interface PaymentIntentPayload {
  species: {
    id: number;
    slug: string;
    name: string;
    emoji: string;
    image_url: string | null;
  };
  region: string;
  planterMyself: boolean;
  customName?: string;
  dedication?: string;
  pricing: {
    plantingCost: number;
    verificationFee: number;
    planterPayout: number;
    total: number;
  };
  tree_id?: string;
}

export async function finalizePaymentIntent(
  admin: SupabaseClient,
  orderId: string,
  txn?: { cfOrderId?: string; paymentId?: string; provider?: string }
): Promise<{ treeId: string } | null> {
  const { data: intent } = await admin
    .from("payment_intents")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  if (!intent) return null;

  if (intent.status === "completed") {
    const treeId = (intent.payload as PaymentIntentPayload | null)?.tree_id;
    return treeId ? { treeId } : null;
  }
  if (intent.status !== "created") return null;

  // Lock the row so webhook + status-poll can't double-plant.
  const { data: locked } = await admin
    .from("payment_intents")
    .update({ status: "processing" })
    .eq("order_id", orderId)
    .eq("status", "created")
    .select()
    .maybeSingle();
  if (!locked) return null;

  const payload = locked.payload as PaymentIntentPayload;
  const species = speciesFromSlug(payload.species.slug);
  if (!species) {
    await markFailed(admin, orderId);
    throw new Error(`Unknown species ${payload.species.slug}`);
  }
  const pricing = pricingBreakdown(species);
  const user = locked.user_id as string;
  const planterMyself = payload.planterMyself;

  try {
    // 1. Permanent unique Tree ID.
    const { data: treeId, error: idError } = await admin.rpc("gen_tree_id", {
      country_code: "IN",
    });
    if (idError || typeof treeId !== "string") {
      throw new Error(idError?.message ?? "Could not generate a tree ID.");
    }

    // 2. Tree record.
    const defaultLabel =
      payload.region === "madurai"
        ? "Madurai, Tamil Nadu · community garden"
        : payload.region;
    const { data: tree, error: treeError } = await admin
      .from("trees")
      .insert({
        tree_id: treeId,
        species_id: species.id,
        species_name: species.name,
        species_emoji: species.emoji,
        species_image: species.image_url,
        sponsor_id: user,
        planter_id: planterMyself ? user : null,
        custom_name: payload.customName?.trim() || null,
        dedication: payload.dedication?.trim() || null,
        region: payload.region,
        location_label: defaultLabel,
        status: planterMyself ? "accepted" : "funded",
      })
      .select()
      .single();
    if (treeError) throw new Error(treeError.message);

    // 3. Planting mission.
    const { data: missionLabel } = await admin.rpc("gen_mission_no");
    const { error: missionError } = await admin.from("planting_missions").insert({
      mission_label: missionLabel ?? "TC-10001",
      tree_id: tree.id,
      planter_id: planterMyself ? user : null,
      payout: pricing.planterPayout,
      status: planterMyself ? "accepted" : "funded",
      deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      estimated_time: "1–2 hours",
    });
    if (missionError) throw new Error(missionError.message);

    // 4. Payment record.
    const { error: paymentError } = await admin.from("payments").insert({
      user_id: user,
      tree_id: tree.id,
      amount: pricing.total,
      description: `${species.name} · ${payload.region} · ${txn?.provider ?? "cashfree"}`,
      status: "succeeded",
      provider: txn?.provider ?? "cashfree",
      provider_txn_id: txn?.paymentId ?? null,
    });
    if (paymentError) throw new Error(paymentError.message);

    // 5. Activity + achievements.
    const treesCount = await countUserTrees(admin, user);
    await logActivity(admin, user, {
      type: planterMyself ? "planted" : "sponsored",
      message: planterMyself
        ? `🌱 You planted a ${species.name} tree`
        : `🌱 You sponsored a ${species.name} tree in ${payload.region}`,
      meta: { tree_id: treeId, region: payload.region },
    });
    await unlockAchievements(admin, user, treesCount);

    // 6. Mark completed (stores the tree id for idempotent replies).
    await admin
      .from("payment_intents")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        cf_order_id: txn?.cfOrderId ?? locked.cf_order_id ?? null,
        provider_txn_id: txn?.paymentId ?? locked.provider_txn_id ?? null,
        payload: { ...payload, tree_id: treeId },
      })
      .eq("order_id", orderId);

    return { treeId };
  } catch (err) {
    await markFailed(admin, orderId);
    throw err;
  }
}

async function markFailed(admin: SupabaseClient, orderId: string) {
  await admin
    .from("payment_intents")
    .update({ status: "failed" })
    .eq("order_id", orderId)
    .eq("status", "processing");
}

/* ------------------------------------------------------------------ */
/*  Species lookup (server side, mirrors SPECIES_CATALOG for safety)   */
/* ------------------------------------------------------------------ */

function speciesFromSlug(slug: string) {
  return speciesBySlug(slug);
}