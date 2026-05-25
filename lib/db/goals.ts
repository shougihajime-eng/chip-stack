"use client";

import { getDb } from "./db";
import type { MonthlyGoals } from "./schema";

const GOALS_KEY = "monthly-goals";

export const DEFAULT_GOALS: MonthlyGoals = {
  targetJpy: null,
  monthlyLossCapJpy: null,
  sessionLossCapJpy: null,
};

/** True if the user has set at least one goal/limit. */
export function hasAnyGoal(g: MonthlyGoals): boolean {
  return g.targetJpy != null || g.monthlyLossCapJpy != null || g.sessionLossCapJpy != null;
}

function sanitize(raw: unknown): MonthlyGoals {
  const r = (raw ?? {}) as Partial<Record<keyof MonthlyGoals, unknown>>;
  const num = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  // loss caps are kept positive; a stray sign is normalised away
  const cap = (v: unknown): number | null => {
    const n = num(v);
    return n == null ? null : Math.abs(Math.round(n));
  };
  return {
    targetJpy: num(r.targetJpy) == null ? null : Math.round(Number(r.targetJpy)),
    monthlyLossCapJpy: cap(r.monthlyLossCapJpy),
    sessionLossCapJpy: cap(r.sessionLossCapJpy),
  };
}

/** Read the saved goals (used with useLiveQuery on the home + settings screens). */
export async function getGoals(): Promise<MonthlyGoals> {
  const db = getDb();
  const row = await db.settings.get(GOALS_KEY);
  if (!row) return DEFAULT_GOALS;
  try {
    return sanitize(JSON.parse(row.value));
  } catch {
    return DEFAULT_GOALS;
  }
}

/** Save the goals. Pass `null` for any field the user leaves blank. */
export async function saveGoals(goals: MonthlyGoals): Promise<void> {
  const db = getDb();
  await db.settings.put({
    key: GOALS_KEY,
    value: JSON.stringify(sanitize(goals)),
    updatedAt: new Date().toISOString(),
  });
}
