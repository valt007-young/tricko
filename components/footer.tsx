import Link from "next/link";
import { Logo } from "./logo";
import { DEMO_MODE } from "@/lib/constants";

const footerLinks = [
  { label: "Explore trees", href: "/explore" },
  { label: "Explore the forest map", href: "/map" },
  { label: "Plant a tree", href: "/plant" },
  { label: "Become a planter", href: "/signup?role=planter" },
];

export function Footer() {
  return (
    <footer className="border-t border-forest-900/10 bg-forest-950 text-cream-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-200/70">
            Don&apos;t just plant a tree. Grow a forest.
            <br />
            Connecting people, planters, and real trees — with proof, verification, and a
            tree ID that lasts.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-forest-300">
            Explore
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-cream-200/70 transition-colors hover:text-cream-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-forest-300">
            Trust & transparency
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-cream-200/70">
            A tree is only marked as planted after proof is submitted and reviewed. Tree
            IDs are permanent and never reused.{" "}
            {DEMO_MODE
              ? "Payments in this demo are simulated — no money changes hands."
              : "Payments are processed securely via Cashfree."}
          </p>
        </div>
      </div>
      <div className="border-t border-cream-50/10 py-6 text-center text-xs text-cream-200/50">
        © {new Date().getFullYear()} TRIKO. A digital record of real trees — not an NFT or
        cryptocurrency asset.
      </div>
    </footer>
  );
}