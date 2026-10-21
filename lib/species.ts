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
      "https://images.pexels.com/photos/5060587/pexels-photo-5060587.jpeg?auto=compress&cs=tinysrgb&w=1200",
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
      "https://images.pexels.com/photos/7529893/pexels-photo-7529893.jpeg?auto=compress&cs=tinysrgb&w=1200",
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
      "https://images.pexels.com/photos/11008113/pexels-photo-11008113.jpeg?auto=compress&cs=tinysrgb&w=1200",
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
      "https://images.pexels.com/photos/38416538/pexels-photo-38416538.jpeg?auto=compress&cs=tinysrgb&w=1200",
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
      "https://images.pexels.com/photos/20810259/pexels-photo-20810259.jpeg?auto=compress&cs=tinysrgb&w=1200",
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
      "https://images.pexels.com/photos/31242850/pexels-photo-31242850.jpeg?auto=compress&cs=tinysrgb&w=1200",
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
  {
    id: 7,
    slug: "amla",
    name: "Amla (Indian Gooseberry)",
    scientific_name: "Phyllanthus emblica",
    description:
      "A small, sacred fruit tree prized for vitamin-C-rich berries. Hardy, drought tolerant and long-lived — well suited to farm edges and community plots.",
    image_url:
      "https://images.pexels.com/photos/6605582/pexels-photo-6605582.jpeg?auto=compress&cs=tinysrgb&w=1200",
    suitable_regions: ["madurai", "coimbatore", "bangalore", "mysore", "delhi", "jaipur", "pune", "nagpur"],
    care_notes:
      "Prefers full sun and well-drained soil. Water young trees weekly; established trees are drought tolerant.",
    planting_cost: 700,
    verification_fee: 100,
    planter_payout: 600,
    availability: true,
    emoji: "🫐",
    native_to: "Indian subcontinent",
  },
  {
    id: 8,
    slug: "jamun",
    name: "Jamun (Java Plum)",
    scientific_name: "Syzygium cumini",
    description:
      "A majestic fruit and shade tree with dense evergreen canopy. Thrives in tropical and subtropical plains, providing both food and bird habitat.",
    image_url:
      "https://images.pexels.com/photos/10809224/pexels-photo-10809224.jpeg?auto=compress&cs=tinysrgb&w=1200",
    suitable_regions: ["madurai", "coimbatore", "bangalore", "mysore", "kerala", "pune", "nagpur"],
    care_notes:
      "Likes moisture while young. Give it room — the canopy spreads wide. Prune only to remove dead wood.",
    planting_cost: 880,
    verification_fee: 100,
    planter_payout: 780,
    availability: true,
    emoji: "🍇",
    native_to: "Indian subcontinent",
  },
  {
    id: 9,
    slug: "arjun",
    name: "Arjun",
    scientific_name: "Terminalia arjuna",
    description:
      "A stately riverside tree with medicinal bark. Its deep roots stabilise banks and its broad canopy provides generous shade.",
    image_url:
      "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1200",
    suitable_regions: ["madurai", "coimbatore", "bangalore", "mysore", "kerala", "delhi", "nagpur"],
    care_notes:
      "Thrives near water. Water regularly in the first two seasons, then rarely. Needs open ground.",
    planting_cost: 840,
    verification_fee: 100,
    planter_payout: 740,
    availability: true,
    emoji: "🌳",
    native_to: "Indian subcontinent",
  },
  {
    id: 10,
    slug: "gulmohar",
    name: "Gulmohar",
    scientific_name: "Delonix regia",
    description:
      "A show-stopping flowering tree that erupts in scarlet each summer. Fast growing and a favourite for avenues and open spaces.",
    image_url:
      "https://images.pexels.com/photos/1509194/pexels-photo-1509194.jpeg?auto=compress&cs=tinysrgb&w=1200",
    suitable_regions: ["madurai", "coimbatore", "bangalore", "mysore", "kerala", "pune", "ahmedabad"],
    care_notes:
      "Full sun and well-drained soil. Water young trees weekly. Prune to shape a broad, spreading crown.",
    planting_cost: 820,
    verification_fee: 100,
    planter_payout: 720,
    availability: true,
    emoji: "🌺",
    native_to: "Madagascar (naturalised in India)",
  },
  {
    id: 11,
    slug: "tamarind",
    name: "Tamarind",
    scientific_name: "Tamarindus indica",
    description:
      "A long-lived, drought-hardy tree valued for its tangy pods and deep shade. Common along roads, farms and village commons across India.",
    image_url:
      "https://images.pexels.com/photos/2246384/pexels-photo-2246384.jpeg?auto=compress&cs=tinysrgb&w=1200",
    suitable_regions: ["madurai", "coimbatore", "bangalore", "mysore", "delhi", "jaipur", "pune", "nagpur", "ahmedabad"],
    care_notes:
      "Very drought tolerant once established. Water young trees weekly in the first dry season. Give it space.",
    planting_cost: 800,
    verification_fee: 100,
    planter_payout: 700,
    availability: true,
    emoji: "🪴",
    native_to: "Tropical Africa (naturalised in India)",
  },
  {
    id: 12,
    slug: "ashoka",
    name: "Ashoka",
    scientific_name: "Saraca asoca",
    description:
      "A graceful native tree with vivid orange-red blooms and cultural significance. A beautiful choice for gardens and community spaces.",
    image_url:
      "https://images.pexels.com/photos/15383007/pexels-photo-15383007.jpeg?auto=compress&cs=tinysrgb&w=1200",
    suitable_regions: ["madurai", "coimbatore", "bangalore", "mysore", "kerala", "pune"],
    care_notes:
      "Prefers partial shade and moist, well-drained soil while young. Water regularly; protect from harsh afternoon sun early on.",
    planting_cost: 780,
    verification_fee: 100,
    planter_payout: 680,
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