"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { useSession } from "@/components/session-provider";
import { Button, Card } from "@/components/ui";
import { pricingBreakdown, REGIONS, regionById } from "@/lib/constants";
import { plantTree } from "@/lib/client-service";
import { cn, formatINR } from "@/lib/utils";
import type { Species } from "@/lib/types";

const STEP_LABELS = ["Choose tree", "Choose location", "Plant / Sponsor"];

export function PlantWizard({ initialSpeciesSlug, species }: { initialSpeciesSlug?: string; species: Species[] }) {
  const router = useRouter();
  const { user, profile } = useSession();

  const [step, setStep] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSpeciesSlug ?? null);
  const [region, setRegion] = useState<string>(species[0]?.suitable_regions?.[0] ?? "madurai");
  const [mode, setMode] = useState<"sponsor" | "myself">("sponsor");
  const [customName, setCustomName] = useState("");
  const [dedication, setDedication] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ treeId: string; label: string } | null>(null);

  const selected = species.find((s) => s.slug === selectedSlug) ?? null;
  const pricing = selected ? pricingBreakdown(selected) : null;

  const availableRegions = selected
    ? REGIONS.filter((r) => (selected.suitable_regions ?? []).includes(r.id))
    : REGIONS;

  function pickSpecies(s: Species) {
    setSelectedSlug(s.slug);
    const first = s.suitable_regions?.[0];
    if (first) setRegion(first);
  }

  async function confirm() {
    if (!selected || !user) {
      router.push("/login?next=/plant");
      return;
    }
    if (!supabaseConfigured()) {
      setError("Supabase is not configured yet — check .env.local.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      await new Promise((r) => setTimeout(r, 900)); // realistic demo checkout feel
      const result = await plantTree(supabase, {
        species: selected,
        region,
        customName,
        dedication,
        planterMyself: mode === "myself",
      });
      setSuccess(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  /* ---------------- SUCCESS --------------- */
  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="grow-pop text-7xl" aria-hidden>
          🌳
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold text-forest-950 md:text-5xl">
          Your tree is ready
        </h1>
        <p className="mt-3 text-lg text-forest-900/70">
          {selected?.name} · {regionById(region)?.label} · {success.label}
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-3xl border border-forest-900/10 bg-cream-50 p-8 shadow-lift">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
            Tree ID
          </p>
          <p className="mt-2 font-mono text-3xl font-bold text-forest-900">
            {success.treeId}
          </p>
          <p className="mt-3 text-sm text-forest-900/60">
            {mode === "sponsor" ? (
              <>
                This tree is now <strong>funded 🟡</strong>. A verified planter in your
                chosen region can accept the mission — you&apos;ll get proof when it&apos;s
                planted.
              </>
            ) : (
              <>
                You&apos;re the planter for this tree (🔵 accepted). Complete your mission
                and upload proof to get it verified.
              </>
            )}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`/tree/${success.treeId}`}>
              <Button>🌳 View tree</Button>
            </Link>
            <Link href="/forest">
              <Button variant="outline">See my forest</Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost">Plant another</Button>
            </Link>
          </div>
          <p className="mt-6 border-t border-forest-900/10 pt-4 text-[11px] text-forest-900/40">
            Demo mode — no real money was moved. This is a demo payment record.
          </p>
        </div>

        <button
          onClick={() => {
            setSuccess(null);
            setStep(0);
            setSelectedSlug(null);
          }}
          className="mt-6 text-sm font-medium text-forest-600 hover:underline"
        >
          Start a new tree
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* stepper */}
      <div className="mx-auto mb-10 max-w-xl">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border text-sm font-bold transition-colors",
                    i < step
                      ? "border-forest-600 bg-forest-600 text-cream-50"
                      : i === step
                        ? "border-forest-600 bg-forest-50 text-forest-700"
                        : "border-forest-900/20 text-forest-900/40"
                  )}
                >
                  {i + 1}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    i === step ? "text-forest-700" : "text-forest-900/40"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className="mx-3 h-px flex-1 bg-forest-900/15" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1 — choose tree */}
      {step === 0 && (
        <div>
          <h1 className="text-center font-display text-3xl font-bold text-forest-950 md:text-4xl">
            Choose a real tree
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-forest-900/60">
            Every species on TRIKO is native or region-appropriate. Pick one that fits
            where you want it planted.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {species.map((s) => (
              <button
                key={s.slug}
                onClick={() => pickSpecies(s)}
                className={cn(
                  "group rounded-3xl border-2 bg-cream-50 p-4 text-left shadow-soft transition-all hover:-translate-y-1",
                  selectedSlug === s.slug
                    ? "border-forest-600 ring-4 ring-forest-600/20"
                    : "border-transparent"
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-forest-100">
                  {s.image_url && (
                    <Image
                      src={s.image_url}
                      alt={s.name}
                      fill
                      sizes="(max-width: 640px) 90vw, 30vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {selectedSlug === s.slug && (
                    <div className="absolute left-2.5 top-2.5 rounded-full bg-forest-600 px-2.5 py-1 text-xs font-bold text-cream-50">
                      Selected
                    </div>
                  )}
                </div>
                <div className="px-1 pb-1 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-forest-950">
                      {s.emoji} {s.name}
                    </h3>
                    <span className="font-display text-lg font-bold text-forest-700">
                      {formatINR(pricingBreakdown(s).total)}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-forest-900/60">{s.description}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button
              size="lg"
              disabled={!selected}
              onClick={() => setStep(1)}
            >
              Continue — choose location →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 — location */}
      {step === 1 && selected && (
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="font-display text-3xl font-bold text-forest-950 md:text-4xl">
              Choose planting region
            </h1>
            <p className="mt-3 text-forest-900/60">
              {selected.name} grows best in these supported regions.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {availableRegions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRegion(r.id)}
                  className={cn(
                    "rounded-2xl border-2 p-4 text-left transition-all",
                    region === r.id
                      ? "border-forest-600 bg-forest-50"
                      : "border-forest-900/10 bg-cream-50 hover:border-forest-300"
                  )}
                >
                  <span className="text-lg" aria-hidden>
                    📍
                  </span>
                  <div className="mt-1 font-semibold text-forest-950">{r.label}</div>
                  <div className="text-sm text-forest-900/50">{r.state}</div>
                </button>
              ))}
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl font-bold text-forest-950">
                How do you want to plant it?
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setMode("sponsor")}
                  className={cn(
                    "rounded-2xl border-2 p-5 text-left transition-all",
                    mode === "sponsor"
                      ? "border-forest-600 bg-forest-50"
                      : "border-forest-900/10 bg-cream-50"
                  )}
                >
                  <div className="text-2xl">🌍</div>
                  <div className="mt-2 font-semibold text-forest-950">
                    Sponsor a planter
                  </div>
                  <p className="mt-1 text-sm text-forest-900/55">
                    A verified local planter accepts and plants it. Best when you can&apos;t
                    be there.
                  </p>
                </button>
                <button
                  onClick={() => setMode("myself")}
                  className={cn(
                    "rounded-2xl border-2 p-5 text-left transition-all",
                    mode === "myself"
                      ? "border-forest-600 bg-forest-50"
                      : "border-forest-900/10 bg-cream-50"
                  )}
                >
                  <div className="text-2xl">🌱</div>
                  <div className="mt-2 font-semibold text-forest-950">Plant it myself</div>
                  <p className="mt-1 text-sm text-forest-900/55">
                    You become the planter. Plant, then submit photo + location proof to
                    verify.
                  </p>
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-forest-900">
                  Name your tree (optional)
                </span>
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={`e.g. ${profile?.full_name?.split(" ")[0] ?? "My"}'s ${selected.name}`}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-forest-900">
                  Dedication (optional)
                </span>
                <input
                  value={dedication}
                  onChange={(e) => setDedication(e.target.value)}
                  placeholder="For someone you love…"
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          {/* summary */}
          <div>
            <Card className="sticky top-24 p-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden>
                  {selected.emoji}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-forest-950">
                    {customName || selected.name}
                  </h3>
                  <p className="text-sm text-forest-900/50">{selected.scientific_name}</p>
                </div>
              </div>

              <dl className="mt-5 space-y-2.5 border-t border-forest-900/10 pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-forest-900/60">Tree + planting</dt>
                  <dd className="font-semibold">{formatINR(pricing!.plantingCost)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-forest-900/60">Verification / platform</dt>
                  <dd className="font-semibold">{formatINR(pricing!.verificationFee)}</dd>
                </div>
                <div className="flex justify-between border-t border-forest-900/10 pt-2.5">
                  <dt className="font-bold text-forest-950">Total</dt>
                  <dd className="font-display text-lg font-bold text-forest-700">
                    {formatINR(pricing!.total)}
                  </dd>
                </div>
                <div className="flex justify-between text-forest-900/50">
                  <dt>Planter payout</dt>
                  <dd>{formatINR(pricing!.planterPayout)}</dd>
                </div>
              </dl>

              <div className="mt-3 rounded-2xl bg-forest-950 px-4 py-3 text-xs text-cream-200/80">
                💳 <strong>Demo payment.</strong> No real money moves in this MVP. Fees are
                configurable by admins.
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <Button variant="ghost" size="lg" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  loading={busy}
                  disabled={!user}
                  onClick={() => confirm()}
                >
                  {busy ? "Placing order…" : "🌱 Plant this tree"}
                </Button>
              </div>
              {!user && (
                <p className="mt-3 text-center text-xs text-forest-900/50">
                  <Link href={`/login?next=%2Fplant`} className="font-semibold text-forest-600 hover:underline">
                    Log in
                  </Link>{" "}
                  or{" "}
                  <Link href="/signup" className="font-semibold text-forest-600 hover:underline">
                    create an account
                  </Link>{" "}
                  to continue.
                </p>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-forest-900/15 bg-cream px-4 py-3 text-forest-950 placeholder:text-forest-900/35 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30";