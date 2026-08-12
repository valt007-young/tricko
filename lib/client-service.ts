import type { SupabaseClient } from "@supabase/supabase-js";
import { ACHIEVEMENT_DEFS, achievementsFor } from "./gamification";
import { pricingBreakdown } from "./constants";
import type { Species } from "./types";

export interface PlantPayload {
  species: Species;
  region: string;
  customName?: string;
  dedication?: string;
  planterMyself: boolean;
  note?: string;
}

export async function plantTree(
  supabase: SupabaseClient,
  payload: PlantPayload
): Promise<{ treeId: string; label: string; demo: boolean }> {
  const { species, region, customName, dedication, planterMyself } = payload;
  const pricing = pricingBreakdown(species);

  // 1. Permanent unique Tree ID (never reused).
  const { data: treeId, error: idError } = await supabase
    .rpc("gen_tree_id", { country_code: "IN" });
  if (idError || typeof treeId !== "string") {
    throw new Error(idError?.message ?? "Could not generate a tree ID.");
  }

  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();
  const sponsorId = sessionUser?.id ?? null;
  if (!sponsorId) throw new Error("You must be signed in to plant a tree.");

  // 2. Create the tree record.
  const defaultLabel =
    region === "madurai" ? "Madurai, Tamil Nadu · community garden" : region;
  const { data: tree, error: treeError } = await supabase
    .from("trees")
    .insert({
      tree_id: treeId,
      species_id: species.id,
      species_name: species.name,
      species_emoji: species.emoji,
      species_image: species.image_url,
      sponsor_id: sponsorId,
      planter_id: planterMyself ? sponsorId : null,
      custom_name: customName?.trim() || null,
      dedication: dedication?.trim() || null,
      region,
      location_label: defaultLabel,
      status: planterMyself ? "accepted" : "funded",
    })
    .select()
    .single();
  if (treeError) throw new Error(treeError.message);

  // 3. Create the planting mission.
  const { data: missionLabel } = await supabase.rpc("gen_mission_no");
  const { error: missionError } = await supabase.from("planting_missions").insert({
    mission_label: missionLabel ?? "TC-10001",
    tree_id: tree.id,
    planter_id: planterMyself ? sponsorId : null,
    payout: pricing.planterPayout,
    status: planterMyself ? "accepted" : "funded",
    deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    estimated_time: "1–2 hours",
  });
  if (missionError) throw new Error(missionError.message);

  // 4. Record the (demo) payment.
  const { error: paymentError } = await supabase.from("payments").insert({
    user_id: sponsorId,
    tree_id: tree.id,
    amount: pricing.total,
    description: `${species.name} · ${region} · demo payment`,
    status: "succeeded",
    provider: "demo",
    provider_txn_id:
      "DEMO-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
  });
  if (paymentError) throw new Error(paymentError.message);

  // 5. Log activity + unlock achievements.
  const treesCount = await countUserTrees(supabase, sponsorId);
  await logActivity(supabase, sponsorId, {
    type: planterMyself ? "planted" : "sponsored",
    message: planterMyself
      ? `🌱 You planted a ${species.name} tree`
      : `🌱 You sponsored a ${species.name} tree in ${region}`,
    meta: { tree_id: treeId, region },
  });
  await unlockAchievements(supabase, sponsorId, treesCount);

  return { treeId, label: defaultLabel, demo: true };
}

export async function countUserTrees(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("trees")
    .select("id", { count: "exact", head: true })
    .eq("sponsor_id", userId)
    .neq("status", "failed");
  return count ?? 0;
}

export async function unlockAchievements(
  supabase: SupabaseClient,
  userId: string,
  treeCount: number
): Promise<void> {
  const unlocked = achievementsFor(treeCount);
  for (const def of unlocked) {
    const { error } = await supabase.from("achievements").upsert(
      { user_id: userId, code: def.code, name: def.name, description: def.description },
      { onConflict: "user_id,code" }
    );
    if (error) continue;
  }
}

export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  entry: { type: string; message: string; meta?: Record<string, unknown> }
): Promise<void> {
  await supabase.from("activity").insert({
    user_id: userId,
    type: entry.type,
    message: entry.message,
    meta: entry.meta ?? {},
  });
}

export const ACHIEVEMENT_LIST = ACHIEVEMENT_DEFS;