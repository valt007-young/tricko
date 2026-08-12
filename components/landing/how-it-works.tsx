import { Reveal } from "@/components/reveal";

const STEPS = [
  { n: "01", emoji: "🧐", title: "Choose", body: "Pick a real tree species suited to a real region." },
  { n: "02", emoji: "🌱", title: "Plant or Sponsor", body: "Plant it yourself, or fund a planting mission." },
  { n: "03", emoji: "🤝", title: "A Planter Accepts", body: "A verified local planter accepts available missions." },
  { n: "04", emoji: "🪴", title: "Real Tree Gets Planted", body: "The planter physically puts the tree in the ground." },
  { n: "05", emoji: "📸", title: "Proof", body: "Photos, video and location information are submitted." },
  { n: "06", emoji: "✅", title: "Verification", body: "TRIKO reviews the proof. Auto-checks + human review." },
  { n: "07", emoji: "🆔", title: "Tree ID", body: "The tree receives a permanent unique TRIKO Tree ID." },
  { n: "08", emoji: "📈", title: "Grow", body: "The tree receives growth and maintenance updates." },
  { n: "09", emoji: "🌳", title: "Your Forest", body: "The tree appears inside your personal forest." },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-cream-gradient py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
            How TRIKO works
          </p>
          <h2 className="text-4xl font-bold leading-tight text-forest-950 md:text-5xl">
            From a tap to a tree with roots in real soil
          </h2>
          <p className="mt-5 text-lg text-forest-900/70">
            Every tree follows a visible, verifiable journey. You can see what happened —
            not just trust that it did.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 max-w-3xl">
          <ol className="relative space-y-4 border-l-2 border-forest-300/50 pl-8 sm:pl-10">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} as="li" delay={i * 40}>
                <div className="relative flex gap-4 rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft sm:gap-6">
                  <span
                    className="absolute -left-[41px] grid h-8 w-8 place-items-center rounded-full border-2 border-forest-300 bg-cream text-sm font-bold text-forest-700 sm:-left-[49px]"
                    aria-hidden
                  >
                    {step.n}
                  </span>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest-100 text-2xl">
                    {step.emoji}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-forest-950">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-forest-900/70">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}