"use client";

import { toJpy } from "@/lib/currency";
import { getDb } from "./db";
import type { Session, VenuePreset } from "./schema";

export type SessionInput = Omit<
  Session,
  "id" | "pnlJpy" | "pnlLocal" | "createdAt" | "updatedAt"
>;

function computePnl(input: Pick<Session, "buyIn" | "cashOut" | "fxRate" | "reentries">) {
  const totalBuyIn = input.buyIn * (1 + (input.reentries ?? 0));
  const pnlLocal = input.cashOut - totalBuyIn;
  const pnlJpy = toJpy(pnlLocal, input.fxRate);
  return { pnlLocal, pnlJpy };
}

export async function addSession(input: SessionInput): Promise<number> {
  const db = getDb();
  const now = new Date().toISOString();
  const { pnlLocal, pnlJpy } = computePnl(input);
  const id = await db.sessions.add({
    ...input,
    pnlLocal,
    pnlJpy,
    createdAt: now,
    updatedAt: now,
  });
  await rememberVenue(input.country, input.venue);
  return Number(id);
}

export async function updateSession(id: number, input: SessionInput): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  const { pnlLocal, pnlJpy } = computePnl(input);
  await db.sessions.update(id, {
    ...input,
    pnlLocal,
    pnlJpy,
    updatedAt: now,
  });
  await rememberVenue(input.country, input.venue);
}

export async function deleteSession(id: number): Promise<void> {
  const db = getDb();
  await db.sessions.delete(id);
}

export async function getSession(id: number): Promise<Session | undefined> {
  const db = getDb();
  return db.sessions.get(id);
}

export async function listSessions(): Promise<Session[]> {
  const db = getDb();
  return db.sessions.orderBy("playDate").reverse().toArray();
}

export async function rememberVenue(country: VenuePreset["country"], name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const db = getDb();
  const existing = await db.venues.where({ country, name: trimmed }).first();
  const now = new Date().toISOString();
  if (existing?.id) {
    await db.venues.update(existing.id, { lastUsedAt: now });
  } else {
    await db.venues.add({ country, name: trimmed, favorite: 0, lastUsedAt: now });
  }
}

export async function listVenues(): Promise<VenuePreset[]> {
  const db = getDb();
  return db.venues.orderBy("lastUsedAt").reverse().toArray();
}

export async function toggleVenueFavorite(id: number): Promise<void> {
  const db = getDb();
  const v = await db.venues.get(id);
  if (!v) return;
  await db.venues.update(id, { favorite: v.favorite ? 0 : 1 });
}

export async function listFavoriteVenues(): Promise<VenuePreset[]> {
  const db = getDb();
  return db.venues
    .where("favorite")
    .equals(1)
    .toArray()
    .then((list) => list.sort((a, b) => (a.lastUsedAt < b.lastUsedAt ? 1 : -1)));
}

export async function clearAll(): Promise<void> {
  const db = getDb();
  await db.sessions.clear();
  await db.venues.clear();
}

export async function bulkAddSessions(
  rows: Omit<Session, "id">[],
): Promise<{ inserted: number; skipped: number }> {
  if (rows.length === 0) return { inserted: 0, skipped: 0 };
  const db = getDb();
  let inserted = 0;
  let skipped = 0;
  await db.sessions.bulkAdd(
    rows.map((r) => ({ ...r })),
    { allKeys: true },
  ).then((keys) => {
    inserted = keys.length;
  }).catch((err) => {
    if (err?.failures) {
      skipped = err.failures.length;
      inserted = rows.length - err.failures.length;
    } else {
      skipped = rows.length;
    }
  });
  // Best-effort venue learning
  for (const r of rows) {
    if (r.venue) await rememberVenue(r.country, r.venue);
  }
  return { inserted, skipped };
}

export async function exportJson(): Promise<string> {
  const db = getDb();
  const [sessions, venues] = await Promise.all([db.sessions.toArray(), db.venues.toArray()]);
  return JSON.stringify(
    { app: "casino-ledger", version: 1, exportedAt: new Date().toISOString(), sessions, venues },
    null,
    2,
  );
}

export interface BackupSummary {
  sessions: number;
  venues: number;
  oldest: string | null;
  newest: string | null;
}

