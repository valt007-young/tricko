import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import { StatusBadge, SurvivalBadge } from "@/components/status-badge";
import { TreeShare } from "@/components/tree-share";
import { getTreeByTreeId } from "@/lib/server-data";
import { formatDate, formatDateTime } from "@/lib/utils";
import { regionById } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ treeId: string }>;
}): Promise<Metadata> {
  const { treeId } = await params;
  const tree = await getTreeByTreeId(treeId);
  if (!tree) return { title: "Tree not found" };
  return {
    title: `${tree.custom_name || tree.species_name} · ${tree.tree_id}`,
    description: tree.dedication || `A verified TRIKO tree planted in ${regionLabel(tree.region)}.`,
    openGraph: {
      title: `${tree.custom_name || tree.species_name} · ${tree.tree_id}`,
      images: tree.species_image ? [{ url: tree.species_image }] : undefined,
    },
  };
}

export default async function TreePage({
  params,
}: {
  params: Promise<{ treeId: string }>;
}) {
  const { treeId } = await params;
  const tree = await getTreeByTreeId(treeId.toUpperCase());
  if (!tree) notFound();

  const verified = tree.status === "verified";
  const proof = tree.proof?.[0];
  const updates = [...(tree.growth_updates ?? [])].sort((a, b) =>
    (a.date ?? "").localeCompare(b.date ?? "")
  );

  return (
    <section className="bg-cream-gradient min-h-screen py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div className="overflow-hidden rounded-[2.5rem] border border-forest-900/10 bg-cream-50 shadow-lift">
          <div className="relative h-64 sm:h-80">
            {tree.species_image ? (
              <Image
                src={tree.species_image}
                alt={tree.species_name}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center bg-forest-100 text-8xl">🌳</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/75 via-forest-950/20 to-transparent" />
            <div className="absolute bottom-5 left-6 right-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={tree.status} className="bg-cream-50/90" />
                <Badge className="bg-forest-950/60 text-cream-50 backdrop-blur">
                  🆔 {tree.tree_id}
                </Badge>
              </div>
              <h1 className="mt-2 font-display text-4xl font-bold text-cream-50 md:text-5xl">
                {tree.emoji} {tree.custom_name || tree.species_name}
              </h1>
              <p className="mt-1 font-mono text-sm text-cream-200/80">{tree.tree_id}</p>
            </div>
          </div>

          <div className="grid gap-px bg-forest-900/10 sm:grid-cols-2 lg:grid-cols-4">
            <Meta label="🌳 Species" value={tree.species_name} />
            <Meta label="📍 Location" value={`${regionLabel(tree.region)} · ${tree.location_label ?? ""}`.trim()} />
            <Meta label="📅 Planted" value={formatDate(tree.planted_at || tree.created_at)} />
            <Meta label="🌱 Status" value={<SurvivalBadge status={tree.survival_status} />} />
          </div>
        </div>

        {tree.dedication && (
          <blockquote className="mx-auto mt-6 max-w-2xl rounded-3xl border border-forest-900/10 bg-cream-50 px-6 py-5 text-center text-lg italic text-forest-800 shadow-soft">
            “{tree.dedication}”
          </blockquote>
        )}

        {/* journey */}
        <Card className="mt-8 p-8">
          <h2 className="font-display text-2xl font-bold text-forest-950">Tree journey</h2>
          <div className="mt-6 grid grid-cols-5 gap-2">
            {JOURNEY.map((step, i) => (
              <div key={step.label} className="text-center">
                <div
                  className={`mx-auto grid h-11 w-11 place-items-center rounded-full border-2 text-lg ${
                    step.done()
                      ? "border-forest-500 bg-forest-600 text-cream-50"
                      : i < 4
                        ? "border-forest-200 bg-forest-50"
                        : "border-sun-400 bg-sun-400/20"
                  }`}
                  aria-hidden
                >
                  {step.done() ? "✓" : step.emoji}
                </div>
                <p className="mt-2 text-xs font-semibold text-forest-900/70">{step.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* proof */}
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold text-forest-950">Planting proof</h2>
            {proof ? (
              <div className="mt-4 space-y-3">
                {proof.photo_url && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image src={proof.photo_url} alt="Planting photo" fill sizes="480px" className="object-cover" />
                  </div>
                )}
                <p className="text-sm text-forest-900/70">
                  📍 {proof.location_label ?? "General location"} ·{" "}
                  {formatDateTime(proof.submitted_at)}
                </p>
                {proof.description && (
                  <p className="rounded-2xl bg-forest-50 p-3 text-sm text-forest-800">
                    “{proof.description}”
                  </p>
                )}
                <Badge className={proof.verification_status === "approved" ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-700"}>
                  Proof: {proof.verification_status}
                </Badge>
              </div>
            ) : (
              <p className="mt-4 text-sm text-forest-900/50">Proof becomes visible once verified.</p>
            )}
          </Card>

          {/* certificate */}
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold text-forest-950">Certificate</h2>
            <div className="mt-4 rounded-2xl border-2 border-dashed border-forest-300 bg-forest-50 p-5 text-center">
              <div className="text-4xl">🌳</div>
              <p className="mt-2 font-display text-lg font-bold text-forest-950">
                TRIKO Tree Certificate
              </p>
              <p className="mt-1 text-sm text-forest-900/60">
                This certifies that{" "}
                <strong>{tree.custom_name || tree.species_name}</strong> has been planted
                through TRIKO.
              </p>
              <p className="mt-3 font-mono text-sm text-forest-700">{tree.tree_id}</p>
              <p className="mt-1 text-xs text-forest-900/50">
                {tree.species_name} · {regionLabel(tree.region)} ·{" "}
                {formatDate(tree.planted_at || tree.created_at)}
              </p>
            </div>
            {verified ? (
              <div className="mt-4">
                <p className="mb-3 text-sm font-medium text-forest-900/70">
                  {tree.custom_name ? (
                    <>Your tree is alive in the world. Share it with the people you planted it for.</>
                  ) : (
                    "Your tree is alive in the world. Share it."
                  )}
                </p>
                <TreeShare
                  data={{
                    customName: tree.custom_name || tree.species_name,
                    speciesName: tree.species_name,
                    treeId: tree.tree_id,
                    location: regionLabel(tree.region),
                    plantedAt: formatDate(tree.planted_at || tree.created_at),
                    status: "🟢 VERIFIED",
                    emoji: tree.species_emoji ?? "🌳",
                  }}
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-forest-900/50">
                The certificate + sharing unlocks once this tree is verified.
              </p>
            )}
          </Card>
        </div>

        {/* growth timeline */}
        <Card className="mt-8 p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-forest-950">
              Growth timeline
            </h2>
            <SurvivalBadge status={tree.survival_status} />
          </div>
          <ol className="mt-6 space-y-4">
            {updates.length === 0 && (
              <li className="text-sm text-forest-900/50">
                No updates yet — planter check-ins appear here (Day 30, Day 90, …).
              </li>
            )}
            {updates.map((u) => (
              <li key={u.id} className="flex gap-4 rounded-2xl bg-forest-50 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest-600 text-lg text-cream-50">
                  {u.status ? emojiStatus(u.status) : "📸"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-forest-950">{u.day_label ?? formatDate(u.date)}</span>
                    <span className="text-xs text-forest-900/45">{formatDate(u.date)}</span>
                  </div>
                  {u.notes && <p className="mt-1 text-sm text-forest-900/70">{u.notes}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="mt-10 text-center">
          <Link href="/plant">
            <Button size="lg">🌱 Plant yours →</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

const JOURNEY = [
  { label: "Funded", emoji: "🟡", done: () => true },
  { label: "Accepted", emoji: "🔵", done: () => true },
  { label: "Planted", emoji: "🪴", done: () => true },
  { label: "Verified", emoji: "✅", done: () => true },
  { label: "Growing", emoji: "🌱", done: () => false },
];

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-cream-50 p-5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-forest-900/45">{label}</div>
      <div className="mt-1 text-sm font-semibold text-forest-950">{value}</div>
    </div>
  );
}

function regionLabel(region: string): string {
  const r = regionById(region);
  return r ? `${r.label}, ${r.state}` : region;
}

function emojiStatus(status: string): string {
  if (/planted|growing/i.test(status)) return "🌱";
  if (/healthy/i.test(status)) return "🟢";
  if (/needs/i.test(status)) return "🟡";
  return "📸";
}