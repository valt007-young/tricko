import type { Species } from "./types";
import type { ImpactStats } from "./constants";
import { REGIONS } from "./constants";
import { SPECIES_CATALOG } from "./species";
import { supabaseConfigured, createClient } from "./supabase/server";

/**
 * Server-side data access with graceful fallbacks so every screen
 * renders even before Supabase is configured (shows demo/static data).
 */

export async function getSpeciesList(): Promise<Species[]> {
  if (!supabaseConfigured()) return SPECIES_CATALOG;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("tree_species").select("*").order("id");
    if (data && data.length > 0) return data;
    return SPECIES_CATALOG;
  } catch {
    return SPECIES_CATALOG;
  }
}

export async function getLiveStats(): Promise<ImpactStats | null> {
  if (!supabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { count: treesPlanted } = await supabase
      .from("trees")
      .select("id", { count: "exact", head: true })
      .neq("status", "failed");
    const { count: growing } = await supabase
      .from("trees")
      .select("id", { count: "exact", head: true })
      .in("survival_status", ["growing", "healthy"])
      .or("survival_status.is.null,status.eq.verified");
    const { count: planters } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "planter")
      .eq("planter_verified", true);
    const { data: regionRows } = await supabase.from("trees").select("region");
    const locations = new Set((regionRows ?? []).map((r) => r.region)).size;
    return {
      trees_planted: treesPlanted ?? 0,
      currently_growing: growing ?? 0,
      active_planters: planters ?? 0,
      locations: locations || REGIONS.length,
    };
  } catch {
    return null;
  }
}

export async function getVerifiedTrees() {
  if (!supabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("trees")
      .select(
        "id, tree_id, species_name, species_emoji, species_image, custom_name, region, location_label, lat, lng, planted_at, status, survival_status, created_at"
      )
      .eq("status", "verified")
      .not("lat", "is", null)
      .order("created_at", { ascending: false })
      .limit(500);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getTreeByTreeId(treeId: string) {
  if (!supabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trees")
      .select(
        `*,
        growth_updates (*),
        proof (*)`
      )
      .eq("tree_id", treeId.toUpperCase())
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}