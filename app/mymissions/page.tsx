import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { getServerSession, requirePlanter, regionLabel } from "@/lib/session";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "My missions" };

export default async function MyMissionsPage() {
  const session = await getServerSession();
  requirePlanter(session, "/mymissions");

  const missions = await fetchMyMissions(session.profile!.id);

  return (
    <section className="bg-cream-gradient min-h-screen py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
          Planter work
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-forest-950">
          🌱 My missions
        </h1>
        <p className="mt-3 max-w-xl text-forest-900/60">
          Missions you&apos;ve accepted. Plant, submit proof, and get paid after verification.
        </p>

        <div className="mt-10 space-y-4">
          {missions.length === 0 && (
            <EmptyState
              emoji="🧭"
              title="No missions yet"
              body="Browse available missions and accept one to get started."
              action={
                <Link href="/missions">
                  <Button>Find a mission</Button>
                </Link>
              }
            />
          )}

          {missions.map((mission) => {
            const tree = mission.trees?.[0];
            return (
              <Card key={mission.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-forest-100 md:w-36">
                  {tree?.species_image ? (
                    <Image src={tree.species_image} alt={tree.species_name} fill sizes="144px" className="object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-4xl">🌳</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-forest-600">
                      {mission.mission_label}
                    </span>
                    <StatusBadge status={mission.status} />
                    {mission.status === "verified" && (
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    )}
                  </div>
                  <h2 className="mt-1 font-display text-lg font-bold text-forest-950">
                    {tree?.species_name} · {tree?.tree_id}
                  </h2>
                  <p className="mt-0.5 text-sm text-forest-900/55">
                    📍 {regionLabel(tree?.region ?? "")} · Accepted {formatDate(mission.created_at)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                  <div className="text-right">
                    <div className="text-[11px] text-forest-900/45">Payout</div>
                    <div className="font-display text-xl font-bold text-forest-700">
                      {formatINR(mission.payout)}
                    </div>
                  </div>
                  {(mission.status === "accepted" || mission.status === "planting") && (
                    <Link href={`/missions/${mission.id}`}>
                      <Button size="sm" variant="outline">
                        Open mission →
                      </Button>
                    </Link>
                  )}
                  {mission.status === "awaiting_verification" && (
                    <Link href={`/missions/${mission.id}`}>
                      <Button size="sm" variant="secondary">
                        View proof status
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

async function fetchMyMissions(planterId: string) {
  try {
    const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
    const { data } = await supabase
      .from("planting_missions")
      .select(
        `id, mission_label, payout, status, deadline, created_at,
         trees ( tree_id, species_name, species_emoji, species_image, region, custom_name )`
      )
      .eq("planter_id", planterId)
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}