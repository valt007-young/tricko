import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Button, Card } from "@/components/ui";

const CHECK = ({ children }: { children: string }) => (
  <li className="flex items-start gap-2 text-sm text-forest-900/75">
    <span className="mt-0.5 text-forest-500">✓</span>
    <span>{children}</span>
  </li>
);

export function Roles() {
  return (
    <section className="bg-forest-950 py-24 text-cream-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-forest-300">
            Two roles, one forest
          </p>
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            People who fund. People who plant.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <Card className="h-full border-forest-700 bg-forest-900/60 p-8 text-cream-50 shadow-lift">
              <div className="text-4xl">🌍</div>
              <h3 className="mt-4 font-display text-2xl font-bold">Sponsor / Tree Owner</h3>
              <p className="mt-2 text-sm text-cream-200/75">
                You don&apos;t need to touch soil. Choose a tree, fund the planting, and follow
                its whole journey.
              </p>
              <ul className="mt-6 space-y-2.5 text-cream-100">
                <CHECK>Choose real tree species and planting regions</CHECK>
                <CHECK>Give your tree a name and a dedication</CHECK>
                <CHECK>Get planting proof and a permanent Tree ID</CHECK>
                <CHECK>Receive growth and maintenance updates</CHECK>
                <CHECK>Grow a personal forest and share it</CHECK>
              </ul>
              <Link href="/signup" className="mt-8 inline-block">
                <Button size="lg">🌱 Start planting</Button>
              </Link>
            </Card>
          </Reveal>

          <Reveal delay={120}>
            <Card className="h-full border-forest-700 bg-forest-900/60 p-8 text-cream-50 shadow-lift">
              <div className="text-4xl">🌱</div>
              <h3 className="mt-4 font-display text-2xl font-bold">Verified Planter</h3>
              <p className="mt-2 text-sm text-cream-200/75">
                Plant trees in your region, get verified, build reputation — and earn from
                useful environmental work.
              </p>
              <ul className="mt-6 space-y-2.5 text-cream-100">
                <CHECK>Create a verified planter profile</CHECK>
                <CHECK>Accept available planting missions near you</CHECK>
                <CHECK>See species, location, and payout up front</CHECK>
                <CHECK>Upload proof and get paid after verification</CHECK>
                <CHECK>Build a rating and unlock more missions</CHECK>
              </ul>
              <Link href="/signup?role=planter" className="mt-8 inline-block">
                <Button size="lg" variant="secondary">
                  🌍 Become a planter
                </Button>
              </Link>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}