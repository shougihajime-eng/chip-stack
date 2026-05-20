"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";

import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ChipDrop } from "@/components/ui/ChipDrop";
import { Field, Input, NumberInput, Select, Textarea } from "@/components/ui/Field";
import { Money } from "@/components/ui/Money";
import { CURRENCIES, type CurrencyCode, formatJpy, getCurrency, toJpy } from "@/lib/currency";
import { COUNTRIES, type Country, GAMES, type GameCategory, type SessionFormat } from "@/lib/games";
import { addSession, deleteSession, listVenues, updateSession } from "@/lib/db/sessions";
import type { Session } from "@/lib/db/schema";
import { todayIsoDate } from "@/lib/utils";
import { getFxRate, type FxResult } from "@/lib/fx";

interface Props {
  initial?: Session;
}

const parseNumber = (raw: string): number => {
  const cleaned = raw.replace(/[, ]/g, "").replace(/[、]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

export function SessionForm({ initial }: Props) {
  const router = useRouter();
  const editing = !!initial?.id;

  const [playDate, setPlayDate] = useState(initial?.playDate ?? todayIsoDate());
  const [game, setGame] = useState<GameCategory>(initial?.game ?? "poker_nlh");
  const [format, setFormat] = useState<SessionFormat>(initial?.format ?? "cash");
  const [country, setCountry] = useState<Country>(initial?.country ?? "JP");
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [currency, setCurrency] = useState<CurrencyCode>(initial?.currency ?? "JPY");
  const [buyIn, setBuyIn] = useState<string>(initial ? String(initial.buyIn) : "");
  const [cashOut, setCashOut] = useState<string>(initial ? String(initial.cashOut) : "");
  const [fxRate, setFxRate] = useState<string>(initial ? String(initial.fxRate) : "1");
  const [duration, setDuration] = useState<string>(initial?.durationMinutes ? String(initial.durationMinutes) : "");
  const [place, setPlace] = useState<string>(initial?.tourneyPlace ? String(initial.tourneyPlace) : "");
  const [entrants, setEntrants] = useState<string>(initial?.tourneyEntrants ? String(initial.tourneyEntrants) : "");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [saving, setSaving] = useState(false);
  const [savedPnl, setSavedPnl] = useState<number | null>(null);

  type FxStatus = "idle" | "loading" | FxResult["source"] | "manual";
  const [fxStatus, setFxStatus] = useState<FxStatus>(editing ? "manual" : "idle");
  const [fxFetchedAt, setFxFetchedAt] = useState<string | null>(null);

  const venues = useLiveQuery(() => listVenues(), [], []);
  const venueOptions = useMemo(() => {
    const list = (venues ?? []).filter((v) => v.country === country);
    return list.slice(0, 8).map((v) => v.name);
  }, [venues, country]);

  // Auto-fetch FX rate when currency changes to non-JPY (and not in edit mode)
  useEffect(() => {
    if (currency === "JPY") {
      setFxRate("1");
      setFxStatus("idle");
      setFxFetchedAt(null);
      return;
    }
    if (editing) {
      // For existing sessions, keep the stored rate; mark as manual
      setFxStatus("manual");
      return;
    }
    let cancelled = false;
    setFxStatus("loading");
    getFxRate(currency).then((res) => {
      if (cancelled) return;
      setFxRate(res.rate.toFixed(4));
      setFxStatus(res.source);
      setFxFetchedAt(res.fetchedAt ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [currency, editing]);

  async function refreshFx() {
    if (currency === "JPY") return;
    setFxStatus("loading");
    const res = await getFxRate(currency, { force: true });
    setFxRate(res.rate.toFixed(4));
    setFxStatus(res.source);
    setFxFetchedAt(res.fetchedAt ?? null);
  }

  const buyInNum = parseNumber(buyIn);
  const cashOutNum = parseNumber(cashOut);
  const rateNum = parseNumber(fxRate);
  const pnlLocal = cashOutNum - buyInNum;
  const pnlJpy = toJpy(pnlLocal, rateNum || 1);

  const canSave = playDate && venue.trim() && buyIn !== "" && cashOut !== "" && rateNum > 0 && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);

    const data = {
      playDate,
      game,
      format,
      country,
      venue: venue.trim(),
      currency,
      buyIn: buyInNum,
      cashOut: cashOutNum,
      fxRate: rateNum,
      durationMinutes: duration ? parseNumber(duration) : null,
      tourneyPlace: format === "tournament" && place ? parseNumber(place) : null,
      tourneyEntrants: format === "tournament" && entrants ? parseNumber(entrants) : null,
      memo: memo.trim(),
    };

    try {
      if (editing && initial?.id) {
        await updateSession(initial.id, data);
      } else {
        await addSession(data);
      }
      setSavedPnl(pnlJpy);
      // Let the chip-drop animation play, then navigate
      setTimeout(() => router.push("/sessions"), 950);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing || !initial?.id) return;
    if (!confirm("このセッションを削除します。よろしいですか？")) return;
    await deleteSession(initial.id);
    router.push("/sessions");
  }

  const c = getCurrency(currency);

  return (
    <>
    {savedPnl !== null && <ChipDrop amount={savedPnl} />}
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card>
        <CardBody className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="プレイ日" required>
              <Input type="date" value={playDate} onChange={(e) => setPlayDate(e.target.value)} required />
            </Field>
            <Field label="形式" required>
              <div className="grid grid-cols-2 gap-2">
                <FormatToggle value="cash" current={format} onChange={setFormat} label="キャッシュ" />
                <FormatToggle value="tournament" current={format} onChange={setFormat} label="トーナメント" />
              </div>
            </Field>
          </div>

          <Field label="ゲーム" required>
            <Select value={game} onChange={(e) => setGame(e.target.value as GameCategory)}>
              <optgroup label="ポーカー">
                {GAMES.filter((g) => g.group === "poker").map((g) => (
                  <option key={g.code} value={g.code}>
                    {g.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="テーブルゲーム">
                {GAMES.filter((g) => g.group === "table").map((g) => (
                  <option key={g.code} value={g.code}>
                    {g.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="その他">
                {GAMES.filter((g) => g.group === "other").map((g) => (
                  <option key={g.code} value={g.code}>
                    {g.label}
                  </option>
                ))}
              </optgroup>
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="国" required>
              <Select value={country} onChange={(e) => setCountry(e.target.value as Country)}>
                {COUNTRIES.map((co) => (
                  <option key={co.code} value={co.code}>
                    {co.flag} {co.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="カジノ・店舗名" required hint={venueOptions.length ? "履歴から選べます" : undefined}>
              <Input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                list="venue-history"
                placeholder="例: Wynn Las Vegas"
                required
              />
              {venueOptions.length > 0 && (
                <datalist id="venue-history">
                  {venueOptions.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              )}
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <Field label="通貨" required>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
              {CURRENCIES.map((cur) => (
                <option key={cur.code} value={cur.code}>
                  {cur.flag} {cur.code} — {cur.label}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="バイイン" hint={c.symbol} required>
              <NumberInput value={buyIn} onChange={(e) => setBuyIn(e.target.value)} placeholder="0" required />
            </Field>
            <Field label="キャッシュアウト" hint={c.symbol} required>
              <NumberInput value={cashOut} onChange={(e) => setCashOut(e.target.value)} placeholder="0" required />
            </Field>
          </div>

          {currency !== "JPY" && (
            <Field
              label={`為替レート (1 ${currency} = JPY)`}
              required
              hint={
                fxStatus === "loading"
                  ? "取得中..."
                  : fxStatus === "live"
                  ? `自動取得${fxFetchedAt ? ` ${new Date(fxFetchedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}` : ""}`
                  : fxStatus === "cache"
                  ? "本日のキャッシュ"
                  : fxStatus === "fallback"
                  ? "取得失敗・既定値"
                  : fxStatus === "manual"
                  ? "手動入力"
                  : undefined
              }
            >
              <div className="flex items-center gap-2">
                <NumberInput
                  value={fxRate}
                  onChange={(e) => {
                    setFxRate(e.target.value);
                    setFxStatus("manual");
                  }}
                  placeholder={String(c.defaultRate)}
                  required
                />
                <button
                  type="button"
                  onClick={refreshFx}
                  disabled={fxStatus === "loading"}
                  title="最新の為替レートを取得"
                  className="btn-chip inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface/50 text-muted transition-colors hover:border-gold/50 hover:text-gold-bright disabled:opacity-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className={`h-4 w-4 ${fxStatus === "loading" ? "animate-spin" : ""}`}
                  >
                    <path
                      d="M3.5 12a8.5 8.5 0 0 1 14.2-6.3M20.5 12a8.5 8.5 0 0 1-14.2 6.3"
                      strokeLinecap="round"
                    />
                    <path d="M17.5 3v3h-3M6.5 21v-3h3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </Field>
          )}

          <div className="rounded-xl border border-border-subtle bg-felt/20 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">収支</span>
              <span className="font-numeric text-xs text-subtle">
                {currency !== "JPY" && pnlLocal !== 0 && (
                  <>
                    {c.symbol}
                    {pnlLocal.toLocaleString("en-US", { maximumFractionDigits: 2 })} ×{" "}
                  </>
                )}
                {currency !== "JPY" && `rate ${rateNum}`}
              </span>
            </div>
            <div className="mt-1.5">
              <Money amount={pnlJpy} size="xl" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <Field label="プレイ時間（分・任意）" hint="時給計算に使います">
            <NumberInput value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="180" />
          </Field>

          {format === "tournament" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="順位（任意）">
                <NumberInput value={place} onChange={(e) => setPlace(e.target.value)} placeholder="12" />
              </Field>
              <Field label="参加人数（任意）">
                <NumberInput value={entrants} onChange={(e) => setEntrants(e.target.value)} placeholder="240" />
              </Field>
            </div>
          )}

          <Field label="メモ（任意）">
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="ハンドの気づき、反省、ハイライトなど"
            />
          </Field>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-start">
        <Button type="submit" size="lg" disabled={!canSave} className="sm:min-w-44">
          {saving ? "保存中..." : editing ? "更新する" : "セッションを保存"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
          className="sm:min-w-32"
        >
          キャンセル
        </Button>
        {editing && (
          <Button type="button" variant="danger" size="lg" onClick={handleDelete} className="sm:mr-auto sm:min-w-32">
            削除
          </Button>
        )}
      </div>

      <p className="px-1 pt-2 text-center text-[11px] tracking-wide text-subtle sm:text-left">
        {editing
          ? `保存日時: ${initial?.createdAt ? new Date(initial.createdAt).toLocaleString("ja-JP") : "-"}`
          : `JPY 換算額: ${formatJpy(pnlJpy)} （バイイン ${c.symbol}${buyInNum} / キャッシュアウト ${c.symbol}${cashOutNum}）`}
      </p>
    </form>
    </>
  );
}

function FormatToggle({
  value,
  current,
  onChange,
  label,
}: {
  value: SessionFormat;
  current: SessionFormat;
  onChange: (v: SessionFormat) => void;
  label: string;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={
        active
          ? "h-11 rounded-xl border border-gold/50 bg-gradient-to-b from-gold/20 to-gold/5 text-[14px] font-medium text-gold-bright"
          : "h-11 rounded-xl border border-border bg-surface/40 text-[14px] text-muted hover:text-foreground"
      }
    >
      {label}
    </button>
  );
}
