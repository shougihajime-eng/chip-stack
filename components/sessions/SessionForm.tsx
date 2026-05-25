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
import {
  addSession,
  deleteSession,
  listFavoriteVenues,
  listVenues,
  toggleVenueFavorite,
  updateSession,
} from "@/lib/db/sessions";
import type { Session } from "@/lib/db/schema";
import { DEFAULT_GOALS, getGoals } from "@/lib/db/goals";
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

const DURATION_PRESETS: { label: string; minutes: number }[] = [
  { label: "1h", minutes: 60 },
  { label: "2h", minutes: 120 },
  { label: "3h", minutes: 180 },
  { label: "4h", minutes: 240 },
  { label: "6h", minutes: 360 },
  { label: "8h", minutes: 480 },
];

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
  const [reentries, setReentries] = useState<string>(initial?.reentries ? String(initial.reentries) : "");
  const [tourneyTitle, setTourneyTitle] = useState<string>(initial?.tourneyTitle ?? "");
  const [place, setPlace] = useState<string>(initial?.tourneyPlace ? String(initial.tourneyPlace) : "");
  const [entrants, setEntrants] = useState<string>(initial?.tourneyEntrants ? String(initial.tourneyEntrants) : "");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [saving, setSaving] = useState(false);
  const [savedPnl, setSavedPnl] = useState<number | null>(null);

  type FxStatus = "idle" | "loading" | FxResult["source"] | "manual";
  const [fxStatus, setFxStatus] = useState<FxStatus>(editing ? "manual" : "idle");
  const [fxFetchedAt, setFxFetchedAt] = useState<string | null>(null);

  const venues = useLiveQuery(() => listVenues(), [], []);
  const favorites = useLiveQuery(() => listFavoriteVenues(), [], []);
  const goals = useLiveQuery(() => getGoals(), [], DEFAULT_GOALS);
  const venueOptions = useMemo(() => {
    const list = (venues ?? []).filter((v) => v.country === country);
    return list.slice(0, 8).map((v) => v.name);
  }, [venues, country]);
  const currentVenueId = useMemo(() => {
    return venues?.find((v) => v.country === country && v.name === venue.trim())?.id;
  }, [venues, country, venue]);
  const currentIsFavorite = useMemo(() => {
    if (!currentVenueId) return false;
    return venues?.find((v) => v.id === currentVenueId)?.favorite === 1;
  }, [venues, currentVenueId]);

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
  const reentryNum = format === "tournament" ? Math.max(0, Math.floor(parseNumber(reentries))) : 0;
  const totalBuyInLocal = buyInNum * (1 + reentryNum);
  const pnlLocal = cashOutNum - totalBuyInLocal;
  const pnlJpy = toJpy(pnlLocal, rateNum || 1);

  const sessionLossCap = goals?.sessionLossCapJpy ?? null;
  const overSessionCap = sessionLossCap != null && pnlJpy < 0 && -pnlJpy > sessionLossCap;

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
      reentries: format === "tournament" ? reentryNum : null,
      tourneyTitle: format === "tournament" && tourneyTitle.trim() ? tourneyTitle.trim() : null,
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
    {(favorites?.length ?? 0) > 0 && (
      <div className="mb-5 rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/5 to-felt/15 px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-gold">
          <span>★</span>
          <span>お気に入りカジノ</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {favorites?.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setCountry(v.country);
                setVenue(v.name);
              }}
              className="btn-chip inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gradient-to-b from-gold/10 to-gold/5 px-3 py-1.5 text-[12px] font-medium tracking-wide text-gold-bright transition-colors hover:border-gold/70 hover:from-gold/20"
            >
              <span className="text-[10px] opacity-80">★</span>
              {v.name}
              <span className="ml-0.5 text-[10px] text-gold/60">·</span>
              <span className="text-[10px] text-gold/60">{v.country}</span>
            </button>
          ))}
        </div>
      </div>
    )}
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
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    list="venue-history"
                    placeholder="例: Wynn Las Vegas"
                    required
                  />
                </div>
                {currentVenueId && (
                  <button
                    type="button"
                    onClick={() => currentVenueId && toggleVenueFavorite(currentVenueId)}
                    title={currentIsFavorite ? "お気に入りから外す" : "お気に入りに追加"}
                    className="btn-chip inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface/50 transition-colors hover:border-gold/50"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 transition-colors ${currentIsFavorite ? "fill-gold text-gold" : "fill-none text-muted"}`}
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path
                        d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.4l-5.3 2.8 1.1-5.9L3.5 9.2l5.9-.8L12 3z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
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
            <Field
              label={format === "tournament" ? "バイイン（1回分）" : "バイイン"}
              hint={c.symbol}
              required
            >
              <NumberInput value={buyIn} onChange={(e) => setBuyIn(e.target.value)} placeholder="0" required />
            </Field>
            <Field label="キャッシュアウト" hint={c.symbol} required>
              <div className="space-y-2">
                <NumberInput
                  value={cashOut}
                  onChange={(e) => setCashOut(e.target.value)}
                  placeholder="0"
                  required
                />
                {format === "tournament" && (
                  <button
                    type="button"
                    onClick={() => setCashOut(cashOutNum === 0 && cashOut !== "" ? "" : "0")}
                    aria-pressed={cashOutNum === 0 && cashOut !== ""}
                    className={
                      cashOutNum === 0 && cashOut !== ""
                        ? "btn-chip inline-flex h-8 items-center gap-1.5 rounded-full border border-loss/60 bg-gradient-to-b from-loss/25 to-loss/5 px-3 text-[11px] font-medium tracking-wide text-loss"
                        : "btn-chip inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-surface/50 px-3 text-[11px] font-medium tracking-wide text-muted hover:border-loss/40 hover:text-loss"
                    }
                  >
                    <span aria-hidden>○</span>
                    ノーマネーフィニッシュ
                  </button>
                )}
              </div>
            </Field>
          </div>

          {format === "tournament" && (
            <Field
              label="リエントリー回数（任意）"
              hint={reentryNum > 0 ? `合計 ${1 + reentryNum} エントリー` : "0 = リエントリーなし"}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setReentries(String(Math.max(0, reentryNum - 1)))
                    }
                    disabled={reentryNum === 0}
                    className="btn-chip grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-surface/50 text-lg text-muted hover:border-gold/50 hover:text-gold-bright disabled:opacity-40"
                    aria-label="リエントリー回数を減らす"
                  >
                    −
                  </button>
                  <NumberInput
                    value={reentries}
                    onChange={(e) => setReentries(e.target.value)}
                    placeholder="0"
                  />
                  <button
                    type="button"
                    onClick={() => setReentries(String(reentryNum + 1))}
                    className="btn-chip grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-surface/50 text-lg text-muted hover:border-gold/50 hover:text-gold-bright"
                    aria-label="リエントリー回数を増やす"
                  >
                    ＋
                  </button>
                </div>
                {reentryNum > 0 && (
                  <p className="text-[11px] text-subtle">
                    実投資額: {c.symbol}
                    {totalBuyInLocal.toLocaleString("en-US", { maximumFractionDigits: 2 })}（{c.symbol}
                    {buyInNum.toLocaleString("en-US", { maximumFractionDigits: 2 })} ×{" "}
                    {1 + reentryNum} エントリー）
                  </p>
                )}
              </div>
            </Field>
          )}

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
            {format === "tournament" && reentryNum > 0 && (
              <p className="mt-1.5 text-[10px] text-subtle">
                計算: {c.symbol}
                {cashOutNum.toLocaleString("en-US", { maximumFractionDigits: 2 })} −{" "}
                {c.symbol}
                {totalBuyInLocal.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </p>
            )}
            {overSessionCap && (
              <p className="mt-3 flex items-start gap-2 rounded-lg border border-loss/30 bg-loss/10 px-3 py-2 text-[12px] leading-relaxed text-loss">
                <span aria-hidden>🫶</span>
                <span>
                  1回の負けの目安（{formatJpy(sessionLossCap!)}）をこえています。記録はこのまま保存できます。
                  無理せず、今日はここでひと息ついても大丈夫です。
                </span>
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          {format === "tournament" && (
            <Field label="大会タイトル（任意）" hint="例: JOPT Main, APT Tokyo Main">
              <Input
                value={tourneyTitle}
                onChange={(e) => setTourneyTitle(e.target.value)}
                placeholder="JOPT Main Event"
                maxLength={80}
              />
            </Field>
          )}

          <Field
            label={`プレイ時間（任意${format === "tournament" ? "・覚えてなくてOK" : ""}）`}
            hint="時給計算に使います"
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <NumberInput
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="180"
                />
                <span className="shrink-0 text-[11px] text-subtle">分</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_PRESETS.map((p) => {
                  const active = parseNumber(duration) === p.minutes;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setDuration(active ? "" : String(p.minutes))}
                      className={
                        active
                          ? "btn-chip h-7 rounded-full border border-gold/50 bg-gradient-to-b from-gold/20 to-gold/5 px-2.5 text-[11px] font-medium tracking-wide text-gold-bright"
                          : "btn-chip h-7 rounded-full border border-border bg-surface/50 px-2.5 text-[11px] tracking-wide text-muted hover:border-gold/40 hover:text-gold-bright"
                      }
                    >
                      {p.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setDuration("")}
                  className="btn-chip h-7 rounded-full border border-border bg-surface/30 px-2.5 text-[11px] text-subtle hover:text-foreground"
                >
                  クリア
                </button>
              </div>
            </div>
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
