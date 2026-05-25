import type { MonthlyGoals, Session } from "@/lib/db/schema";

export interface GoalProgress {
  year: number;
  /** 0-11 */
  month: number;
  /** e.g. "5月" */
  monthLabel: string;
  /** this month's net P/L in JPY (can be negative) */
  net: number;
  /** sessions played this month */
  count: number;

  // —— win goal ——
  target: number | null;
  /** raw progress toward the target (net / target × 100); can be <0 or >100 */
  targetPct: number;
  targetReached: boolean;
  /** how much more is needed to reach the target (0 once reached) */
  targetRemaining: number;

  // —— monthly loss watch ——
  lossCap: number | null;
  /** positive amount lost this month (0 when up for the month) */
  lossUsed: number;
  /** raw share of the loss budget used (lossUsed / cap × 100); can exceed 100 */
  lossPct: number;
  lossOver: boolean;
}

/**
 * Summarise the current month's progress against the user's goals.
 * `now` is injectable for testing; defaults to the real clock.
 */
export function computeGoalProgress(
  sessions: Session[],
  goals: MonthlyGoals,
  now: Date = new Date(),
): GoalProgress {
  const year = now.getFullYear();
  const month = now.getMonth();

  let net = 0;
  let count = 0;
  for (const s of sessions) {
    const d = new Date(s.playDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      net += s.pnlJpy;
      count += 1;
    }
  }

  const target = goals.targetJpy;
  let targetPct = 0;
  let targetReached = false;
  let targetRemaining = 0;
  if (target != null) {
    if (target > 0) {
      targetPct = (net / target) * 100;
      targetReached = net >= target;
      targetRemaining = Math.max(0, target - net);
    } else {
      // 0 or negative target — reached as soon as net is not below it
      targetReached = net >= target;
      targetPct = targetReached ? 100 : 0;
      targetRemaining = Math.max(0, target - net);
    }
  }

  const lossCap = goals.monthlyLossCapJpy;
  const lossUsed = net < 0 ? -net : 0;
  let lossPct = 0;
  let lossOver = false;
  if (lossCap != null && lossCap > 0) {
    lossPct = (lossUsed / lossCap) * 100;
    lossOver = lossUsed > lossCap;
  }

  return {
    year,
    month,
    monthLabel: `${month + 1}月`,
    net,
    count,
    target,
    targetPct,
    targetReached,
    targetRemaining,
    lossCap,
    lossUsed,
    lossPct,
    lossOver,
  };
}
