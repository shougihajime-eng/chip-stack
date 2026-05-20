import type { CurrencyCode } from "@/lib/currency";
import type { Country, GameCategory, SessionFormat } from "@/lib/games";

export interface Session {
  id?: number;
  /** ISO date string (YYYY-MM-DD) — when the play happened */
  playDate: string;
  game: GameCategory;
  format: SessionFormat;
  country: Country;
  venue: string;
  currency: CurrencyCode;
  /** amount put in PER ENTRY, in the local currency (tournament: one buy-in's worth) */
  buyIn: number;
  /** amount cashed out, in the local currency */
  cashOut: number;
  /** local rate: 1 unit of currency in JPY */
  fxRate: number;
  /** computed: (cashOut − buyIn × (1 + reentries)) × fxRate, in JPY (rounded) */
  pnlJpy: number;
  /** computed: cashOut − buyIn × (1 + reentries) in local currency */
  pnlLocal: number;
  /** play duration in minutes (optional) */
  durationMinutes?: number | null;
  /** tournament-only: number of re-entries (0 = no re-entry, 1 = bought in twice total) */
  reentries?: number | null;
  /** tournament-only: event title (e.g. "JOPT Main", "APT Tokyo Main") */
  tourneyTitle?: string | null;
  /** tournament-only: finishing position */
  tourneyPlace?: number | null;
  /** tournament-only: total entrants */
  tourneyEntrants?: number | null;
  memo?: string;
  createdAt: string;
  updatedAt: string;
  /** Supabase row UUID — set after first cloud sync */
  cloudId?: string | null;
  /** ISO timestamp of last successful push to cloud */
  syncedAt?: string | null;
}

export interface VenuePreset {
  id?: number;
  country: Country;
  name: string;
  favorite: 0 | 1;
  lastUsedAt: string;
}
