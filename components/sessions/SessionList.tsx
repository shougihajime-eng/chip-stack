"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";

import { Card, CardBody } from "@/components/ui/Card";
import { Field, Select } from "@/components/ui/Field";
import { Money } from "@/components/ui/Money";
import { GAMES, type GameCategory, COUNTRIES, type Country, getCountry, FORMAT_LABEL, getGameLabel } from "@/lib/games";
import { listSessions } from "@/lib/db/sessions";
import type { Session } from "@/lib/db/schema";
import { formatDateShort } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

type Period = "all" | "month" | "year" | "3months";

function isInPeriod(iso: string, period: Period): boolean {
  if (period === "all") return true;
  const d = new Date(iso);
  const now = new Date();
  if (period === "month") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (period === "year") {
    return d.getFullYear() === now.getFullYear();
  }
  if (period === "3months") {
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() - 3);
    return d >= threshold;
  }
  return true;
}

export function SessionList() {
  const sessions = useLiveQuery(() => listSessions(), [], []);
  const [period, setPeriod] = useState<Period>("all");
  const [gameFilter, setGameFilter] = useState<"all" | GameCategory>("all");
  const [countryFilter, setCountryFilter] = useState<"all" | Country>("all");

  const filtered = useMemo(() => {
    return (sessions ?? []).filter((s) => {
      if (!isInPeriod(s.playDate, period)) return false;
      if (gameFilter !== "all" && s.game !== gameFilter) return false;
      if (countryFilter !== "all" && s.country !== countryFilter) return false;
      return true;
    });
  }, [sessions, period, gameFilter, countryFilter]);

  const total = useMemo(() => filtered.reduce((s, x) => s + x.pnlJpy, 0), [filtered]);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="期間">
            <Select value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
              <option value="all">全期間</option>
              <option value="month">今月</option>
              <option value="3months">直近3ヶ月</option>
              <option value="year">今年</option>
            </Select>
          </Field>
          <Field label="ゲーム">
            <Select value={gameFilter} onChange={(e) => setGameFilter(e.target.value as "all" | GameCategory)}>
              <option value="all">すべて</option>
              {GAMES.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="国">
            <Select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value as "all" | Country)}>
              <option value="all">すべて</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </option>
              ))}
            </Select>
          </Field>
        </CardBody>
      </Card>

      <div className="flex items-baseline justify-between px-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          {filtered.length} セッション
        </span>
        <span className="flex items-baseline gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">合計</span>
          <Money amount={total} size="lg" />
        </span>
      </div>

      {sessions === undefined ? (
        <div className="px-1 py-12 text-center text-sm text-muted">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <EmptyState hasAny={(sessions?.length ?? 0) > 0} />
      ) : (
        <ul className="space-y-3">
          {filtered.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SessionRow({ session }: { session: Session }) {
  const country = getCountry(session.country);
  return (
    <li>
      <Link
        href={`/sessions/${session.id}`}
        className="group block rounded-2xl border border-border bg-surface/60 backdrop-blur-sm transition-all hover:border-border-strong hover:bg-surface-elevated/60"
      >
        <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-border-subtle bg-felt/30 text-center">
            <span className="text-[10px] font-medium uppercase tracking-wider text-gold/80">
              {new Date(session.playDate).toLocaleDateString("en-US", { month: "short" })}
            </span>
            <span className="font-display text-lg leading-none text-foreground">
              {new Date(session.playDate).getDate()}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 truncate text-sm text-foreground">
              <span className="truncate font-medium">{session.venue}</span>
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-subtle">
                {country.flag}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 truncate text-[12px] text-muted">
              <span>{getGameLabel(session.game)}</span>
              <span className="text-subtle">·</span>
              <span>{FORMAT_LABEL[session.format]}</span>
              {session.durationMinutes ? (
                <>
                  <span className="text-subtle">·</span>
                  <span>{Math.round(session.durationMinutes / 60 * 10) / 10}h</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="text-right">
            <Money amount={session.pnlJpy} size="md" />
            {session.currency !== "JPY" && (
              <div className="font-numeric mt-0.5 text-[11px] text-subtle">
                {formatCurrency(session.pnlLocal, session.currency)}
              </div>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-border-strong bg-felt/40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-6 w-6 text-gold/70">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="font-display text-lg text-foreground">
            {hasAny ? "条件に合う記録がありません" : "最初のセッションを記録しましょう"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {hasAny ? "フィルタを変更してみてください" : "右上の「新規」から登録できます"}
          </p>
        </div>
        {!hasAny && (
          <Link
            href="/sessions/new"
            className="mt-2 inline-flex h-10 items-center rounded-full border border-gold/50 bg-gradient-to-b from-gold/25 to-gold/8 px-5 text-sm font-medium tracking-wide text-gold-bright transition-all hover:from-gold/35 hover:to-gold/15"
          >
            セッションを追加
          </Link>
        )}
      </CardBody>
    </Card>
  );
}

export { formatDateShort };
