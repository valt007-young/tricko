export function StatCard({
  label,
  value,
  emoji,
  highlight,
}: {
  label: string;
  value: string;
  emoji: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border px-5 py-6 text-center shadow-soft ${highlight ? "border-forest-600 bg-forest-700 text-cream-50" : "border-forest-900/10 bg-cream-50"}`}
    >
      <div className="text-2xl" aria-hidden>
        {emoji}
      </div>
      <div className="mt-1.5 font-display text-2xl font-bold">{value}</div>
      <div
        className={`mt-0.5 text-[11px] font-medium uppercase tracking-wide ${highlight ? "text-cream-200/70" : "text-forest-900/45"}`}
      >
        {label}
      </div>
    </div>
  );
}