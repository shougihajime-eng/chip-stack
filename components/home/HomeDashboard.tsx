"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Chip } from "@/components/ui/ChipStack";
import { MonthlyChart } from "@/components/charts/MonthlyChart";
import { BreakdownChart, buildGameBuckets, buildVenueBuckets } from "@/components/charts/BreakdownChart";
import { AnalyticsCards } from "./AnalyticsCards";
import { HeroTable } from "./HeroTable";
import { CasinoTicker } from "./CasinoTicker";
import { GoalCard } from "./GoalCard";
import { listSessions } from "@/lib/db/sessions";
import type { Session } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/currency";
import { FORMAT_LABEL, getCountry, getGameLabel } from "@/lib/games";
import { cn } from "@/lib/utils";

function computeStats(sessions: Session[]) {
  if (sessions.length === 0) {
    return {
      total: 0,
      count: 0,
      winRate: 0,
      avg: 0,
      bestWin: 0,
      worstLoss: 0,
      thisMonth: 0,
      thisMonthCount: 0,
      thisYear: 0,
    };
  }

  const now = new Date();
  let total = 0;
  let wins = 0;
  let bestWin = 0;
  let worstLoss = 0;
  let thisMonth = 0;
  let thisMonthCount = 0;
  let thisYear = 0;

  for (const s of sessions) {
    total += s.pnlJpy;
    if (s.pnlJpy > 0) wins += 1;
    if (s.pnlJpy > bestWin) bestWin = s.pnlJpy;
    if (s.pnlJpy < worstLoss) worstLoss = s.pnlJpy;

    const d = new Date(s.playDate);
    if (d.getFullYear() === now.getFullYear()) {
      thisYear += s.pnlJpy;
      if (d.getMonth() === now.getMonth()) {
        thisMonth += s.pnlJpy;
        thisMonthCount += 1;
      }
    }
  }

  return {
    total,
    count: sessions.length,
    winRate: Math.round((wins / sessions.length) * 1000) / 10,
    avg: Math.round(total / sessions.length),
    bestWin,
    worstLoss,
    thisMonth,
    thisMonthCount,
    thisYear,
  };
}

