import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Button, EmptyState } from "@/components/ui";
import { TreeCard } from "@/components/tree-card";
import { getServerSession, requireUser } from "@/lib/session";
import {
  forestLevelFor,
  progressToNextLevel,
  monthlyGoalProgress,
  plantingStreak,
  estimatedShadeArea,
  ESTIMATE_METHODOLOGY,
  IMPACT_NOTICE,
} from "@/lib/gamification";
import { formatINR, timeAgo, formatDate } from "@/lib/utils";
import type { Achievement, ActivityItem, Payment, TreeRecord } from "@/lib/types";

export const metadata: Metadata = { title: "My Forest" };

export default async function ForestPage() {
  const session = await getServerSession();
  requireUser(session, "/forest");

  const data = await loadForest(session.profile!.id);
  if (!data) notFound();

  const { trees, achievements, activity, payments, hasSupabase } = data;
  const active = trees.filter((t) => t.status !== "failed");
  const growing = active.filter(
    (t) => t.survival_status === "growing" || t.survival_status === "healthy"
  );
  const treeCount = active.length;
  const level = forestLevelFor(treeCount);
  const levelProgress = progressToNextLevel(treeCount);
  const goal = monthlyGoalProgress(active.map((t) => t.created_at));
  const streak = plantingStreak(active.map((t) => t.created_at));
  const totalSpend = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const impact = estimatedShadeArea(treeCount);

  return (
    <section className="bg-cream-gradient min-h-screen py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
              Dashboard
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-forest-950 md:text-5xl">
              🌳 My forest
            </h1>
          </div>
          <Link href="/plant">
            <Button size="lg">🌱 Plant a Tree</Button>
          </Link>
        </div>

        {!hasSupabase && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>Supabase not configured.</strong> You&apos;ll see your forest here after
            it&apos;s connected and you&apos;ve planted trees. See{" "}
            <code className="rounded bg-amber-100 px-1">.env.local.example</code>.
          </div>
        )}

        {/* stat cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Stat emoji="🌳" label="Trees planted" value={String(treeCount)} />
          <Stat emoji="🌱" label="Trees growing" value={String(growing.length)} />
          <Stat emoji="🔥" label="Planting streak" value={`${streak} days`} />
          <Stat emoji={level.art} label={level.name} value={`Level ${level.level}`} />
          <Stat emoji="💚" label="Total invested" value={formatINR(totalSpend)} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* recent activity + trees */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-forest-950">
                Recent activity
              </h2>
              <ul className="mt-4 divide-y divide-forest-900/8 rounded-3xl border border-forest-900/10 bg-cream-50 shadow-soft">
                {activity.length === 0 && (
                  <li className="px-5 py-6 text-sm text-forest-900/50">
                    No activity yet — plant your first tree to get moving.
                  </li>
                )}
                {activity.slice(0, 8).map((a) => (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-4">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-100 text-lg">
                      {emojiFor(a.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-forest-950">{a.message}</p>
                      <p className="mt-0.5 text-xs text-forest-900/45">{timeAgo(a.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-forest-950">
                  Your trees
                </h2>
                <span className="text-sm text-forest-900/45">{treeCount} in your forest</span>
              </div>
              {active.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    emoji="🌱"
                    title="Your forest is empty"
                    body="Plant or sponsor your first tree — it appears here with its Tree ID, proof and growth updates."
                    action={
                      <Link href="/plant">
                        <Button>🌱 Plant your first tree</Button>
                      </Link>
                    }
                  />
                </div>
              ) : (
                <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {active.map((tree) => (
                    <TreeCard key={tree.id} tree={tree} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* right rail */}
          <aside className="space-y-6">
            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-forest-950">
                Forest level
              </h3>
              <div className="mt-4 text-center">
                <div className="text-5xl">{level.art}</div>
                <p className="mt-2 font-display text-xl font-bold text-forest-900">
                  Level {level.level} — {level.name}
                </p>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-forest-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-forest-500 to-forest-300 transition-all"
                    style={{ width: `${levelProgress * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-forest-900/50">
                  {levelProgress >= 1 ? "Max level!" : `${Math.round(levelProgress * 100)}% to the next level`}
                </p>
              </div>
              <div className="mt-5 space-y-2">
                {achievements.length === 0 && (
                  <p className="text-sm text-forest-900/50">No achievements yet.</p>
                )}
                {achievements.map((a) => (
                  <div key={a.code} className="flex items-center gap-3 rounded-2xl bg-forest-50 px-4 py-3">
                    <span className="text-xl">🏆</span>
                    <div>
                      <p className="text-sm font-semibold text-forest-950">{a.name}</p>
                      <p className="text-xs text-forest-900/50">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-forest-950">
                Your monthly goal
              </h3>
              <p className="mt-1 text-sm text-forest-900/55">
                Plant {goal.target} trees this month
              </p>
              <div className="mt-4 text-2xl tracking-widest" aria-hidden>
                {Array.from({ length: goal.target }, (_, i) => (i < goal.current ? "🌳" : "░")).join("")}
              </div>
              <p className="mt-3 text-sm text-forest-900/65">
                {goal.current >= goal.target
                  ? "Goal complete — your mini forest just grew! 🎉"
                  : `You're ${goal.remaining} tree${goal.remaining > 1 ? "s" : ""} away from growing your mini forest.`}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-forest-950">
                Est. impact
              </h3>
              <p className="mt-2 font-display text-2xl font-bold text-forest-700">
                ~{impact} m²
              </p>
              <p className="mt-1 text-sm text-forest-900/55">
                estimated eventual canopy shade across your trees
              </p>
              <p className="mt-4 border-t border-forest-900/10 pt-3 text-[11px] leading-relaxed text-forest-900/45">
                {ESTIMATE_METHODOLOGY}
              </p>
              <span className="mt-2 inline-block text-[11px] font-semibold text-forest-600">
                {IMPACT_NOTICE}
              </span>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-forest-950">
                Planting history
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {[...trees].slice(0, 6).map((t) => (
                  <li key={t.id} className="flex justify-between gap-2 text-forest-900/75">
                    <Link href={`/tree/${t.tree_id}`} className="truncate font-mono text-xs hover:underline">
                      {t.tree_id}
                    </Link>
                    <span className="shrink-0">{formatDate(t.created_at)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Stat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-cream-50 px-4 py-5 text-center shadow-soft">
      <div className="text-2xl" aria-hidden>
        {emoji}
      </div>
      <div className="mt-1.5 font-display text-2xl font-bold text-forest-900">{value}</div>
      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-forest-900/45">
        {label}
      </div>
    </div>
  );
}

function emojiFor(type: string): string {
  switch (type) {
    case "verified":
      return "🆔";
    case "achievement":
      return "🏆";
    case "planted":
      return "🌱";
    case "sponsored":
      return "💚";
    default:
      return "🌳";
  }
}

async function loadForest(userId: string) {
  try {
    const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
    const [treesRes, achievementsRes, activityRes, paymentsRes] = await Promise.all([
      supabase
        .from("trees")
        .select("*")
        .eq("sponsor_id", userId)
        .neq("status", "failed")
        .order("created_at", { ascending: false }),
      supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false }),
      supabase
        .from("activity")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("payments")
        .select("amount, created_at, description")
        .eq("user_id", userId)
        .eq("status", "succeeded"),
    ]);
    return {
      trees: (treesRes.data ?? []) as TreeRecord[],
      achievements: (achievementsRes.data ?? []) as Achievement[],
      activity: (activityRes.data ?? []) as ActivityItem[],
      payments: (paymentsRes.data ?? []) as Payment[],
      hasSupabase: true,
    };
  } catch {
    return { trees: [], achievements: [], activity: [], payments: [], hasSupabase: false };
  }
}