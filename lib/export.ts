"use client";

import type { Session } from "@/lib/db/schema";
import { FORMAT_LABEL, getCountry, getGameLabel } from "@/lib/games";

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
];

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function sessionsToCsv(sessions: Session[]): string {
  const rows = sessions.map((s) => [
    s.playDate,
    getGameLabel(s.game),
    FORMAT_LABEL[s.format],
    getCountry(s.country).label,
    s.venue,
    s.currency,
    s.buyIn,
    s.cashOut,
    s.fxRate,
    s.pnlLocal,
    s.pnlJpy,
    s.durationMinutes ?? "",
    s.tourneyPlace ?? "",
    s.tourneyEntrants ?? "",
    s.memo ?? "",
    new Date(s.createdAt).toLocaleString("ja-JP"),
  ]);

  const all = [HEADERS, ...rows].map((row) => row.map(escapeCsvCell).join(","));
  return all.join("\r\n");
}

export function downloadCsv(sessions: Session[], filename = "casino-ledger.csv"): void {
  const csv = sessionsToCsv(sessions);
  // BOM ensures Excel opens UTF-8 correctly with Japanese
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function suggestFilename(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `casino-ledger-${yyyy}${mm}${dd}.csv`;
}
