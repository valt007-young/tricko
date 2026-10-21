import type { SupabaseClient } from "@supabase/supabase-js";
import { achievementsFor } from "./gamification";

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