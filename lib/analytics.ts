import type { Session } from "@/lib/db/schema";
import { getGameLabel, type GameCategory } from "@/lib/games";

export interface HourlyRateByGame {
  game: GameCategory;
  label: string;
  totalJpy: number;
  totalMinutes: number;
  hourlyJpy: number;
  sessions: number;
}

export interface Streak {
  type: "win" | "loss";
  length: number;
  totalJpy: number;
  startDate?: string;
  endDate?: string;
}

export interface TournamentRoi {
  totalBuyInJpy: number;
  totalReturnJpy: number;
  totalProfitJpy: number;
  /** As percentage (e.g. 18.5 means +18.5%) */
  roiPercent: number;
  entries: number;
  itm: number;
  itmRate: number;
}

/**
 * Hourly rate per game (only sessions with duration are counted).
 * Returns top entries sorted by totalMinutes descending.
 */
export function computeHourlyRateByGame(sessions: Session[]): HourlyRateByGame[] {
  const map = new Map<GameCategory, { total: number; minutes: number; count: number }>();
  for (const s of sessions) {
    if (!s.durationMinutes || s.durationMinutes <= 0) continue;
    const prev = map.get(s.game) ?? { total: 0, minutes: 0, count: 0 };
    map.set(s.game, {
      total: prev.total + s.pnlJpy,
      minutes: prev.minutes + s.durationMinutes,
      count: prev.count + 1,
    });
  }
  return [...map.entries()]
    .map(([game, v]) => ({
      game,
      label: getGameLabel(game),
      totalJpy: v.total,
      totalMinutes: v.minutes,
      hourlyJpy: v.minutes > 0 ? Math.round((v.total / v.minutes) * 60) : 0,
      sessions: v.count,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
}

export function computeOverallHourly(sessions: Session[]): {
  hourlyJpy: number;
  totalMinutes: number;
  totalJpy: number;
} {
  let total = 0;
  let minutes = 0;
  for (const s of sessions) {
    if (!s.durationMinutes || s.durationMinutes <= 0) continue;
    total += s.pnlJpy;
    minutes += s.durationMinutes;
  }
  return {
    hourlyJpy: minutes > 0 ? Math.round((total / minutes) * 60) : 0,
    totalMinutes: minutes,
    totalJpy: total,
  };
}

/**
 * Longest winning and losing streaks based on session order by play date.
 */
export function computeBestStreaks(sessions: Session[]): { bestWin: Streak; worstLoss: Streak } {
  if (sessions.length === 0) {
    return {
      bestWin: { type: "win", length: 0, totalJpy: 0 },
      worstLoss: { type: "loss", length: 0, totalJpy: 0 },
    };
  }
  const sorted = [...sessions].sort((a, b) => (a.playDate < b.playDate ? -1 : 1));
  let curType: "win" | "loss" | null = null;
  let curLen = 0;
  let curTotal = 0;
  let curStart: string | undefined;
  let bestWin: Streak = { type: "win", length: 0, totalJpy: 0 };
  let worstLoss: Streak = { type: "loss", length: 0, totalJpy: 0 };

  const finalize = (endDate: string) => {
    if (curType === "win" && curLen > bestWin.length) {
      bestWin = { type: "win", length: curLen, totalJpy: curTotal, startDate: curStart, endDate };
    }
    if (curType === "loss" && curLen > worstLoss.length) {
      worstLoss = { type: "loss", length: curLen, totalJpy: curTotal, startDate: curStart, endDate };
    }
  };

  for (let i = 0; i < sorted.length; i += 1) {
    const s = sorted[i];
    if (s.pnlJpy === 0) {
      if (curType) finalize(sorted[i - 1]?.playDate ?? s.playDate);
      curType = null;
      curLen = 0;
      curTotal = 0;
      curStart = undefined;
      continue;
    }
    const t: "win" | "loss" = s.pnlJpy > 0 ? "win" : "loss";
    if (t === curType) {
      curLen += 1;
      curTotal += s.pnlJpy;
    } else {
      if (curType) finalize(sorted[i - 1]?.playDate ?? s.playDate);
      curType = t;
      curLen = 1;
      curTotal = s.pnlJpy;
      curStart = s.playDate;
    }
  }
  if (curType) finalize(sorted[sorted.length - 1].playDate);
  return { bestWin, worstLoss };
}

/**
 * Tournament ROI (total winnings divided by total buy-ins).
 * ITM = "in the money" — defined here as sessions with positive P/L.
 */
export function computeTournamentRoi(sessions: Session[]): TournamentRoi {
  const tournies = sessions.filter((s) => s.format === "tournament");
  let buyInJpy = 0;
  let returnJpy = 0;
  let itm = 0;
  for (const s of tournies) {
    const buyJpy = Math.round(s.buyIn * s.fxRate);
    const outJpy = Math.round(s.cashOut * s.fxRate);
    buyInJpy += buyJpy;
    returnJpy += outJpy;
    if (s.pnlJpy > 0) itm += 1;
  }
  const profit = returnJpy - buyInJpy;
  const roiPercent = buyInJpy > 0 ? Math.round((profit / buyInJpy) * 1000) / 10 : 0;
  return {
    totalBuyInJpy: buyInJpy,
    totalReturnJpy: returnJpy,
    totalProfitJpy: profit,
    roiPercent,
    entries: tournies.length,
    itm,
    itmRate: tournies.length > 0 ? Math.round((itm / tournies.length) * 1000) / 10 : 0,
  };
}
