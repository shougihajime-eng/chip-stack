"use client";

import Dexie, { type EntityTable } from "dexie";
import type { Session, VenuePreset } from "./schema";

export class CasinoLedgerDB extends Dexie {
  sessions!: EntityTable<Session, "id">;
  venues!: EntityTable<VenuePreset, "id">;

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
