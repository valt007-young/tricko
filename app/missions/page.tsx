import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { EmptyState, Button, Badge } from "@/components/ui";
import { AcceptMissionButton } from "@/components/accept-mission";
import { getServerSession, requirePlanter, regionLabel } from "@/lib/session";
import { formatINR, timeAgo } from "@/lib/utils";
import { TREE_STATUS_META } from "@/lib/constants";

export const metadata: Metadata = { title: "Available planting missions" };

export default async function MissionsPage() {
  const session = await getServerSession();
  requirePlanter(session, "/missions");

  const missions = await fetchAvailableMissions();

  return (
    <section className="bg-cream-gradient min-h-screen py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
              Planter work
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-forest-950">
              🌱 Available missions
            </h1>
            <p className="mt-3 max-w-xl text-forest-900/60">
              Funded trees waiting for a verified planter near you. See the species,
              location, and payout up front.
            </p>
          </div>
          <Badge className="bg-forest-600 text-cream-50">
            {missions.length} open now
          </Badge>
        </div>

        <div className="mt-10 space-y-4">
          {missions.length === 0 && (
            <EmptyState
              emoji="🌱"
              title="No open missions right now"
              body="Sponsored trees near you appear here the moment they're funded. Check back soon."
            />
          )}

          {missions.map((mission) => (
            <MissionRow key={mission.id} mission={mission} />
          ))}
        </div>
      </div>
    </section>
  );
}

async function fetchAvailableMissions() {
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  const { data } = await supabase
    .from("planting_missions")
    .select(
      `id, mission_label, payout, status, deadline, created_at,
       trees ( tree_id, species_name, species_emoji, species_image, region, custom_name )`
    )
    .eq("status", "funded")
    .is("planter_id", null)
    .order("created_at", { ascending: true });
  return data ?? [];
}

interface MissionRowProps {
  id: string;
  mission_label: string;
  payout: number;
  status: string;
  deadline: string | null;
  created_at: string;
  trees?: Array<{
    tree_id: string;
    species_name: string;
    species_emoji: string | null;
    species_image: string | null;
    region: string;
    custom_name: string | null;
  }>;
}

function MissionRow({ mission }: { mission: MissionRowProps }) {
  const tree = mission.trees?.[0] ?? null;
  const statusMeta = TREE_STATUS_META[mission.status as keyof typeof TREE_STATUS_META];
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft transition-all hover:shadow-lift md:flex-row md:items-center">
      {tree?.species_image ? (
        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-forest-100 md:w-44">
          <Image
            src={tree.species_image}
            alt={tree.species_name}
            fill
            sizes="176px"
            className="object-cover"
          />
          <div className="absolute bottom-2 left-2 rounded-full bg-forest-950/70 px-2.5 py-0.5 text-xs font-medium text-cream-50 backdrop-blur">
            {tree.species_emoji} {tree.species_name}
          </div>
        </div>
      ) : (
        <div className="grid h-32 w-full shrink-0 place-items-center rounded-2xl bg-forest-100 text-4xl md:w-44">
          🌳
        </div>
      )}

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-forest-600">
            MISSION {mission.mission_label}
          </span>
          <Badge className={statusMeta?.color}>{statusMeta?.dot} {statusMeta?.label}</Badge>
        </div>
        <h2 className="mt-1.5 font-display text-xl font-bold text-forest-950">
          {tree?.custom_name || tree?.species_name} · {tree?.tree_id}
        </h2>
        <p className="mt-1 text-sm text-forest-900/60">
          📍 {tree?.region ? regionLabel(tree.region) : "Location TBA"} · Posted {timeAgo(mission.created_at)}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-forest-900/70">
          <span>💰 Payout: <strong className="text-forest-700">{formatINR(mission.payout)}</strong></span>
          <span>⏱ Estimated: 1–2 hours</span>
          <span>📸 Proof required</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
        <Link href={`/missions/${mission.id}`}>
          <Button variant="outline" className="w-full md:w-auto">
            View details
          </Button>
        </Link>
        <AcceptMissionButton missionId={mission.id} />
      </div>
    </div>
  );
}