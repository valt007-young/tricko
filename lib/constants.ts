export const APP_NAME = "TRIKO";
export const APP_TAGLINE = "Don't just plant a tree. Grow a forest.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const DEMO_MODE = true;

export const TREE_STATUSES = [
  "funded",
  "accepted",
  "planting",
  "awaiting_verification",
  "verified",
  "needs_review",
  "failed",
] as const;
export type TreeStatus = (typeof TREE_STATUSES)[number];

export const TREE_STATUS_META: Record<
  TreeStatus,
  { label: string; color: string; dot: string; step: number }
> = {
  funded: { label: "Funded", color: "bg-yellow-100 text-yellow-800 border-yellow-300", dot: "🟡", step: 1 },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-800 border-blue-300", dot: "🔵", step: 2 },
  planting: { label: "Planting", color: "bg-orange-100 text-orange-800 border-orange-300", dot: "🟠", step: 3 },
  awaiting_verification: {
    label: "Awaiting verification",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    dot: "🟣",
    step: 4,
  },
  verified: { label: "Verified", color: "bg-green-100 text-green-800 border-green-400", dot: "🟢", step: 5 },
  needs_review: { label: "Needs review", color: "bg-red-100 text-red-800 border-red-300", dot: "🔴", step: 5 },
  failed: { label: "Failed", color: "bg-zinc-200 text-zinc-700 border-zinc-300", dot: "⛔", step: 5 },
};

export const SURVIVAL_STATUSES = ["growing", "healthy", "needs_attention", "did_not_survive"] as const;
export type SurvivalStatus = (typeof SURVIVAL_STATUSES)[number];

export const SURVIVAL_META: Record<SurvivalStatus, { label: string; dot: string; color: string }> = {
  growing: { label: "Growing", dot: "🌱", color: "text-green-700" },
  healthy: { label: "Healthy", dot: "🟢", color: "text-green-700" },
  needs_attention: { label: "Needs attention", dot: "🟡", color: "text-yellow-700" },
  did_not_survive: { label: "Did not survive", dot: "🔴", color: "text-red-700" },
};

export const VERIFICATION_STATUSES = ["pending", "approved", "needs_more_proof", "rejected"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export type Role = "sponsor" | "planter" | "admin";

/* ------------------------------------------------------------------ */
/*  Regions                                                            */
/* ------------------------------------------------------------------ */

export interface Region {
  id: string;
  label: string;
  state: string;
  lat: number;
  lng: number;
}

export const REGIONS: Region[] = [
  { id: "madurai", label: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { id: "coimbatore", label: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { id: "bangalore", label: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { id: "mysore", label: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { id: "pune", label: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { id: "nagpur", label: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { id: "kerala", label: "Thrissur", state: "Kerala", lat: 10.5276, lng: 76.2144 },
  { id: "ahmedabad", label: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { id: "jaipur", label: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { id: "delhi", label: "Delhi NCR", state: "Delhi", lat: 28.7041, lng: 77.1025 },
];

export const ALLOWED_COUNTRIES = ["IN"] as const;

/* ------------------------------------------------------------------ */
/*  Pricing (configurable by admins)                                   */
/* ------------------------------------------------------------------ */

export const PLATFORM_FEE_PER_TREE = 100; // ₹  verification + platform operations
export const DEFAULT_PLANTER_PAYOUT = 700; // ₹  per mission (configurable per species + admin)

export function pricingBreakdown(species: {
  planting_cost?: number;
  planter_payout?: number;
  verification_fee?: number;
}) {
  const plantingCost = species.planting_cost ?? 800;
  const verificationFee = species.verification_fee ?? PLATFORM_FEE_PER_TREE;
  const planterPayout = species.planter_payout ?? DEFAULT_PLANTER_PAYOUT;
  return {
    plantingCost,
    verificationFee,
    planterPayout,
    total: plantingCost + verificationFee,
    platformShare: plantingCost - planterPayout,
  };
}

export const MISSION_DEADLINE_HOURS = 48;
export const MISSION_ESTIMATED_TIME = "1–2 hours";

/* ------------------------------------------------------------------ */
/*  Impact counter defaults (landing)                                  */
/* ------------------------------------------------------------------ */

export interface ImpactStats {
  trees_planted: number;
  currently_growing: number;
  active_planters: number;
  locations: number;
}

export const DEFAULT_IMPACT: ImpactStats = {
  trees_planted: 12482,
  currently_growing: 10841,
  active_planters: 842,
  locations: 37,
};

/* ------------------------------------------------------------------ */
/*  Community challenge (demo)                                         */
/* ------------------------------------------------------------------ */

export const AUGUST_CHALLENGE = { goal: 10000, current: 7842, label: "August Challenge" };

export const MONTHLY_GOAL_TREES = 3;

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

export const PRIMARY_NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/map", label: "Map" },
  { href: "/forest", label: "My Forest" },
];

export const PLANTER_NAV = [
  { href: "/missions", label: "Planting Missions" },
  { href: "/mymissions", label: "My Missions" },
  { href: "/work", label: "Earnings" },
];

export const NAV = {
  public: [{ href: "/explore", label: "Explore" }, { href: "/map", label: "Map" }],
};

export function regionById(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export const DEFAULT_TREE_IMAGE =
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80";