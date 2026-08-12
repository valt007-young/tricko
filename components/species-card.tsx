import Link from "next/link";
import Image from "next/image";
import type { Species } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { regionById } from "@/lib/constants";
import { Badge } from "./ui";

export function SpeciesCard({ species, index }: { species: Species; index?: number }) {
  const topRegions = (species.suitable_regions ?? []).slice(0, 3);
  const fallbackLabel = species.emoji || "🌳";
  return (
    <Link
      href={`/plant?species=${species.slug}`}
      className="group relative block rounded-3xl border border-forest-900/10 bg-cream-50 p-3 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-forest-100">
        {species.image_url ? (
          <Image
            src={species.image_url}
            alt={species.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-6xl">{fallbackLabel}</div>
        )}
        <div className="absolute right-2.5 top-2.5 rounded-full bg-forest-950/60 px-2.5 py-1 text-xs font-medium text-cream-50 backdrop-blur">
          {species.availability ? "In stock" : "Unavailable"}
        </div>
      </div>

      <div className="px-2 pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl font-bold text-forest-950">
            {species.emoji} {species.name}
          </h3>
          <div className="whitespace-nowrap text-right">
            <div className="font-display text-lg font-bold text-forest-700">
              {formatINR(species.planting_cost)}
            </div>
            <div className="text-[11px] text-forest-900/40">+{formatINR(species.verification_fee)} fees</div>
          </div>
        </div>

        <p className="mt-2 text-sm italic text-forest-900/50">{species.scientific_name}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-forest-900/70">
          {species.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {topRegions.map((regionId) => {
            const region = regionById(regionId);
            return region ? (
              <Badge key={regionId} className="bg-forest-50 text-forest-700">
                📍 {region.label}
              </Badge>
            ) : null;
          })}
          {index !== undefined && (
            <Badge className="bg-forest-600 text-cream-50">#{String(index + 1).padStart(2, "0")}</Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-forest-600 group-hover:underline">
            Plant this tree
          </span>
          <span className="text-forest-300 transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}