/** Quick count of what's stored, for the settings/backup screen. */
export async function getBackupSummary(): Promise<BackupSummary> {
  const db = getDb();
  const sessions = await db.sessions.toArray();
  const venues = await db.venues.count();
  let oldest: string | null = null;
  let newest: string | null = null;
  for (const s of sessions) {
    if (!oldest || s.playDate < oldest) oldest = s.playDate;
    if (!newest || s.playDate > newest) newest = s.playDate;
  }
  return { sessions: sessions.length, venues, oldest, newest };
}

/** Build a stable fingerprint so the same play is not restored twice. */
function sessionSignature(s: Pick<Session, "playDate" | "venue" | "currency" | "buyIn" | "cashOut" | "createdAt">): string {
  return [s.playDate, (s.venue ?? "").trim(), s.currency, s.buyIn, s.cashOut, s.createdAt ?? ""].join("|");
}

export interface RestoreResult {
  added: number;
  skipped: number;
  venuesAdded: number;
  error?: string;
}

/**
 * Restore a backup file produced by `exportJson`.
 * Safe by design: rows already present (same play) are skipped, nothing is deleted.
 */
export async function importJsonBackup(text: string): Promise<RestoreResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { added: 0, skipped: 0, venuesAdded: 0, error: "ファイルを読み取れませんでした。書き出したバックアップファイルか確認してください。" };
  }
  const data = parsed as { sessions?: unknown; venues?: unknown };
  if (!data || !Array.isArray(data.sessions)) {
    return { added: 0, skipped: 0, venuesAdded: 0, error: "このファイルはバックアップではないようです。" };
  }

  const db = getDb();
  const existing = await db.sessions.toArray();
  const seen = new Set(existing.map(sessionSignature));

  const now = new Date().toISOString();
  const toAdd: Omit<Session, "id">[] = [];
  let skipped = 0;

  for (const raw of data.sessions as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") {
      skipped += 1;
      continue;
    }
    const r = raw as unknown as Session;
    if (!r.playDate) {
      skipped += 1;
      continue;
    }
    const buyIn = Number(r.buyIn) || 0;
    const cashOut = Number(r.cashOut) || 0;
    const fxRate = Number(r.fxRate) || 1;
    const reentries = r.reentries != null ? Math.max(0, Math.floor(Number(r.reentries))) : null;
    const { pnlLocal, pnlJpy } = computePnl({ buyIn, cashOut, fxRate, reentries });
    const candidate: Omit<Session, "id"> = {
      playDate: r.playDate,
      game: r.game,
      format: r.format,
      country: r.country,
      venue: (r.venue ?? "").toString().trim(),
      currency: r.currency,
      buyIn,
      cashOut,
      fxRate,
      pnlLocal,
      pnlJpy,
      durationMinutes: r.durationMinutes ?? null,
      reentries,
      tourneyTitle: r.tourneyTitle ?? null,
      tourneyPlace: r.tourneyPlace ?? null,
      tourneyEntrants: r.tourneyEntrants ?? null,
      memo: r.memo ?? "",
      createdAt: r.createdAt ?? now,
      updatedAt: now,
      // treat as a fresh local row; cloud links are re-established on next sync
      cloudId: null,
      syncedAt: null,
    };
    const sig = sessionSignature(candidate);
    if (seen.has(sig)) {
      skipped += 1;
      continue;
    }
    seen.add(sig);
    toAdd.push(candidate);
  }

  if (toAdd.length > 0) {
    await db.sessions.bulkAdd(toAdd as Session[]);
  }

  // Restore venue presets (preserve favorites), skipping ones that already exist.
  let venuesAdded = 0;
  if (Array.isArray(data.venues)) {
    for (const raw of data.venues as Record<string, unknown>[]) {
      const v = raw as unknown as VenuePreset;
      const name = (v?.name ?? "").toString().trim();
      if (!name || !v?.country) continue;
      const dup = await db.venues.where({ country: v.country, name }).first();
      if (dup) continue;
      await db.venues.add({
        country: v.country,
        name,
        favorite: v.favorite === 1 ? 1 : 0,
        lastUsedAt: v.lastUsedAt ?? now,
      });
      venuesAdded += 1;
    }
  }

  return { added: toAdd.length, skipped, venuesAdded };
}
