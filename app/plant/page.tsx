import type { Metadata } from "next";
import { PlantWizard } from "@/components/plant-wizard";
import { getSpeciesList } from "@/lib/server-data";

export const metadata: Metadata = { title: "Plant a tree" };

export default async function PlantPage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string; order?: string }>;
}) {
  const { species: slug, order } = await searchParams;
  const species = await getSpeciesList();
  return (
    <section className="bg-cream-gradient min-h-screen">
      <PlantWizard
        initialSpeciesSlug={typeof slug === "string" ? slug : undefined}
        orderId={typeof order === "string" ? order : undefined}
        species={species}
      />
    </section>
  );
}