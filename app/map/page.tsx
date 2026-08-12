import type { Metadata } from "next";
import { ForestMap, type MapTree } from "@/components/forest-map";
import { SectionHeading } from "@/components/ui";
import { EmptyState } from "@/components/ui";
import { getVerifiedTrees } from "@/lib/server-data";
import { regionById } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Explore the forest" };

export default async function MapPage() {
  const rows = await getVerifiedTrees();
  const trees: MapTree[] = (rows ?? [])
    .filter((t) => t.lat != null && t.lng != null)
    .map((t) => ({
      treeId: t.tree_id,
      species: t.species_name,
      region: regionById(t.region)?.label ?? t.region,
      lat: t.lat as number,
      lng: t.lng as number,
      plantedAt: formatDate(t.planted_at || t.created_at),
      status: t.status,
      photo: t.species_image,
      customName: t.custom_name,
    }));

  return (
    <section className="bg-cream-gradient min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The living map"
          title="🌍 Explore the forest"
          lead="Every verified tree on TRIKO has a permanent ID and a place on this map. Filter by species or region, then tap a marker to open the tree's page."
        />

        <div className="mt-10">
          {trees.length === 0 ? (
            <EmptyState
              emoji="🗺️"
              title="No verified trees on the map yet"
              body="Verified trees appear here with their exact, permanent Tree ID."
            />
          ) : (
            <ForestMap trees={trees} />
          )}
        </div>
      </div>
    </section>
  );
}