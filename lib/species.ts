import type { Species } from "./types";

/* ------------------------------------------------------------------ */
/*  Species catalog — source of truth for the seed + UI fallbacks.     */
/*  Planting price, verification fee and planter payout are           */
/*  configurable (per species + platform) on purpose.                  */
/* ------------------------------------------------------------------ */

export const SPECIES_CATALOG: Species[] = [
  {
    id: 1,
    slug: "neem",
    name: "Neem",
    scientific_name: "Azadirachta indica",
    description:
      "A hardy native tree that thrives in hot, dry Indian climates. Tolerant, low-maintenance, and long-lived — a favourite for roadside and community plantings.",
    image_url:
      "https://images.unsplash.com/photo-1589025744528-4b36fdd5ed5d?auto=format&fit=crop&w=1200&q=80",
    suitable_regions: ["madurai", "coimbatore", "bangalore", "ahmedabad", "jaipur", "delhi"],
    care_notes:
      "Water weekly for the first 2 months, then seasonally. Clear weeds in a 1 m radius. Needs full sun.",
    planting_cost: 800,
    verification_fee: 100,
    planter_payout: 700,
    availability: true,
    emoji: "🌳",
    native_to: "Indian subcontinent",
  },
  {
    id: 2,
    slug: "mango",
    name: "Mango",
    scientific_name: "Mangifera indica",
    description:
      "Beloved across India — a fruit + shade tree in one. Grows well in tropical to subtropical regions with rich, well-drained soil.",
    image_url:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80",
    suitable_regions: ["madurai", "coimbatore", "bangalore", "mysore", "kerala", "pune"],
    care_notes:
      "Regular watering while young, then only in dry spells. Prune in the first 2–3 years to shape a strong canopy.",
    planting_cost: 900,
    verification_fee: 100,
    planter_payout: 800,
    availability: true,
    emoji: "🥭",
    native_to: "South Asia",
  },
  {
    id: 3,
    slug: "banyan",
    name: "Banyan",
    scientific_name: "Ficus benghalensis",
    description:
      "The national tree of India and a living ecosystem — its canopy shelters birds and its roots anchor riverbanks. Planted in open ground where it has room to spread.",
    image_url:
      "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1200&q=80",
    suitable_regions: ["madurai", "bangalore", "kerala", "delhi", "nagpur", "ahmedabad"],
    care_notes:
      "Needs open space for its future canopy. Water young trees weekly. Avoid planting under power lines or against buildings.",
    planting_cost: 850,
    verification_fee: 100,
    planter_payout: 750,
    availability: true,
    emoji: "🌳",
    native_to: "Indian subcontinent",
  },
  {
    id: 4,
    slug: "peepal",
    name: "Peepal",
    scientific_name: "Ficus religiosa",
    description:
      "A culturally significant native tree with heart-shaped leaves that flutter in the breeze. Excellent shade and bird habitat.",
    image_url:
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80",
    suitable_regions: ["madurai", "jaipur", "delhi", "mysore", "pune", "kerala"],
    care_notes:
      "Fast-growing; water regularly in the first season. Roots are strong — plant away from paved areas and foundations.",
    planting_cost: 780,
    verification_fee: 100,
    planter_payout: 680,
    availability: true,
    emoji: "🌳",
    native_to: "Indian subcontinent",
  },
  {
    id: 5,
    slug: "sheesham",
    name: "Indian Rosewood (Sheesham)",
    scientific_name: "Dalbergia sissoo",
    description:
      "A sturdy timber tree suited to farm boundaries and river plains. Dense shade and strong wood make it a planter favourite.",
    image_url:
      "https://images.unsplash.com/photo-1503431128871-cd250803fa41?auto=format&fit=crop&w=1200&q=80",
    suitable_regions: ["delhi", "jaipur", "nagpur", "pune", "bangalore"],
    care_notes:
      "Prefers sandy-loam soil. Needs good watering during the first two dry seasons.",
    planting_cost: 820,
    verification_fee: 100,
    planter_payout: 720,
    availability: true,
    emoji: "🌲",
    native_to: "South Asia",
  },
  {
    id: 6,
    slug: "golden-shower",
    name: "Golden Shower (Amaltas)",
    scientific_name: "Cassia fistula",
    description:
      "A signature Indian flowering tree — cascades of golden blooms every summer. Pollinator-friendly and drought tolerant once established.",
    image_url:
      "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1200&q=80",
    suitable_regions: ["madurai", "coimbatore", "ahmedabad", "jaipur", "kerala"],
    care_notes:
      "Drought tolerant but wants full sun. Trim for shape in late winter.",
    planting_cost: 760,
    verification_fee: 100,
    planter_payout: 660,
    availability: true,
    emoji: "🌼",
    native_to: "Indian subcontinent",
  },
];

export function speciesBySlug(slug: string): Species | undefined {
  return SPECIES_CATALOG.find((s) => s.slug === slug);
}

export function speciesById(id: number): Species | undefined {
  return SPECIES_CATALOG.find((s) => s.id === id);
}