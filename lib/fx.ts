"use client";

import { type CurrencyCode, getCurrency } from "@/lib/currency";

interface CachedRate {
  rate: number;
  fetchedAt: string;
  date: string;
}

const STORAGE_PREFIX = "fx_rate_v1_";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function cacheKey(currency: CurrencyCode): string {
  return `${STORAGE_PREFIX}${currency}`;
}

function readCache(currency: CurrencyCode): CachedRate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(currency));
    if (!raw) return null;
    return JSON.parse(raw) as CachedRate;
  } catch {
    return null;
  }
}

function writeCache(currency: CurrencyCode, rate: number) {
  if (typeof window === "undefined") return;
  const entry: CachedRate = {
    rate,
    fetchedAt: new Date().toISOString(),
    date: todayKey(),
  };
  try {
    localStorage.setItem(cacheKey(currency), JSON.stringify(entry));
  } catch {
    // ignore quota errors
  }
}

export type FxResult = {
  rate: number;
  source: "cache" | "live" | "fallback";
  fetchedAt?: string;
};

/**
 * Fetches the current rate for converting 1 unit of `currency` to JPY.
 * Uses open.er-api.com (free, no API key, supports TWD/KRW etc.).
 * Same-day responses are cached in localStorage.
 */
export async function getFxRate(
  currency: CurrencyCode,
  opts: { force?: boolean } = {},
): Promise<FxResult> {
  if (currency === "JPY") return { rate: 1, source: "live" };

  if (!opts.force) {
    const cached = readCache(currency);
    if (cached && cached.date === todayKey()) {
      return { rate: cached.rate, source: "cache", fetchedAt: cached.fetchedAt };
    }
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${currency}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { rates?: Record<string, number>; result?: string };
    if (data.result && data.result !== "success") throw new Error("result not success");
    const jpy = data.rates?.JPY;
    if (typeof jpy !== "number" || !Number.isFinite(jpy) || jpy <= 0) {
      throw new Error("invalid rate");
    }
    writeCache(currency, jpy);
    return { rate: jpy, source: "live", fetchedAt: new Date().toISOString() };
  } catch (err) {
    console.warn("FX fetch failed:", err);
    const cached = readCache(currency);
    if (cached) {
      return { rate: cached.rate, source: "cache", fetchedAt: cached.fetchedAt };
    }
    return { rate: getCurrency(currency).defaultRate, source: "fallback" };
  }
}
