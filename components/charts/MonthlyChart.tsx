"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Session } from "@/lib/db/schema";
import { formatCompactJpy, formatJpy } from "@/lib/currency";
import { monthKey } from "@/lib/utils";

interface Props {
  sessions: Session[];
}

interface ChartPoint {
  key: string;
  label: string;
  month: number;
  cumulative: number;
}

function buildSeries(sessions: Session[]): ChartPoint[] {
  if (sessions.length === 0) return [];

  // Group by month
  const map = new Map<string, number>();
  for (const s of sessions) {
    const k = monthKey(s.playDate);
    map.set(k, (map.get(k) ?? 0) + s.pnlJpy);
  }

  // Sort keys ascending and accumulate
  const sortedKeys = [...map.keys()].sort();
  if (sortedKeys.length === 0) return [];

  // Fill gaps between first and last month
  const out: ChartPoint[] = [];
  const [startYear, startMonth] = sortedKeys[0].split("-").map(Number);
  const [endYear, endMonth] = sortedKeys[sortedKeys.length - 1].split("-").map(Number);

  let cumulative = 0;
  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    const k = `${y}-${String(m).padStart(2, "0")}`;
    const monthValue = map.get(k) ?? 0;
    cumulative += monthValue;
    out.push({
      key: k,
      label: `${y}/${m}`,
      month: monthValue,
      cumulative,
    });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    if (out.length > 60) break; // safety
  }

  return out;
}

export function MonthlyChart({ sessions }: Props) {
  const data = useMemo(() => buildSeries(sessions), [sessions]);

  if (data.length === 0) {
    return (
      <div className="grid h-56 place-items-center text-center text-sm text-muted">
        セッションを記録すると、ここにグラフが現れます。
      </div>
    );
  }

  const min = Math.min(0, ...data.map((d) => d.cumulative));
  const max = Math.max(0, ...data.map((d) => d.cumulative));
  const padding = Math.max(Math.abs(min), Math.abs(max)) * 0.15 || 1000;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34b27d" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#34b27d" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lossGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#c14a5a" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#c14a5a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c9a961" />
              <stop offset="100%" stopColor="#e4c987" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(245,241,232,0.04)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="rgba(156,148,138,0.6)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[min - padding, max + padding]}
            stroke="rgba(156,148,138,0.6)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCompactJpy(v as number)}
            width={56}
          />
          <Tooltip
            cursor={{ stroke: "rgba(201,169,97,0.3)", strokeWidth: 1 }}
            formatter={(value, name) => [
              formatJpy(Number(value), { sign: true }),
              name === "cumulative" ? "累積収支" : "月次収支",
            ]}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="url(#lineGrad)"
            strokeWidth={2}
            fill="url(#profitGrad)"
            fillOpacity={1}
            activeDot={{ r: 5, fill: "#e4c987", stroke: "#0a0e0d", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