export function HomeDashboard() {
  const sessions = useLiveQuery(() => listSessions(), [], undefined);
  const stats = useMemo(() => computeStats(sessions ?? []), [sessions]);
  const recent = useMemo(() => (sessions ?? []).slice(0, 6), [sessions]);
  const gameBuckets = useMemo(
    () => buildGameBuckets(sessions ?? [], getGameLabel as (code: string) => string),
    [sessions],
  );
  const venueBuckets = useMemo(() => buildVenueBuckets(sessions ?? []), [sessions]);

  if (sessions === undefined) {
    return <div className="px-1 py-16 text-center text-sm text-muted">読み込み中...</div>;
  }

  return (
    <div className="space-y-8">
      {/* HERO — cinematic poker table */}
      <HeroTable
        total={stats.total}
        count={stats.count}
        winRate={stats.winRate}
        avg={stats.avg}
        thisMonth={stats.thisMonth}
        thisMonthCount={stats.thisMonthCount}
        thisYear={stats.thisYear}
      />

      {/* Casino ticker — flavor marquee (PC only) */}
      <CasinoTicker sessions={sessions} />

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
        <ChipStatCard label="今月" value={stats.thisMonth} sub={`${stats.thisMonthCount} 回`} chip="green" delay={0} />
        <ChipStatCard label="今年" value={stats.thisYear} chip="blue" delay={80} />
        <ChipStatCard label="最大の勝ち" value={stats.bestWin} tone="profit" chip="gold" delay={160} />
        <ChipStatCard label="最大の負け" value={stats.worstLoss} tone="loss" chip="red" delay={240} />
      </div>

      {/* Monthly goal & responsible-play watch */}
      <GoalCard sessions={sessions} />

      {/* MAIN GRID — chart + analytics side-by-side on PC */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_1fr]">
        {/* Cumulative chart */}
        <Card>
          <CardHeader>
            <CardTitle>累積収支の推移</CardTitle>
            <span className="text-[11px] text-subtle">月次</span>
          </CardHeader>
          <CardBody>
            <MonthlyChart sessions={sessions} />
          </CardBody>
        </Card>

        {/* Analytics column */}
        <div className="space-y-6">
          <AnalyticsCards sessions={sessions} />
        </div>
      </div>

      {/* Breakdown charts */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ゲーム別 収支</CardTitle>
            <span className="text-[11px] text-subtle">上位 {Math.min(6, gameBuckets.length)} 種</span>
          </CardHeader>
          <CardBody>
            <BreakdownChart buckets={gameBuckets} limit={6} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>場所別 収支</CardTitle>
            <span className="text-[11px] text-subtle">上位 {Math.min(6, venueBuckets.length)} 箇所</span>
          </CardHeader>
          <CardBody>
            <BreakdownChart buckets={venueBuckets} limit={6} />
          </CardBody>
        </Card>
      </div>

      {/* Recent sessions */}
      <Card>
        <CardHeader>
          <CardTitle>最近のセッション</CardTitle>
          {recent.length > 0 && (
            <Link
              href="/sessions"
              className="text-[11px] font-medium tracking-wide text-gold hover:text-gold-bright"
            >
              すべて見る →
            </Link>
          )}
        </CardHeader>
        <CardBody className="px-0 sm:px-0">
          {recent.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="font-display text-xl text-foreground">記録の最初の1ページへ</p>
              <p className="mt-2 text-sm text-muted">
                右上の「新規セッション」から、はじめての一局を刻みましょう。
              </p>
              <Link
                href="/sessions/new"
                className="btn-chip animate-gold-ring mt-6 inline-flex h-11 items-center rounded-full border border-gold/60 bg-gradient-to-b from-gold/30 to-gold/10 px-6 text-sm font-medium tracking-wide text-gold-bright"
              >
                セッションを追加
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {recent.map((s, i) => (
                <RecentRow key={s.id} session={s} delay={i * 50} />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function ChipStatCard({
  label,
  value,
  sub,
  tone,
  chip,
  delay,
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "profit" | "loss";
  chip: "red" | "blue" | "green" | "gold";
  delay: number;
}) {
  return (
    <div
      className="group animate-tile-pop relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 transition-all hover:border-gold/40 hover:bg-surface-elevated/60 sm:p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle felt overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(240,208,136,0.12), transparent 60%)",
        }}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{label}</p>
          <div className="mt-2">
            <Money
              amount={value}
              size="lg"
              signed={!tone}
              className={tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : ""}
            />
          </div>
          {sub && <p className="mt-1 text-[10px] text-subtle">{sub}</p>}
        </div>
        <div className="shrink-0 transition-transform duration-500 group-hover:rotate-[18deg] group-hover:scale-110">
          <Chip color={chip} size={42} />
        </div>
      </div>
    </div>
  );
}

function RecentRow({ session, delay }: { session: Session; delay: number }) {
  const country = getCountry(session.country);
  return (
    <li className="animate-row-rise" style={{ animationDelay: `${delay}ms` }}>
      <Link
        href={`/sessions/${session.id}`}
        className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-surface/60"
      >
        <div className="relative flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-border-subtle bg-felt/40 text-center transition-transform group-hover:scale-105">
          <span className="text-[9px] uppercase tracking-wider text-gold/80">
            {new Date(session.playDate).toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="font-display text-base leading-none text-foreground">
            {new Date(session.playDate).getDate()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 truncate text-sm text-foreground">
            <span className="truncate font-medium">
              {session.tourneyTitle?.trim() ? session.tourneyTitle : session.venue}
            </span>
            <span className="shrink-0 text-[12px]">{country.flag}</span>
          </div>
          <div className="text-[11px] text-muted">
            {getGameLabel(session.game)} · {FORMAT_LABEL[session.format]}
            {session.reentries && session.reentries > 0 ? ` · ×${1 + session.reentries}` : ""}
          </div>
        </div>
        <div className="text-right">
          <Money amount={session.pnlJpy} size="md" />
          {session.currency !== "JPY" && (
            <div className="font-numeric mt-0.5 text-[10px] text-subtle">
              {formatCurrency(session.pnlLocal, session.currency)}
            </div>
          )}
        </div>
        <span
          className={cn(
            "ml-2 hidden text-[18px] text-gold/0 transition-all group-hover:text-gold/80 sm:inline",
          )}
          aria-hidden
        >
          →
        </span>
      </Link>
    </li>
  );
}
