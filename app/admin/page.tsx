import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Badge, Card, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { AdminActions } from "@/components/admin-actions";
import { getServerSession, regionLabel } from "@/lib/session";
import { formatINR, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session.user) redirect("/login?next=%2Fadmin");
  if (session.profile?.role !== "admin") {
    redirect("/forest");
  }

  const data = await loadAdminData();
  if (!data) notFound();

  return (
    <section className="bg-cream-gradient min-h-screen py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
          Platform control
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-forest-950">
          🛠 Admin dashboard
        </h1>

        {/* overview */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Stat label="Trees funded" value={data.overview.funded} />
          <Stat label="Trees planted" value={data.overview.planted} />
          <Stat label="Trees verified" value={data.overview.verified} />
          <Stat label="Active planters" value={data.overview.planters} />
          <Stat label="Pending verification" value={data.overview.pending} />
          <Stat label="Needs review" value={data.overview.needsReview} />
          <Stat label="Failed plantings" value={data.overview.failed} />
          <Stat label="Total contributions" value={formatINR(data.overview.contributions)} />
          <Stat label="Planter payouts (eligible)" value={formatINR(data.overview.payouts)} />
          <Stat label="Platform fee share" value={formatINR(data.overview.platformShare)} />
        </div>

        {/* verification queue */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-forest-950">
              Verification queue
            </h2>
            <Badge className="bg-purple-100 text-purple-800">
              {data.queue.length} awaiting
            </Badge>
          </div>

          <div className="mt-5 space-y-4">
            {data.queue.length === 0 && (
              <EmptyState
                emoji="🎉"
                title="Queue is clear"
                body="All submitted proof has been reviewed. New submissions appear here."
              />
            )}

            {data.queue.map((row) => (
              <Card key={row.id} className="p-5">
                <div className="grid gap-5 lg:grid-cols-[200px_1fr]">
                  <div className="space-y-3">
                    {row.photo_url ? (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-forest-100">
                        <Image src={row.photo_url} alt="Proof photo" fill sizes="200px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-forest-100 text-4xl">🌳</div>
                    )}
                    {row.video_url && (
                      <a
                        href={row.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-2xl bg-forest-950 px-4 py-2.5 text-center text-xs font-semibold text-cream-50"
                      >
                        ▶ Watch video proof
                      </a>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/tree/${row.tree_id}`} className="font-mono text-sm font-bold text-forest-700 hover:underline">
                        {row.tree_id}
                      </Link>
                      <StatusBadge status={row.status} />
                      {row.location_ok ? (
                        <Badge className="bg-green-100 text-green-800">📍 Location ok</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">📍 Missing location</Badge>
                      )}
                    </div>
                    <h3 className="mt-1.5 font-display text-lg font-bold text-forest-950">
                      {row.species_name}
                    </h3>
                    <div className="mt-2 grid gap-x-8 gap-y-1 text-sm text-forest-900/70 sm:grid-cols-2 lg:grid-cols-3">
                      <span>🙋 Sponsor: {row.sponsor_name || "—"}</span>
                      <span>🧑‍🌾 Planter: {row.planter_name || "—"}</span>
                      <span>📍 {row.region}</span>
                      <span>📸 {row.photo_url ? "Photo present" : "No photo"}</span>
                      <span>🎬 {row.video_url ? "Video present" : "No video"}</span>
                      <span>🕒 {formatDateTime(row.submitted_at)}</span>
                    </div>
                    {row.description && (
                      <p className="mt-3 rounded-2xl bg-cream px-4 py-3 text-sm italic text-forest-800">
                        “{row.description}”
                      </p>
                    )}
                    <div className="mt-4">
                      <AdminActions
                        treeId={row.id}
                        missionId={row.mission_id}
                        sponsorId={row.sponsor_id}
                        proofId={row.proof_id}
                        treeLabel={row.tree_id}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-cream-50 px-4 py-5 text-center shadow-soft">
      <div className="font-display text-2xl font-bold text-forest-900">{value}</div>
      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-forest-900/45">
        {label}
      </div>
    </div>
  );
}

async function loadAdminData() {
  try {
    const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());

    const mid = await Promise.all([
      supabase.from("trees").select("id", { count: "exact", head: true }).neq("status", "failed"),
      supabase.from("trees").select("id", { count: "exact", head: true }).in("status", ["planting", "awaiting_verification", "verified"]),
      supabase.from("trees").select("id", { count: "exact", head: true }).eq("status", "verified"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "planter"),
      supabase.from("trees").select("id", { count: "exact", head: true }).eq("status", "awaiting_verification"),
      supabase.from("trees").select("id", { count: "exact", head: true }).eq("status", "needs_review"),
      supabase.from("trees").select("id", { count: "exact", head: true }).eq("status", "failed"),
    ]);
    const n = (r: { count: number | null }) => r.count ?? 0;
    const funded = n(mid[0]);
    const planted = n(mid[1]);
    const verified = n(mid[2]);
    const planters = n(mid[3]);
    const pending = n(mid[4]);
    const needsReview = n(mid[5]);
    const failed = n(mid[6]);

    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "succeeded");
    const contributions = (payments ?? []).reduce((s, p) => s + Number(p.amount), 0);

    const { data: missions } = await supabase
      .from("planting_missions")
      .select("payout, status");
    const payouts = (missions ?? [])
      .filter((m) => m.status === "verified")
      .reduce((s, m) => s + Number(m.payout), 0);
    const platformShare = contributions - payouts - 0; // contributions collected minus payouts eligible

    // queue rows joined manually (single queries for MVP clarity)
    const { data: queueTrees } = await supabase
      .from("trees")
      .select("id, tree_id, species_name, sponsor_id, planter_id, region, status")
      .in("status", ["awaiting_verification", "needs_review"])
      .order("created_at", { ascending: true });

    const rows = [];
    for (const t of queueTrees ?? []) {
      const [proofRes, sponsorRes, planterRes] = await Promise.all([
        supabase
          .from("proof")
          .select("id, photo_url, video_url, description, location_label, submitted_at, verification_status, lat, lng")
          .eq("tree_id", t.id)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("profiles").select("full_name").eq("id", t.sponsor_id).maybeSingle(),
        t.planter_id
          ? supabase.from("profiles").select("full_name").eq("id", t.planter_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      const missionRes = await supabase
        .from("planting_missions")
        .select("id")
        .eq("tree_id", t.id)
        .maybeSingle();

      rows.push({
        id: t.id,
        tree_id: t.tree_id,
        species_name: t.species_name,
        sponsor_id: t.sponsor_id,
        sponsor_name: sponsorRes.data?.full_name ?? "",
        planter_name: planterRes.data?.full_name ?? "",
        region: regionLabel(t.region),
        status: t.status,
        mission_id: missionRes.data?.id ?? null,
        proof_id: proofRes.data?.id ?? "",
        photo_url: proofRes.data?.photo_url ?? null,
        video_url: proofRes.data?.video_url ?? null,
        description: proofRes.data?.description ?? "",
        submitted_at: proofRes.data?.submitted_at ?? null,
        location_ok: Boolean(proofRes.data?.lat != null && proofRes.data?.lng != null),
      });
    }

    return {
      overview: {
        funded,
        planted,
        verified,
        planters,
        pending,
        needsReview,
        failed,
        contributions,
        payouts,
        platformShare: Math.max(0, platformShare),
      },
      queue: rows,
    };
  } catch {
    return null;
  }
}