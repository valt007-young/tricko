import type { Metadata } from "next";
import { Card, Badge } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/ui";
import { getServerSession, requirePlanter, regionLabel } from "@/lib/session";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "My planting work" };

export default async function WorkPage() {
  const session = await getServerSession();
  requirePlanter(session, "/work");

  const missions = await fetchVerifiedWork(session.profile!.id);
  const verified = missions.filter((m) => m.status === "verified");
  const pending = missions.filter((m) => m.status === "awaiting_verification");
  const eligible = verified.reduce((sum, m) => sum + Number(m.payout), 0);

  return (
    <section className="bg-cream-gradient min-h-screen py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
          Planter earnings
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-forest-950">
          💰 My planting work
        </h1>
        <p className="mt-3 max-w-xl text-forest-900/60">
          Payouts become eligible only after a tree is verified. Demo mode — no real money
          is transferred.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Completed missions" value={String(missions.length)} emoji="✅" />
          <Stat label="Verified trees" value={String(verified.length)} emoji="🌳" />
          <Stat label="Pending verification" value={String(pending.length)} emoji="🟣" />
          <Stat label="Eligible earnings" value={formatINR(eligible)} emoji="💰" highlight />
        </div>

        <Card className="mt-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-forest-950">Mission history</h2>
            <Badge className="bg-forest-100 text-forest-700">{missions.length} total</Badge>
          </div>
          {missions.length === 0 ? (
            <div className="mt-6">
              <EmptyState emoji="🧰" title="Nothing here yet" body="Accept and complete a mission to build your history." />
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-900/10 text-xs uppercase tracking-wide text-forest-900/45">
                    <th className="py-2.5 pr-4 font-medium">Mission</th>
                    <th className="py-2.5 pr-4 font-medium">Tree</th>
                    <th className="py-2.5 pr-4 font-medium">Date</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 text-right font-medium">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/8">
                  {missions.map((m) => (
                    <tr key={m.id}>
                      <td className="py-3 pr-4 font-mono text-xs font-bold text-forest-600">
                        {m.mission_label}
                      </td>
                      <td className="py-3 pr-4">
                        {m.trees?.[0]?.species_name} · {m.trees?.[0]?.tree_id}
                        <div className="text-xs text-forest-900/45">{regionLabel(m.trees?.[0]?.region ?? "")}</div>
                      </td>
                      <td className="py-3 pr-4 text-forest-900/70">{formatDate(m.created_at)}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="py-3 text-right font-semibold text-forest-800">
                        {formatINR(m.payout)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <p className="mt-6 rounded-2xl bg-forest-950 px-4 py-3 text-xs text-cream-200/70">
          <strong>Payment flow:</strong> sponsor pays → mission funded → you accept → you plant →
          proof submitted → TRIKO verifies → your payout becomes eligible. Configurable fee
          splits are managed by admins; a real provider can be plugged in later.
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value, emoji, highlight }: { label: string; value: string; emoji: string; highlight?: boolean }) {
  return (
    <div className={`rounded-3xl border px-5 py-6 text-center shadow-soft ${highlight ? "border-forest-600 bg-forest-700 text-cream-50" : "border-forest-900/10 bg-cream-50"}`}>
      <div className="text-2xl" aria-hidden>
        {emoji}
      </div>
      <div className="mt-1.5 font-display text-2xl font-bold">{value}</div>
      <div className={`mt-0.5 text-[11px] font-medium uppercase tracking-wide ${highlight ? "text-cream-200/70" : "text-forest-900/45"}`}>
        {label}
      </div>
    </div>
  );
}

async function fetchVerifiedWork(planterId: string) {
  try {
    const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
    const { data } = await supabase
      .from("planting_missions")
      .select(
        `id, mission_label, payout, status, created_at,
         trees ( tree_id, species_name, species_emoji, species_image, region )`
      )
      .eq("planter_id", planterId)
      .in("status", ["verified", "awaiting_verification", "needs_review"])
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}