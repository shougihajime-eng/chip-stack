"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { PlayingCard } from "@/components/ui/PlayingCard";
import { AnimatedJpy, CountUp } from "@/components/ui/CountUp";
import { MonthlyChart } from "@/components/charts/MonthlyChart";
import { BreakdownChart, buildGameBuckets, buildVenueBuckets } from "@/components/charts/BreakdownChart";
import { AnalyticsCards } from "./AnalyticsCards";
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
  const recent = useMemo(() => (sessions ?? []).slice(0, 5), [sessions]);
  const gameBuckets = useMemo(
    () => buildGameBuckets(sessions ?? [], getGameLabel as (code: string) => string),
    [sessions],
  );
  const venueBuckets = useMemo(() => buildVenueBuckets(sessions ?? []), [sessions]);

  if (sessions === undefined) {
    return <div className="px-1 py-16 text-center text-sm text-muted">読み込み中...</div>;
  }

  const totalTone =
    stats.total > 0 ? "text-profit" : stats.total < 0 ? "text-loss" : "text-foreground";

  return (
    <div className="space-y-6">
      {/* HERO — poker table */}
      <section className="relative overflow-hidden rounded-3xl border border-border-strong animate-hero-glow">
        {/* Felt base */}
        <div className="absolute inset-0 bg-gradient-to-br from-felt-bright/25 via-felt/45 to-felt-deep/70" />
        {/* Top spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_-10%,rgba(240,208,136,0.16),transparent_55%)]" />
        {/* Inner gold stitching top & bottom */}
        <div className="absolute inset-x-8 top-3 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="absolute inset-x-8 bottom-3 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        {/* Side filigree */}
        <div className="absolute inset-y-8 left-3 w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent" />
        <div className="absolute inset-y-8 right-3 w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent" />

        <div className="relative px-3 py-10 sm:px-10 sm:py-16">
          <div className="flex items-center justify-center gap-3 sm:gap-10">
            {/* Left card — Ace of Spades */}
            <div className="shrink-0">
              <PlayingCard
                rank="A"
                suit="♠"
                tilt={-9}
                size="md"
                className="sm:hidden"
                flipIn
                flipDelay={0}
              />
              <PlayingCard
                rank="A"
                suit="♠"
                tilt={-9}
                size="lg"
                className="hidden sm:block xl:hidden"
                flipIn
                flipDelay={0}
              />
              <PlayingCard
                rank="A"
                suit="♠"
                tilt={-9}
                size="xl"
                className="hidden xl:block"
                flipIn
                flipDelay={0}
              />
            </div>

            {/* Center: number stack */}
            <div className="flex min-w-0 flex-col items-center text-center animate-number-rise">
              <div className="flex items-center gap-2.5">
                <span aria-hidden className="text-gold/70">♠</span>
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-gold sm:text-[11px]">
                  Total P/L
                </p>
                <span aria-hidden className="text-suit-red/70">♥</span>
              </div>
              <div
                className={cn(
                  "font-numeric mt-3 text-4xl font-semibold tracking-tight sm:text-6xl xl:text-7xl",
                  totalTone,
                )}
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
              >
                <AnimatedJpy amount={stats.total} durationMs={1200} />
              </div>
              <p className="font-numeric mt-3 text-[11px] tracking-wide text-muted sm:text-[13px]">
                <CountUp value={stats.count} durationMs={900} /> セッション · 勝率{" "}
                <span className="text-foreground">{stats.winRate}%</span>
              </p>
              <p className="font-numeric text-[11px] tracking-wide text-muted sm:text-[13px]">
                平均/回: {stats.avg >= 0 ? "+" : "−"}¥{Math.abs(stats.avg).toLocaleString("ja-JP")}
              </p>
            </div>

            {/* Right card — Ace of Hearts */}
            <div className="shrink-0">
              <PlayingCard
                rank="A"
                suit="♥"
                tilt={9}
                size="md"
                className="sm:hidden"
                flipIn
                flipDelay={140}
              />
              <PlayingCard
                rank="A"
                suit="♥"
                tilt={9}
                size="lg"
                className="hidden sm:block xl:hidden"
                flipIn
                flipDelay={140}
              />
              <PlayingCard
                rank="A"
                suit="♥"
                tilt={9}
                size="xl"
                className="hidden xl:block"
                flipIn
                flipDelay={140}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="今月" value={stats.thisMonth} sub={`${stats.thisMonthCount} 回`} />
        <StatCard label="今年" value={stats.thisYear} />
        <StatCard label="最大の勝ち" value={stats.bestWin} tone="profit" />
        <StatCard label="最大の負け" value={stats.worstLoss} tone="loss" />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>累積収支の推移</CardTitle>
          <span className="text-[11px] text-subtle">月次</span>
        </CardHeader>
        <CardBody>
          <MonthlyChart sessions={sessions} />
        </CardBody>
      </Card>

      {/* Advanced analytics */}
      <AnalyticsCards sessions={sessions} />

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
            <div className="px-6 py-10 text-center">
              <p className="font-display text-lg text-foreground">記録の最初の1ページへ</p>
              <p className="mt-2 text-sm text-muted">
                右上の「新規」から、はじめてのセッションを刻みましょう。
              </p>
              <Link
                href="/sessions/new"
                className="btn-chip mt-5 inline-flex h-10 items-center rounded-full border border-gold/50 bg-gradient-to-b from-gold/25 to-gold/8 px-5 text-sm font-medium tracking-wide text-gold-bright"
              >
                セッションを追加
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {recent.map((s) => (
                <RecentRow key={s.id} session={s} />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "profit" | "loss";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/55 p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{label}</p>
      <div className="mt-1.5">
        <Money
          amount={value}
          size="md"
          signed={!tone}
          className={tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : ""}
        />
      </div>
      {sub && <p className="mt-1 text-[10px] text-subtle">{sub}</p>}
    </div>
  );
}

function RecentRow({ session }: { session: Session }) {
  const country = getCountry(session.country);
  return (
    <li>
      <Link
        href={`/sessions/${session.id}`}
        className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-surface/60"
      >
        <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-border-subtle bg-felt/30">
          <span className="text-[8px] uppercase tracking-wider text-gold/70">
            {new Date(session.playDate).toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="font-display text-sm leading-none text-foreground">
            {new Date(session.playDate).getDate()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 truncate text-sm text-foreground">
            <span className="truncate font-medium">{session.venue}</span>
            <span className="shrink-0 text-[10px]">{country.flag}</span>
          </div>
          <div className="text-[11px] text-muted">
            {getGameLabel(session.game)} · {FORMAT_LABEL[session.format]}
          </div>
        </div>
        <div className="text-right">
          <Money amount={session.pnlJpy} size="sm" />
          {session.currency !== "JPY" && (
            <div className="font-numeric mt-0.5 text-[10px] text-subtle">
              {formatCurrency(session.pnlLocal, session.currency)}
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
