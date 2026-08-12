import { Reveal } from "@/components/reveal";

const JOURNEY = [
  { emoji: "💳", label: "Your contribution" },
  { emoji: "🌱", label: "Nursery / sapling source" },
  { emoji: "🧑‍🌾", label: "Planter" },
  { emoji: "🪴", label: "Planting" },
  { emoji: "✅", label: "Verification" },
  { emoji: "🔧", label: "Maintenance" },
  { emoji: "🌳", label: "Growth" },
];

export function Transparency() {
  return (
    <section className="bg-cream-gradient py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
              Transparency
            </p>
            <h2 className="text-4xl font-bold leading-tight text-forest-950 md:text-5xl">
              Where your tree goes
            </h2>
            <blockquote className="mt-6 border-l-4 border-forest-400 pl-5 text-xl font-medium text-forest-800">
              “You should be able to see what happened to the tree you helped create.”
            </blockquote>
            <p className="mt-6 text-base leading-relaxed text-forest-900/70">
              TRIKO is not “give us money and trees will appear.” It&apos;s a platform that
              connects people, planters, and real trees — and shows the full chain: from your
              contribution to nursery, planter, planting, proof, verification, maintenance,
              and growth.
            </p>
            <p className="mt-4 text-sm text-forest-900/55">
              Environmental impact figures are only shown as clearly-labeled estimates with a
              documented methodology — never exact carbon claims.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative rounded-[2.5rem] border border-forest-900/10 bg-cream-50 p-8 shadow-lift">
              <div className="tree-ring absolute inset-0 rounded-[2.5rem]" aria-hidden />
              <ol className="relative space-y-3">
                {JOURNEY.map((step, i) => (
                  <li key={step.label} className="flex items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest-100 text-2xl">
                      {step.emoji}
                    </div>
                    <div className="flex flex-1 items-center">
                      <span className="font-display text-base font-semibold text-forest-900">
                        {step.label}
                      </span>
                    </div>
                    {i < JOURNEY.length - 1 && (
                      <span className="text-lg text-forest-400" aria-hidden>
                        ↓
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}