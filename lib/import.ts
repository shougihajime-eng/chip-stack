"use client";

import { type CurrencyCode, CURRENCIES } from "@/lib/currency";
import { COUNTRIES, type Country, FORMAT_LABEL, GAMES, type GameCategory, type SessionFormat } from "@/lib/games";
import type { Session } from "@/lib/db/schema";

const HEADERS = [
  "日付",
  "ゲーム",
  "形式",
  "国",
  "カジノ・店舗",
  "通貨",
  "バイイン",
  "キャッシュアウト",
  "為替レート",
  "収支(現地)",
  "収支(JPY)",
  "プレイ時間(分)",
  "順位",
  "参加人数",
  "メモ",
  "記録日時",
  "大会タイトル",
  "リエントリー回数",
] as const;

/**
 * Parse a CSV string into rows of cells. Handles quoted fields, escaped quotes ("").
 */
export function parseCsv(text: string): string[][] {
  // Strip BOM if present
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i += 1;
      continue;
    }
    cell += ch;
    i += 1;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function findGameCode(label: string): GameCategory {
  const found = GAMES.find((g) => g.label === label);
  return found?.code ?? "other";
}

function findFormatCode(label: string): SessionFormat {
  if (FORMAT_LABEL.tournament === label) return "tournament";
  return "cash";
}

function findCountryCode(label: string): Country {
  const found = COUNTRIES.find((c) => c.label === label);
  return found?.code ?? "OTHER";
}

function findCurrencyCode(label: string): CurrencyCode {
  const u = label.trim().toUpperCase();
  const found = CURRENCIES.find((c) => c.code === u);
  return found?.code ?? "JPY";
}

function num(value: string): number {
  const n = parseFloat(value.replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function nullableNum(value: string | undefined): number | null {
  if (!value || !value.trim()) return null;
  return num(value);
}

export interface ImportRow extends Omit<Session, "id"> {
  /** original row index (1-based, excluding header) */
  rowNumber: number;
  errors: string[];
}

export interface ImportPreview {
  total: number;
  valid: ImportRow[];
  invalid: ImportRow[];
  headerMatched: boolean;
}

/**
 * Parse CSV text into Session rows ready to insert.
 * Format matches the export from `lib/export.ts`.
 */
export function parseSessionsCsv(text: string): ImportPreview {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return { total: 0, valid: [], invalid: [], headerMatched: false };
  }

  const header = rows[0];
  const headerMatched =
    header.length >= HEADERS.length &&
    HEADERS.every((h, i) => header[i] === h);

  const valid: ImportRow[] = [];
  const invalid: ImportRow[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const r = rows[i];
    if (r.every((c) => c.trim() === "")) continue; // skip blank rows
    const errors: string[] = [];

    const [playDate, gameLabel, formatLabel, countryLabel, venue, currencyLabel, buyInS, cashOutS, fxRateS, , , durationS, placeS, entrantsS, memo, createdAtS, tourneyTitleS, reentriesS] = r;

    if (!playDate || !/^\d{4}-\d{2}-\d{2}/.test(playDate)) errors.push("日付の形式が正しくありません");
    if (!venue) errors.push("カジノ・店舗名が空です");

    const buyIn = num(buyInS ?? "0");
    const cashOut = num(cashOutS ?? "0");
    const fxRate = num(fxRateS ?? "1") || 1;
    const reentries = Math.max(0, Math.floor(num(reentriesS ?? "0")));
    const totalBuyIn = buyIn * (1 + reentries);
    const pnlLocal = cashOut - totalBuyIn;
    const pnlJpy = Math.round(pnlLocal * fxRate);

    const now = new Date().toISOString();
    let createdAt = now;
    if (createdAtS) {
      const parsed = new Date(createdAtS);
      if (!isNaN(parsed.getTime())) createdAt = parsed.toISOString();
    }

    const row: ImportRow = {
      rowNumber: i,
      errors,
      playDate,
      game: findGameCode(gameLabel ?? ""),
      format: findFormatCode(formatLabel ?? ""),
      country: findCountryCode(countryLabel ?? ""),
      venue: (venue ?? "").trim(),
      currency: findCurrencyCode(currencyLabel ?? "JPY"),
      buyIn,
      cashOut,
      fxRate,
      pnlLocal,
      pnlJpy,
      durationMinutes: nullableNum(durationS),
      reentries: reentries > 0 ? reentries : null,
      tourneyTitle: tourneyTitleS && tourneyTitleS.trim() ? tourneyTitleS.trim() : null,
      tourneyPlace: nullableNum(placeS),
      tourneyEntrants: nullableNum(entrantsS),
      memo: memo ?? "",
      createdAt,
      updatedAt: now,
    };

    if (errors.length === 0) {
      valid.push(row);
    } else {
      invalid.push(row);
    }
  }

  return { total: valid.length + invalid.length, valid, invalid, headerMatched };
}
