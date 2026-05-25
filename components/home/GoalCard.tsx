"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { DEFAULT_GOALS, getGoals, hasAnyGoal } from "@/lib/db/goals";
import { computeGoalProgress } from "@/lib/goals";
import type { Session } from "@/lib/db/schema";
import { formatJpy } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function GoalCard({ sessions }: { sessions: Session[] }) {
  const goals = useLiveQuery(() => getGoals(), [], DEFAULT_GOALS);
  const progress = useMemo(
    () => computeGoalProgress(sessions, goals ?? DEFAULT_GOALS),
    [sessions, goals],
  );

  // Not set yet → a gentle invitation (drives people to set a goal).
  if (!goals || !hasAnyGoal(goals)) {
    return <GoalInvite />;
  }

  const { net, count, monthLabel } = progress;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{monthLabel}の目標と見守り</CardTitle>
        <Link
          href="/settings"
          className="text-[11px] font-medium tracking-wide text-gold hover:text-gold-bright"
        >
          目標を変える →
        </Link>
      </CardHeader>
      <CardBody className="space-y-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            今月の収支
          </span>
          <span className="text-[11px] text-subtle">{count} 回プレイ</span>
        </div>
        <p
          className={cn(
            "font-numeric -mt-3 text-3xl font-semibold tracking-tight",
            net > 0 ? "text-profit" : net < 0 ? "text-loss" : "text-foreground",
          )}
        >
          {formatJpy(net, { sign: true })}
        </p>

        {progress.target != null && <TargetBlock progress={progress} />}
        {progress.lossCap != null && <LossBlock progress={progress} />}
      </CardBody>
    </Card>
  );
}

function GoalInvite() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/12 via-felt/15 to-transparent px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-2xl" aria-hidden>
            🎯
          </span>
          <div>
            <p className="font-display text-lg text-foreground">今月の目標を決めませんか？</p>
            <p className="mt-1 max-w-md text-[13px] leading-relaxed text-muted">
              「今月いくら勝ちたい」を決めると、がんばりが見える化されます。
              さらに「使いすぎ見守り」で、負けが決めた上限に近づいたらやさしくお知らせします。
            </p>
          </div>
        </div>
        <Link
          href="/settings"
          className="btn-chip inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-gold/60 bg-gradient-to-b from-gold/30 to-gold/10 px-6 text-sm font-medium tracking-wide text-gold-bright transition-colors hover:border-gold/80 hover:from-gold/40"
        >
          目標を決める
        </Link>
      </div>
    </div>
  );
}

function TargetBlock({ progress }: { progress: ReturnType<typeof computeGoalProgress> }) {
  const { target, targetPct, targetReached, targetRemaining, net } = progress;
  const width = Math.max(0, Math.min(100, targetPct));

  let message: string;
  if (targetReached) {
    message = "🎉 今月の目標を達成しました！おみごとです。";
  } else if (net <= 0) {
    message = `目標まで あと ${formatJpy(targetRemaining)}。あせらず、自分のペースで。`;
  } else {
    message = `目標まで あと ${formatJpy(targetRemaining)}。いい調子です。`;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-[12px]">
        <span className="text-muted">勝ちの目標</span>
        <span className="font-numeric text-foreground">{formatJpy(target ?? 0, { sign: true })}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-felt/40">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            targetReached
              ? "bg-gradient-to-r from-profit/70 to-profit"
              : "bg-gradient-to-r from-gold/60 to-gold-bright",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className={cn("text-[12px]", targetReached ? "text-profit" : "text-subtle")}>{message}</p>
    </div>
  );
}

function LossBlock({ progress }: { progress: ReturnType<typeof computeGoalProgress> }) {
  const { lossCap, lossUsed, lossPct, lossOver } = progress;
  const width = Math.max(0, Math.min(100, lossPct));

  // green when comfortable, amber as it fills, red when near/over the cap
  const tone = lossOver || lossPct >= 90 ? "danger" : lossPct >= 60 ? "caution" : "safe";

  const barClass =
    tone === "danger"
      ? "bg-gradient-to-r from-loss/70 to-loss"
      : tone === "caution"
      ? "bg-gradient-to-r from-gold/60 to-gold-bright"
      : "bg-gradient-to-r from-profit/60 to-profit";

  let message: string;
  let messageClass = "text-subtle";
  if (lossOver) {
    message = "⚠️ 今月の負けが、決めた上限をこえました。今月はここまでにして、また来月いきましょう。";
    messageClass = "text-loss";
  } else if (tone === "caution" || tone === "danger") {
    message = "上限に近づいています。無理は禁物。今日はひと息ついても大丈夫です。";
    messageClass = "text-gold-bright";
  } else if (lossUsed === 0) {
    message = "今月はまだ負けこしていません。いいペースです。";
  } else {
    message = "まだ余裕があります。落ち着いていきましょう。";
  }

  return (
    <div className="space-y-2 border-t border-border-subtle pt-4">
      <div className="flex items-baseline justify-between text-[12px]">
        <span className="text-muted">使いすぎ見守り（今月の負け）</span>
        <span className="font-numeric text-foreground">
          {formatJpy(lossUsed)} <span className="text-subtle">/ {formatJpy(lossCap ?? 0)}</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-felt/40">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", barClass)}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className={cn("text-[12px]", messageClass)}>{message}</p>
    </div>
  );
}
