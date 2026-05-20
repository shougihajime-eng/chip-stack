"use client";

import { toJpy } from "@/lib/currency";
import { getDb } from "./db";
import type { Session, VenuePreset } from "./schema";

export type SessionInput = Omit<
  Session,
  "id" | "pnlJpy" | "pnlLocal" | "createdAt" | "updatedAt"
>;

function computePnl(input: Pick<Session, "buyIn" | "cashOut" | "fxRate">) {
  const pnlLocal = input.cashOut - input.buyIn;
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
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), sessions, venues }, null, 2);
}
