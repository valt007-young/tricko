import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge, Card, EmptyState } from "@/components/ui";
import { StatusBadge, SurvivalBadge } from "@/components/status-badge";
import { ProofForm } from "@/components/proof-form";
import { AcceptMissionButton } from "@/components/accept-mission";
import { getServerSession, requirePlanter, regionLabel } from "@/lib/session";
import { regionById, MISSION_DEADLINE_HOURS } from "@/lib/constants";
import { formatDateTime, formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Planting mission" };

export default async function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  requirePlanter(session, "/missions");

  const { id } = await params;
  const result = await fetchMission(id);
  if (!result) notFound();

  const { mission, tree, proof } = result;
  const mine = mission.planter_id === session.profile?.id;
  const region = regionById(tree.region);

  return (
    <section className="bg-cream-gradient min-h-screen py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/missions" className="text-sm font-medium text-forest-600 hover:underline">
          ← All missions
        </Link>

        {/* hero */}
        <Card className="mt-4 overflow-hidden">
          {tree.species_image ? (
            <div className="relative h-56 w-full sm:h-72">
              <Image
                src={tree.species_image}
                alt={tree.species_name}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-forest-950/60 text-cream-50 backdrop-blur">
                    MISSION {mission.mission_label}
                  </Badge>
                  <StatusBadge status={mission.status} className="bg-cream-50/90" />
                </div>
                <h1 className="mt-2 font-display text-3xl font-bold text-cream-50 md:text-4xl">
                  {tree.species_emoji} {tree.custom_name || tree.species_name}
                </h1>
                <p className="mt-1 font-mono text-sm text-cream-200/80">{tree.tree_id}</p>
              </div>
            </div>
          ) : (
            <div className="grid h-56 place-items-center bg-forest-100 text-6xl">🌳</div>
          )}

          <div className="grid gap-px bg-forest-900/10 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCell label="📍 Location" value={regionLabel(tree.region)} />
            <InfoCell label="💰 Payout" value={formatINR(mission.payout)} strong />
            <InfoCell label="⏱ Deadline" value={`${MISSION_DEADLINE_HOURS} hours · ${formatDateTime(mission.deadline)}`} />
            <InfoCell label="🕐 Est. time" value={mission.estimated_time ?? "1–2 hours"} />
          </div>
        </Card>

        {/* body */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {mission.status === "funded" && (
              <Card className="p-6">
                <h2 className="font-display text-lg font-bold text-forest-950">
                  Ready to plant
                </h2>
                <p className="mt-2 text-sm text-forest-900/60">
                  This mission is funded and waiting for a planter. Check the location and
                  species notes, then accept to start.
                </p>
                {tree.species && (
                  <p className="mt-3 rounded-2xl bg-forest-50 p-4 text-sm text-forest-800">
                    <strong>Care note:</strong> {tree.species.care_notes ?? "Water young trees regularly in the first season."}
                  </p>
                )}
                <div className="mt-5">
                  <AcceptMissionButton missionId={mission.id} />
                </div>
              </Card>
            )}

            {mine && tree.status !== "funded" && tree.status !== "awaiting_verification" && (
              <Card className="p-6">
                <h2 className="font-display text-lg font-bold text-forest-950">
                  📸 Submit planting proof
                </h2>
                <p className="mb-5 mt-1 text-sm text-forest-900/55">
                  You&apos;ve accepted this mission. Plant the tree, then submit proof. Your tree
                  is only marked planted after verification.
                </p>
                <ProofForm
                  missionId={mission.id}
                  treeId={tree.id}
                  fallbackRegion={regionLabel(tree.region)}
                  region={region}
                />
              </Card>
            )}

            {mine && tree.status === "awaiting_verification" && (
              <Card className="p-6">
                <h2 className="font-display text-lg font-bold text-forest-950">
                  🟣 Awaiting verification
                </h2>
                <p className="mt-2 text-sm text-forest-900/60">
                  Your proof has been submitted. TRIKO is reviewing the photos, video and
                  location. You&apos;ll be notified when the tree is verified or needs more proof.
                </p>
                {proof && (
                  <div className="mt-4 rounded-2xl border border-forest-900/10 bg-cream p-4">
                    <Badge className="bg-purple-100 text-purple-800">
                      {proof.verification_status}
                    </Badge>
                    <p className="mt-2 text-sm text-forest-900/70">
                      Submitted {formatDateTime(proof.submitted_at)}
                    </p>
                    {proof.admin_note && (
                      <p className="mt-2 text-sm italic text-forest-900/55">{proof.admin_note}</p>
                    )}
                  </div>
                )}
              </Card>
            )}

            {!mine && mission.planter_id && (
              <Card className="p-6">
                <EmptyState
                  emoji="🔒"
                  title="Mission already assigned"
                  body="Another planter accepted this mission. Keep an eye on open missions for your next one."
                />
              </Card>
            )}
          </div>

          <aside className="space-y-4">
            <MissionSummary tree={tree} />
          </aside>
        </div>
      </div>
    </section>
  );
}

function InfoCell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="bg-cream-50 p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-forest-900/45">{label}</div>
      <div className={`mt-1 text-sm ${strong ? "font-display text-xl font-bold text-forest-700" : "text-forest-950"}`}>
        {value}
      </div>
    </div>
  );
}

function MissionSummary({ tree }: { tree: NonNullable<Awaited<ReturnType<typeof fetchMission>>>["tree"] }) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft">
      <h3 className="font-display text-base font-bold text-forest-950">Mission summary</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <Row label="Tree ID" value={<span className="font-mono">{tree.tree_id}</span>} />
        <Row label="Species" value={`${tree.species_name}`} />
        <Row label="Region" value={regionLabel(tree.region)} />
        <Row label="Sponsor" value="Private to public" />
      </dl>
      <div className="mt-4 border-t border-forest-900/10 pt-4">
        <SurvivalBadge status={tree.survival_status} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-forest-900/55">{label}</dt>
      <dd className="text-right font-medium text-forest-950">{value}</dd>
    </div>
  );
}

async function fetchMission(id: string) {
  try {
    const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
    const { data: mission } = await supabase
      .from("planting_missions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!mission) return null;

    const { data: tree } = await supabase
      .from("trees")
      .select("*, species (*)")
      .eq("id", mission.tree_id)
      .maybeSingle();
    if (!tree) return null;

    const { data: proof } = await supabase
      .from("proof")
      .select("*")
      .eq("tree_id", tree.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return { mission, tree, proof };
  } catch {
    return null;
  }
}