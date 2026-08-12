import Link from "next/link";
import { Button } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { ImpactCounters } from "@/components/counters";
import { HeroForest } from "@/components/hero-forest";
import { SpeciesCard } from "@/components/species-card";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Roles } from "@/components/landing/roles";
import { Transparency } from "@/components/landing/transparency";
import { getLiveStats, getSpeciesList } from "@/lib/server-data";
import { AUGUST_CHALLENGE, APP_TAGLINE } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

export default async function LandingPage() {
  const [species, stats] = await Promise.all([getSpeciesList(), getLiveStats()]);
  const preview = species.slice(0, 3);
  const challengePct = Math.round((AUGUST_CHALLENGE.current / AUGUST_CHALLENGE.goal) * 100);

  return (
    <>
      {/* ------------------------------------------------------------ */}
      {/* HERO                                                         */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-forest-dark relative overflow-hidden text-cream-50">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-0 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-24">
          <div className="relative z-10">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-cream-50/20 bg-cream-50/10 px-4 py-1.5 text-xs font-medium tracking-wide text-cream-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-moss-lime" />
                Your next tree starts here
              </p>
              <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Create your own
                <br />
                source of <span className="text-moss-lime">O₂</span>.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream-200/85">
                Plant real trees. Track their growth. Build your forest. TRIKO connects you
                to verified planters, real soil, and a permanent tree ID for every tree.
              </p>
            </Reveal>
            <Reveal delay={150}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/plant">
                  <Button size="lg" className="text-base">
                    🌱 Plant a Tree
                  </Button>
                </Link>
                <Link href="/map">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-cream-50/25 text-cream-50 hover:bg-cream-50/10"
                  >
                    🌍 Explore the Forest
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-cream-200/55">
                Sponsor from {formatINR(species[0]?.planting_cost ?? 800)} · Demo payments ·
                No unsupported carbon claims
              </p>
            </Reveal>
          </div>

          <div className="relative">
            <HeroForest />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* IMPACT COUNTERS                                              */}
      {/* ------------------------------------------------------------ */}
      <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
        <ImpactCounters stats={stats ?? undefined} live={Boolean(stats)} className="mx-auto max-w-6xl" />
      </section>

      {/* ------------------------------------------------------------ */}
      {/* HOW IT WORKS                                                 */}
      {/* ------------------------------------------------------------ */}
      <HowItWorks />

      {/* ------------------------------------------------------------ */}
      {/* SPECIES PREVIEW                                              */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
                The marketplace
              </p>
              <h2 className="text-4xl font-bold leading-tight text-forest-950 md:text-5xl">
                Choose your tree
              </h2>
              <p className="mt-4 max-w-xl text-lg text-forest-900/70">
                Native, region-appropriate species with transparent pricing — what you pay,
                what the planter receives, and what the platform fee covers.
              </p>
            </div>
            <Link href="/explore">
              <Button variant="outline" size="lg">
                Explore all species →
              </Button>
            </Link>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {preview.map((species, i) => (
              <Reveal key={species.slug} delay={i * 80}>
                <SpeciesCard species={species} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* ROLES                                                        */}
      {/* ------------------------------------------------------------ */}
      <Roles />

      {/* ------------------------------------------------------------ */}
      {/* TRANSPARENCY                                                 */}
      {/* ------------------------------------------------------------ */}
      <Transparency />

      {/* ------------------------------------------------------------ */}
      {/* CHALLENGE / FINAL CTA                                        */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl overflow-hidden rounded-[2.5rem] bg-forest-dark p-10 text-center text-cream-50 shadow-lift md:p-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-300">
              Community challenge
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              {AUGUST_CHALLENGE.label}
            </h2>
            <p className="mt-3 text-cream-200/75">
              Goal: {AUGUST_CHALLENGE.goal.toLocaleString("en-IN")} trees · Current:{" "}
              {AUGUST_CHALLENGE.current.toLocaleString("en-IN")}
            </p>
            <div className="mt-6 overflow-hidden rounded-full bg-forest-900/70">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-forest-400 to-moss-lime transition-all duration-700"
                style={{ width: `${challengePct}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-cream-200/60">{challengePct}% complete</p>

            <div className="mt-9">
              <h3 className="font-display text-2xl font-bold md:text-3xl">
                Don&apos;t just plant a tree.
                <br />
                <span className="text-moss-lime">Grow a forest.</span>
              </h3>
              <p className="mx-auto mt-4 max-w-md text-cream-200/75">{APP_TAGLINE}</p>
              <Link href="/plant" className="mt-8 inline-block">
                <Button size="xl" className="text-lg">
                  🌱 Plant your first tree
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}