"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_IMPACT, type ImpactStats } from "@/lib/constants";

function CountUp({ target, started }: { target: number; started: boolean }) {
  const [value, setValue] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!started) return;
    const t0 = performance.now();
    const duration = 1500;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [started, target]);

  return <>{value.toLocaleString("en-IN")}</>;
}

const ITEMS: Array<{ key: keyof ImpactStats; emoji: string; label: string }> = [
  { key: "trees_planted", emoji: "🌳", label: "Trees planted" },
  { key: "currently_growing", emoji: "🌱", label: "Currently growing" },
  { key: "active_planters", emoji: "🌍", label: "Active planters" },
  { key: "locations", emoji: "📍", label: "Locations" },
];

export function ImpactCounters({
  stats,
  live = false,
  className,
}: {
  stats?: ImpactStats;
  live?: boolean;
  className?: string;
}) {
  const data = stats ?? DEFAULT_IMPACT;
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {ITEMS.map((item) => (
          <div
            key={item.key}
            className="rounded-3xl border border-forest-900/10 bg-cream-50 px-5 py-6 text-center shadow-soft"
          >
            <div className="text-2xl" aria-hidden>
              {item.emoji}
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-forest-900 md:text-4xl">
              <CountUp target={data[item.key]} started={started} />
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-forest-900/50">
              {item.label}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-forest-900/40">
        {live
          ? "Live figures from the TRIKO database."
          : "Sample figures — counts connect to the database as trees get verified."}
      </p>
    </div>
  );
}