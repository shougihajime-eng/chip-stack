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
  /** amount put in, in the local currency */
  buyIn: number;
  /** amount cashed out, in the local currency */
  cashOut: number;
  /** local rate: 1 unit of currency in JPY */
  fxRate: number;
  /** computed: (cashOut − buyIn) × fxRate, in JPY (rounded) */
  pnlJpy: number;
  /** computed: cashOut − buyIn in local currency */
  pnlLocal: number;
  /** play duration in minutes (optional) */
  durationMinutes?: number | null;
  /** tournament-only: finishing position */
  tourneyPlace?: number | null;
  /** tournament-only: total entrants */
  tourneyEntrants?: number | null;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VenuePreset {
  id?: number;
  country: Country;
  name: string;
  favorite: 0 | 1;
  lastUsedAt: string;
}
