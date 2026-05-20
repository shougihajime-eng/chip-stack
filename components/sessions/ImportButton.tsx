"use client";

import { useRef, useState } from "react";
import { parseSessionsCsv, type ImportPreview } from "@/lib/import";
import { bulkAddSessions } from "@/lib/db/sessions";

export function ImportButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setResult(null);
    try {
      const text = await file.text();
      const p = parseSessionsCsv(text);
      setPreview(p);
    } catch (err) {
      console.error(err);
      setResult("読み込みに失敗しました");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!preview) return;
    setBusy(true);
    try {
      const { inserted, skipped } = await bulkAddSessions(preview.valid);
      setResult(`${inserted} 件を追加しました${skipped ? `（${skipped} 件は失敗）` : ""}`);
      setPreview(null);
    } catch (err) {
      console.error(err);
      setResult("インポートに失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) await handleFile(f);
          e.target.value = ""; // allow re-selecting same file
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="btn-chip inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted transition-colors hover:border-gold/40 hover:text-gold-bright disabled:opacity-50"
        title="CSV ファイルからセッションを取り込む"
      >
        <UploadIcon className="h-3 w-3" />
        取込
      </button>

      {result && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-gold/40 bg-surface-elevated/95 px-4 py-2 text-sm text-gold-bright shadow-2xl sm:bottom-8">
          {result}
          <button
            type="button"
            onClick={() => setResult(null)}
            className="ml-3 text-muted hover:text-foreground"
          >
            ×
          </button>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm animate-overlay-fade-static">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border-strong bg-surface-elevated shadow-2xl">
            <div className="border-b border-border px-6 py-4">
              <h3 className="font-display text-lg text-foreground">CSV を取り込みますか？</h3>
              <p className="mt-1 text-sm text-muted">
                {preview.headerMatched
                  ? "ヘッダー行が一致しました。"
                  : "ヘッダー行が一致しません — 取り込めない可能性があります。"}
              </p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border-subtle text-center">
              <div className="px-6 py-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted">取込予定</div>
                <div className="font-numeric mt-1 text-2xl text-profit">
                  {preview.valid.length}
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted">スキップ</div>
                <div className="font-numeric mt-1 text-2xl text-loss">
                  {preview.invalid.length}
                </div>
              </div>
            </div>
            {preview.invalid.length > 0 && (
              <div className="max-h-40 overflow-y-auto border-t border-border-subtle px-6 py-3">
                <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted">エラー行</div>
                <ul className="space-y-1.5 text-[12px] text-loss">
                  {preview.invalid.slice(0, 8).map((r) => (
                    <li key={r.rowNumber}>
                      <span className="font-numeric text-muted">行 {r.rowNumber}</span>: {r.errors.join("・")}
                    </li>
                  ))}
                  {preview.invalid.length > 8 && (
                    <li className="text-subtle">…他 {preview.invalid.length - 8} 件</li>
                  )}
                </ul>
              </div>
            )}
            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="btn-chip rounded-full border border-border bg-surface/60 px-4 py-2 text-sm text-muted hover:text-foreground"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={busy || preview.valid.length === 0}
                className="btn-chip rounded-full border border-gold/50 bg-gradient-to-b from-gold/25 to-gold/8 px-5 py-2 text-sm font-medium text-gold-bright hover:from-gold/35 disabled:opacity-50"
              >
                {busy ? "取込中..." : `${preview.valid.length} 件を取り込む`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M12 20V8m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 4h16" strokeLinecap="round" />
    </svg>
  );
}
