import type { Metadata } from "next";
import { getSpeciesList } from "@/lib/server-data";
import { SpeciesCard } from "@/components/species-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Choose your tree" };

export default async function ExplorePage() {
  const species = await getSpeciesList();
  return (
    <section className="bg-cream-gradient py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The marketplace"
          title="🌱 Choose your tree"
          lead="Native and region-appropriate species with transparent pricing — what you pay, what the planter receives, and what the platform fee covers."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {species.map((s, i) => (
            <Reveal key={s.slug} delay={i * 60}>
              <SpeciesCard species={s} index={i} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-6 shadow-soft">
            <h3 className="font-display text-lg font-bold text-forest-950">
              What the price includes
            </h3>
            <div className="mt-4 grid gap-6 text-sm text-forest-900/70 md:grid-cols-3">
              <div>
                <div className="text-2xl">🪴</div>
                <p className="mt-2 font-semibold text-forest-900">Sapling + planting</p>
                <p className="mt-1">
                  A nursery-raised sapling, planted by a verified planter at a suitable
                  site.
                </p>
              </div>
              <div>
                <div className="text-2xl">📸</div>
                <p className="mt-2 font-semibold text-forest-900">Proof + verification</p>
                <p className="mt-1">
                  Photo, video &amp; location proof captured, then reviewed before the tree
                  earns its Tree ID.
                </p>
              </div>
              <div>
                <div className="text-2xl">🔆</div>
                <p className="mt-2 font-semibold text-forest-900">Maintenance updates</p>
                <p className="mt-1">
                  Scheduled growth and maintenance check-ins after planting.
                </p>
              </div>
            </div>
            <p className="mt-5 text-xs text-forest-900/50">
              TRIKO does not make unsupported claims about carbon absorption. Environmental
              estimates, when shown, use a documented methodology and are labeled as
              estimates.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}