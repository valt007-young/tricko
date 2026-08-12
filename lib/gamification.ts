import { MONTHLY_GOAL_TREES } from "./constants";
import { monthYearKey, startOfDay } from "./utils";

/* ------------------------------------------------------------------ */
/*  Forest levels (gamification only — NOT real environmental impact)  */
/* ------------------------------------------------------------------ */

export interface ForestLevel {
  level: number;
  name: string;
  art: string;
  minTrees: number;
  maxTrees: number | null;
}

export const FOREST_LEVELS: ForestLevel[] = [
  { level: 1, name: "First Seed", art: "🌱", minTrees: 1, maxTrees: 1 },
  { level: 2, name: "Small Grove", art: "🌿", minTrees: 2, maxTrees: 4 },
  { level: 3, name: "Growing Forest", art: "🌳", minTrees: 5, maxTrees: 24 },
  { level: 4, name: "Forest Builder", art: "🌲", minTrees: 25, maxTrees: 99 },
  { level: 5, name: "Forest Guardian", art: "🌳🌳🌳", minTrees: 100, maxTrees: null },
];

export function forestLevelFor(treeCount: number): ForestLevel {
  let current = FOREST_LEVELS[0];
  for (const level of FOREST_LEVELS) {
    if (treeCount >= level.minTrees) current = level;
  }
  return current;
}

export function progressToNextLevel(treeCount: number): number {
  const level = forestLevelFor(treeCount);
  if (level.maxTrees === null) return 1;
  const span = level.maxTrees - level.minTrees + 1;
  const progress = (treeCount - level.minTrees + 1) / span;
  return Math.min(1, Math.max(0, progress));
}

/* ------------------------------------------------------------------ */
/*  Achievements                                                       */
/* ------------------------------------------------------------------ */

export interface AchievementDef {
  code: string;
  name: string;
  description: string;
  threshold: number;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { code: "first_seed", name: "First Seed", description: "Plant your first tree.", threshold: 1 },
  { code: "small_grove", name: "Small Grove", description: "Plant 5 trees.", threshold: 5 },
  { code: "forest_builder", name: "Forest Builder", description: "Plant 25 trees.", threshold: 25 },
  { code: "forest_guardian", name: "Forest Guardian", description: "Support 100 trees.", threshold: 100 },
];

export function achievementsFor(treeCount: number): AchievementDef[] {
  return ACHIEVEMENT_DEFS.filter((a) => treeCount >= a.threshold);
}

/* ------------------------------------------------------------------ */
/*  Monthly goal                                                       */
/* ------------------------------------------------------------------ */

export function monthlyGoalProgress(treeDates: Array<string | Date>): {
  target: number;
  current: number;
  remaining: number;
  pct: number;
} {
  const now = new Date();
  const key = monthYearKey(now);
  const current = treeDates.filter((d) => monthYearKey(new Date(d)) === key).length;
  const target = MONTHLY_GOAL_TREES;
  return {
    target,
    current,
    remaining: Math.max(0, target - current),
    pct: Math.min(1, current / target),
  };
}

/* ------------------------------------------------------------------ */
/*  Planting streak (consecutive days with activity)                   */
/* ------------------------------------------------------------------ */

export function plantingStreak(dates: Array<string | Date>): number {
  if (dates.length === 0) return 0;
  const uniqueDays = new Set<string>();
  for (const d of dates) uniqueDays.add(startOfDay(new Date(d)).toDateString());

  const sorted = Array.from(uniqueDays)
    .map((s) => new Date(s))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const today = startOfDay();
  let cursor = today;

  // A streak counts if activity on today or yesterday.
  const newest = startOfDay(sorted[0]);
  const daysSinceNewest = Math.round((today.getTime() - newest.getTime()) / 86400000);
  if (daysSinceNewest > 1) return 0;

  const daySet = new Set(sorted.map((d) => d.toDateString()));
  while (daySet.has(cursor.toDateString())) {
    if (cursor.getTime() === today.getTime() || daySet.has(today.toDateString())) {
      streak += 1;
    }
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

/* ------------------------------------------------------------------ */
/*  Estimated impact — clearly labeled estimate only                   */
/* ------------------------------------------------------------------ */

export const ESTIMATE_METHODOLOGY =
  "TRIKO Impact Method v0.1. Estimates use IPPC/urban-forest references: a young tree in a tropical street context is estimated to shade roughly 5–20 m² canopy at maturity. Values shown are estimates for engagement, not measured carbon absorption.";

export function estimatedShadeArea(treeCount: number): number {
  return Math.round(treeCount * 12.5);
}

export const IMPACT_NOTICE =
  "Environmental figures on TRIKO are estimates from a documented methodology and never exact CO₂ claims.";