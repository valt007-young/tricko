import Link from "next/link";
import Image from "next/image";
import { StatusBadge, SurvivalBadge } from "./status-badge";
import { Badge, Button } from "./ui";
import { formatDate } from "@/lib/utils";
import type { TreeRecord } from "@/lib/types";

export function TreeCard({ tree }: { tree: TreeRecord }) {
  const latestPhoto = tree.species_image;
  const verified = tree.status === "verified";

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-forest-900/10 bg-cream-50 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-forest-100">
        {latestPhoto ? (
          <Image
            src={latestPhoto}
            alt={tree.species_name}
            fill
            sizes="(max-width: 640px) 90vw, 30vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-6xl">
            {tree.species_emoji ?? "🌳"}
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={tree.status} />
        </div>
        {verified && (
          <div className="absolute right-3 top-3 rounded-full bg-forest-950/60 px-2.5 py-0.5 text-[11px] font-medium text-cream-50 backdrop-blur">
            🆔 {tree.tree_id}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold text-forest-950">
          {tree.custom_name || tree.species_name}
        </h3>
        <p className="text-sm italic text-forest-900/45">{tree.species_name}</p>

        <dl className="mt-4 space-y-1.5 text-sm text-forest-900/70">
          <div className="flex justify-between gap-2">
            <dt>📍 Location</dt>
            <dd className="text-right font-medium">{tree.location_label || tree.region}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>📅 Planted</dt>
            <dd className="font-medium">{formatDate(tree.planted_at || tree.created_at)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Status</dt>
            <dd>
              <SurvivalBadge status={tree.survival_status} />
              {!tree.survival_status && tree.status !== "verified" && <span className="text-forest-900/40">—</span>}
            </dd>
          </div>
        </dl>

        {tree.dedication && (
          <p className="mt-3 rounded-2xl bg-forest-50 px-3.5 py-2.5 text-sm italic text-forest-800">
            “{tree.dedication}”
          </p>
        )}

        <div className="mt-auto pt-5">
          {verified ? (
            <Link href={`/tree/${tree.tree_id}`}>
              <Button variant="outline" className="w-full">
                VIEW TREE
              </Button>
            </Link>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-forest-100 text-forest-700">
                🆔 {tree.tree_id}
              </Badge>
              <span className="text-xs text-forest-900/45">Wait for verification</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}