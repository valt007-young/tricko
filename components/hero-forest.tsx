"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TreeSpec {
  left: number; // %
  scale: number;
  depth: "back" | "mid" | "front";
  shade: number; // hue shift toward deep forest
  kind: number; // 0..2 canopy shape
}

/* Deterministic layout — stable across server + client renders. */
const TREES: TreeSpec[] = [
  { left: 2, scale: 0.55, depth: "back", shade: 0, kind: 0 },
  { left: 9, scale: 0.75, depth: "mid", shade: 1, kind: 1 },
  { left: 15, scale: 0.5, depth: "back", shade: 2, kind: 2 },
  { left: 23, scale: 0.9, depth: "front", shade: 0, kind: 0 },
  { left: 30, scale: 0.6, depth: "mid", shade: 1, kind: 2 },
  { left: 37, scale: 0.5, depth: "back", shade: 2, kind: 1 },
  { left: 44, scale: 0.82, depth: "mid", shade: 0, kind: 1 },
  { left: 51, scale: 0.6, depth: "back", shade: 1, kind: 0 },
  { left: 58, scale: 1, depth: "front", shade: 2, kind: 2 },
  { left: 65, scale: 0.55, depth: "mid", shade: 0, kind: 1 },
  { left: 72, scale: 0.7, depth: "back", shade: 2, kind: 0 },
  { left: 79, scale: 0.95, depth: "front", shade: 1, kind: 1 },
  { left: 86, scale: 0.6, depth: "mid", shade: 0, kind: 2 },
  { left: 93, scale: 0.55, depth: "back", shade: 1, kind: 0 },
  { left: 98, scale: 0.8, depth: "mid", shade: 2, kind: 1 },
];

const DEPTH_OPACITY = { back: 0.5, mid: 0.75, front: 1 } as const;
const DEPTH_SIZE = { back: 110, mid: 150, front: 200 } as const;

function Tree({ left, scale, depth, shade, kind }: TreeSpec) {
  const w = DEPTH_SIZE[depth] * scale;
  return (
    <svg
      viewBox="0 0 100 120"
      width={w}
      height={w * 1.2}
      className={cn("sway absolute bottom-0", shade === 1 && "hue-rotate-15", shade === 2 && "hue-rotate-30")}
      style={{ left: `${left}%`, opacity: DEPTH_OPACITY[depth] }}
      aria-hidden
    >
      <line x1="50" y1="118" x2="50" y2="52" stroke="rgba(107,74,50,0.9)" strokeWidth="7" strokeLinecap="round" />
      {(kind === 1 || kind === 2) && (
        <>
          <line x1="50" y1="90" x2="34" y2="72" stroke="rgba(107,74,50,0.85)" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="78" x2="66" y2="60" stroke="rgba(107,74,50,0.85)" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {kind !== 2 ? (
        <g>
          <circle cx="35" cy="46" r="22" fill={kind === 0 ? "#2f6b4a" : "#41875f"} />
          <circle cx="65" cy="40" r="26" fill={kind === 0 ? "#3d7f55" : "#2f6b4a"} />
          <circle cx="50" cy={kind === 0 ? 20 : 34} r="24" fill={kind === 0 ? "#41875f" : "#3d7f55"} />
          <circle cx="50" cy="58" r="18" fill="#27563e" opacity="0.85" />
        </g>
      ) : (
        <g>
          <ellipse cx="50" cy="34" rx="34" ry="24" fill="#2f6b4a" />
          <ellipse cx="50" cy="52" rx="28" ry="20" fill="#3d7f55" />
          <ellipse cx="50" cy="68" rx="20" ry="15" fill="#27563e" />
        </g>
      )}
    </svg>
  );
}

export function HeroForest({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const top = Math.min(1, Math.max(0, (vh - rect.top) / rect.height));
        setProgress(top);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const visible = (depth: TreeSpec["depth"]) => {
    if (depth === "back") return progress > 0.08 ? 1 : progress > 0 ? 0.4 : 0;
    if (depth === "mid") return progress > 0.24 ? 1 : progress > 0.12 ? 0.5 : 0;
    return progress > 0.45 ? 1 : progress > 0.3 ? 0.6 : 0;
  };

  return (
    <div ref={ref} className={cn("relative h-[420px] w-full overflow-hidden sm:h-[520px]", className)} aria-hidden>
      {/* sun */}
      <div
        className="absolute right-[12%] top-10 h-24 w-24 rounded-full bg-sun-400/90 blur-[2px] transition-opacity duration-700"
        style={{ opacity: progress > 0.05 ? 0.9 : 0.3 }}
      />
      <div className="absolute right-[12%] top-10 h-32 w-32 rounded-full bg-sun-400/20 blur-xl" />

      {/* distant hills */}
      <div
        className="absolute bottom-20 left-[-5%] right-[-5%] h-28 rounded-[100%_0%_0%_0%] bg-forest-800/70 transition-opacity duration-700"
        style={{ opacity: visible("back") }}
      />

      {/* trees */}
      {TREES.map((tree, i) => (
        <div
          key={i}
          className="absolute bottom-0 transition-opacity duration-700 ease-out"
          style={{ opacity: visible(tree.depth) * DEPTH_OPACITY[tree.depth] }}
        >
          <Tree {...tree} />
        </div>
      ))}

      {/* ground */}
      <div
        className="absolute bottom-0 left-[-5%] right-[-5%] h-16 rounded-[50%_50%_0_0/80%_80%_0_0] bg-forest-700 transition-opacity duration-700"
        style={{ opacity: progress > 0.06 ? 1 : 0.5 }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-forest-800" />
    </div>
  );
}