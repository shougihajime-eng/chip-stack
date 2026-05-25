"use client";

import Dexie, { type EntityTable } from "dexie";
import type { AppSetting, Session, VenuePreset } from "./schema";

export class CasinoLedgerDB extends Dexie {
  sessions!: EntityTable<Session, "id">;
  venues!: EntityTable<VenuePreset, "id">;
  settings!: EntityTable<AppSetting, "key">;

  constructor() {
    super("casino_ledger");
    this.version(1).stores({
      sessions: "++id, playDate, game, format, country, currency, pnlJpy, createdAt",
      venues: "++id, country, name, favorite, lastUsedAt",
    });
    this.version(2).stores({
      sessions: "++id, playDate, game, format, country, currency, pnlJpy, createdAt, cloudId, syncedAt",
      venues: "++id, country, name, favorite, lastUsedAt",
    });
    // v3: add tourney_title + reentries (non-indexed fields; just bumps schema for type safety)
    this.version(3).stores({
      sessions: "++id, playDate, game, format, country, currency, pnlJpy, createdAt, cloudId, syncedAt",
      venues: "++id, country, name, favorite, lastUsedAt",
    }).upgrade(async (tx) => {
      await tx.table("sessions").toCollection().modify((s) => {
        if (s.reentries == null) s.reentries = 0;
        if (s.tourneyTitle == null) s.tourneyTitle = null;
      });
    });
    // v4: add a key-value settings table for monthly goals (existing data untouched)
    this.version(4).stores({
      sessions: "++id, playDate, game, format, country, currency, pnlJpy, createdAt, cloudId, syncedAt",
      venues: "++id, country, name, favorite, lastUsedAt",
      settings: "key",
    });
  }
}

let _db: CasinoLedgerDB | null = null;

export function getDb(): CasinoLedgerDB {
  if (typeof window === "undefined") {
    throw new Error("DB is only available on the client.");
  }
  if (!_db) {
    _db = new CasinoLedgerDB();
  }
  return _db;
}
