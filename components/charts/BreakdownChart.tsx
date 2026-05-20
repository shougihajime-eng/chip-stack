"use client";

import { useMemo } from "react";

import type { Session } from "@/lib/db/schema";
import { formatCompactJpy, formatJpy } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface Bucket {
  key: string;
  label: string;
  total: number;
  count: number;
}

interface Props {
  buckets: Bucket[];
  /** Maximum number of rows to show (sorted by abs(total) desc) */
  limit?: number;
}

/**
 * Horizontal bar chart showing P/L by bucket (game or venue).
 * Uses CSS bars instead of Recharts for tighter control + animation.
 */
export function BreakdownChart({ buckets, limit = 6 }: Props) {
  const top = useMemo(() => {
    return [...buckets]
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
      .slice(0, limit);
  }, [buckets, limit]);

  const maxAbs = useMemo(() => {
    return Math.max(1, ...top.map((b) => Math.abs(b.total)));
  }, [top]);

  if (top.length === 0) {
    return (
      <div className="grid h-32 place-items-center text-center text-sm text-muted">
        セッションを記録するとここに集計が表示されます。
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {top.map((b, i) => {
        const pct = Math.max(2, (Math.abs(b.total) / maxAbs) * 100);
        const positive = b.total >= 0;
        return (
          <li
            key={b.key}
            className="animate-row-rise"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-baseline justify-between gap-3 text-[12px]">
              <div className="min-w-0 flex-1 truncate text-foreground">
                <span className="truncate">{b.label}</span>
                <span className="ml-2 text-[10px] text-subtle">
                  {b.count}回
                </span>
              </div>
              <span
                className={cn(
                  "font-numeric shrink-0 text-[13px] font-medium tabular",
                  positive ? "text-profit" : b.total < 0 ? "text-loss" : "text-muted",
                )}
              >
                {b.total >= 0 ? "+" : "−"}¥{Math.abs(b.total).toLocaleString("ja-JP")}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface/60">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700 ease-out",
                  positive
                    ? "bg-gradient-to-r from-profit/40 to-profit/90"
                    : "bg-gradient-to-r from-loss/40 to-loss/90",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function buildGameBuckets(sessions: Session[], labelOf: (code: string) => string): Bucket[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const s of sessions) {
    const prev = map.get(s.game) ?? { total: 0, count: 0 };
    map.set(s.game, { total: prev.total + s.pnlJpy, count: prev.count + 1 });
  }
  return [...map.entries()].map(([key, v]) => ({
    key,
    label: labelOf(key),
    total: v.total,
    count: v.count,
  }));
}

export function buildVenueBuckets(sessions: Session[]): Bucket[] {
  const map = new Map<string, { total: number; count: number; countryCode: string }>();
  for (const s of sessions) {
    const key = `${s.country}::${s.venue}`;
    const prev = map.get(key) ?? { total: 0, count: 0, countryCode: s.country };
    map.set(key, { total: prev.total + s.pnlJpy, count: prev.count + 1, countryCode: s.country });
  }
  return [...map.entries()].map(([key, v]) => {
    const [country, venue] = key.split("::");
    return {
      key,
      label: `${venue}`,
      total: v.total,
      count: v.count,
    };
  });
}

export { formatCompactJpy, formatJpy };
