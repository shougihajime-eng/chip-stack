"use client";

import { useMemo } from "react";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import {
  computeBestStreaks,
  computeHourlyRateByGame,
  computeOverallHourly,
  computeTournamentRoi,
} from "@/lib/analytics";
import type { Session } from "@/lib/db/schema";
import { formatJpy } from "@/lib/currency";
import { cn, formatDateShort } from "@/lib/utils";

interface Props {
  sessions: Session[];
}

export function AnalyticsCards({ sessions }: Props) {
  const overall = useMemo(() => computeOverallHourly(sessions), [sessions]);
  const byGame = useMemo(() => computeHourlyRateByGame(sessions), [sessions]);
  const streaks = useMemo(() => computeBestStreaks(sessions), [sessions]);
  const tournament = useMemo(() => computeTournamentRoi(sessions), [sessions]);

  const totalHours = (overall.totalMinutes / 60).toFixed(1);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Hourly rate */}
      <Card>
        <CardHeader>
          <CardTitle>時給</CardTitle>
          <span className="text-[11px] text-subtle">プレイ時間入力あり</span>
        </CardHeader>
        <CardBody>
          {overall.totalMinutes === 0 ? (
            <div className="grid h-28 place-items-center text-center text-sm text-muted">
              プレイ時間を入力すると時給が見られます
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted">全体</span>
                <div className="text-right">
                  <Money amount={overall.hourlyJpy} size="lg" />
                  <span className="ml-1 text-[11px] text-muted">/ 時</span>
                </div>
              </div>
              <p className="font-numeric mt-1 text-[11px] text-subtle">
                通算 {totalHours} 時間 · 累計収支 {formatJpy(overall.totalJpy, { sign: true })}
              </p>
              {byGame.length > 0 && (
                <ul className="mt-4 space-y-2.5 border-t border-border-subtle pt-3">
                  {byGame.slice(0, 4).map((g) => (
                    <li key={g.game} className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[13px] text-foreground">{g.label}</span>
                        <span className="font-numeric ml-2 text-[10px] text-subtle">
                          {(g.totalMinutes / 60).toFixed(1)}h
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={cn(
                            "font-numeric text-[13px] font-medium",
                            g.hourlyJpy > 0 ? "text-profit" : g.hourlyJpy < 0 ? "text-loss" : "text-muted",
                          )}
                        >
                          {g.hourlyJpy >= 0 ? "+" : "−"}¥{Math.abs(g.hourlyJpy).toLocaleString("ja-JP")}
                        </span>
                        <span className="ml-1 text-[10px] text-subtle">/h</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Streaks */}
      <Card>
        <CardHeader>
          <CardTitle>連勝・連敗</CardTitle>
          <span className="text-[11px] text-subtle">最長記録</span>
        </CardHeader>
        <CardBody>
          {streaks.bestWin.length === 0 && streaks.worstLoss.length === 0 ? (
            <div className="grid h-28 place-items-center text-center text-sm text-muted">
              セッションを記録するとストリークが表示されます
            </div>
          ) : (
            <div className="space-y-4">
              <StreakRow streak={streaks.bestWin} label="最長 連勝" tone="profit" emoji="🔥" />
              <div className="h-px bg-border-subtle" />
              <StreakRow streak={streaks.worstLoss} label="最長 連敗" tone="loss" emoji="🧊" />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tournament ROI */}
      <Card className="sm:col-span-2">
        <CardHeader>
          <CardTitle>トーナメント ROI</CardTitle>
          <span className="text-[11px] text-subtle">{tournament.entries} エントリー</span>
        </CardHeader>
        <CardBody>
          {tournament.entries === 0 ? (
            <div className="grid h-24 place-items-center text-center text-sm text-muted">
              トーナメント形式のセッションを記録するとここに ROI が表示されます
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Metric label="ROI">
                <span
                  className={cn(
                    "font-numeric text-2xl font-semibold",
                    tournament.roiPercent > 0 ? "text-profit" : tournament.roiPercent < 0 ? "text-loss" : "text-muted",
                  )}
                >
                  {tournament.roiPercent >= 0 ? "+" : ""}
                  {tournament.roiPercent}%
                </span>
              </Metric>
              <Metric label="利益">
                <Money amount={tournament.totalProfitJpy} size="md" />
              </Metric>
              <Metric label="投資総額">
                <span className="font-numeric text-lg text-foreground">
                  ¥{tournament.totalBuyInJpy.toLocaleString("ja-JP")}
                </span>
              </Metric>
              <Metric label="ITM 率">
                <span className="font-numeric text-lg text-foreground">{tournament.itmRate}%</span>
                <p className="text-[10px] text-subtle">
                  {tournament.itm} / {tournament.entries}
                </p>
              </Metric>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function StreakRow({
  streak,
  label,
  tone,
  emoji,
}: {
  streak: ReturnType<typeof computeBestStreaks>[keyof ReturnType<typeof computeBestStreaks>];
  label: string;
  tone: "profit" | "loss";
  emoji: string;
}) {
  if (streak.length === 0) {
    return (
      <div className="text-sm text-muted">
        <span className="mr-2 text-base">{emoji}</span>
        {label}: なし
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-numeric text-3xl font-semibold text-foreground">
            {streak.length}
            <span className="ml-1 text-[12px] font-normal text-muted">連続</span>
          </span>
        </div>
        {streak.startDate && streak.endDate && (
          <p className="font-numeric mt-0.5 text-[10px] text-subtle">
            {formatDateShort(streak.startDate)} 〜 {formatDateShort(streak.endDate)}
          </p>
        )}
      </div>
      <Money amount={streak.totalJpy} size="md" className={tone === "profit" ? "text-profit" : "text-loss"} />
    </div>
  );
}
