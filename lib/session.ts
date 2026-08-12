import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { regionById } from "@/lib/constants";

/** Server-side session + profile helper. Returns nulls instead of throwing. */
export async function getServerSession() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { user: null, profile: null };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, profile: null };
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    return { user, profile: (profile as Profile) ?? null };
  } catch {
    return { user: null, profile: null };
  }
}

export function requireUser(session: { user: unknown; profile: unknown }, next: string) {
  if (!session.user) redirect(`/login?next=${encodeURIComponent(next)}`);
}

export function requirePlanter(session: { user: unknown; profile: Profile | null }, next: string) {
  requireUser(session, next);
  if (session.profile?.role !== "planter") {
    redirect(`/account?role=planter&from=${encodeURIComponent(next)}`);
  }
}

export function regionLabel(regionId: string): string {
  const r = regionById(regionId);
  return r ? `${r.label}, ${r.state}` : regionId;
}