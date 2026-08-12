import { cn } from "@/lib/utils";
import { SURVIVAL_META, SURVIVAL_STATUSES, TREE_STATUSES, TREE_STATUS_META } from "@/lib/constants";
import type { SurvivalStatus, TreeStatus } from "@/lib/constants";

export function StatusBadge({
  status,
  className,
}: {
  status: TreeStatus;
  className?: string;
}) {
  const meta = TREE_STATUS_META[status] ?? TREE_STATUS_META.funded;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        meta.color,
        className
      )}
    >
      <span aria-hidden>{meta.dot}</span>
      {meta.label}
    </span>
  );
}

export function SurvivalBadge({ status }: { status: SurvivalStatus | null }) {
  if (!status) return null;
  const meta = SURVIVAL_META[status] ?? SURVIVAL_META.growing;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", meta.color)}>
      <span aria-hidden>{meta.dot}</span>
      {meta.label}
    </span>
  );
}

export function statusOptions() {
  return TREE_STATUSES.map((s) => ({ value: s, ...TREE_STATUS_META[s] }));
}

export function survivalOptions() {
  return SURVIVAL_STATUSES.map((s) => ({ value: s, ...SURVIVAL_META[s] }));
}