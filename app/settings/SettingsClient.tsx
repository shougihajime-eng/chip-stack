"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, NumberInput } from "@/components/ui/Field";
import {
  clearAll,
  exportJson,
  getBackupSummary,
  importJsonBackup,
  listSessions,
  type RestoreResult,
} from "@/lib/db/sessions";
import { DEFAULT_GOALS, getGoals, saveGoals } from "@/lib/db/goals";
import type { MonthlyGoals } from "@/lib/db/schema";
import { downloadText, suggestBackupFilename } from "@/lib/export";

const LAST_BACKUP_KEY = "casino-ledger-last-backup";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function SettingsClient() {
  // `listSessions` keeps the summary live as records change.
  const sessions = useLiveQuery(() => listSessions(), [], undefined);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getBackupSummary>> | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem(LAST_BACKUP_KEY) : null,
  );

  useEffect(() => {
    getBackupSummary().then(setSummary);
  }, [sessions]);

  const count = summary?.sessions ?? 0;
  const sinceBackup = daysSince(lastBackup);
  const needsBackup = count > 0 && (lastBackup === null || (sinceBackup ?? 0) >= 7);

  return (
    <div className="space-y-6">
      {needsBackup && <BackupReminder lastBackup={lastBackup} />}

      <GoalsCard />

      <StoredDataCard summary={summary} loading={summary === null} />

      <BackupCard
        count={count}
        lastBackup={lastBackup}
        onBackedUp={(ts) => setLastBackup(ts)}
      />

      <RestoreCard />

      <CloudCard />

      <DangerCard count={count} />

      <p className="px-1 pt-2 text-center text-[11px] leading-relaxed text-subtle">
        記録はこの端末（ブラウザ）の中に保存されます。サーバーには自動送信されません。<br className="hidden sm:block" />
        端末を変える・機種変更する前には、必ずバックアップを保存してください。
      </p>
    </div>
  );
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[, 、￥¥]/g, "");
  if (cleaned.trim() === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function GoalsCard() {
  // Load saved goals first, then mount the form initialised from them.
  // (Keeps the form free of seed-from-effect logic, which the lint rule forbids.)
  const goals = useLiveQuery(() => getGoals(), [], undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>今月の目標と見守り</CardTitle>
        <span className="text-[11px] text-subtle">決めなくてもOK</span>
      </CardHeader>
      {goals === undefined ? (
        <CardBody>
          <p className="text-sm text-muted">読み込み中...</p>
        </CardBody>
      ) : (
        <GoalsForm goals={goals} />
      )}
    </Card>
  );
}

function GoalsForm({ goals }: { goals: MonthlyGoals }) {
  const [target, setTarget] = useState(goals.targetJpy != null ? String(goals.targetJpy) : "");
  const [monthCap, setMonthCap] = useState(
    goals.monthlyLossCapJpy != null ? String(goals.monthlyLossCapJpy) : "",
  );
  const [sessionCap, setSessionCap] = useState(
    goals.sessionLossCapJpy != null ? String(goals.sessionLossCapJpy) : "",
  );
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function edit(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setDone(false);
    };
  }

  async function handleSave() {
    setBusy(true);
    setDone(false);
    await saveGoals({
      targetJpy: parseAmount(target),
      monthlyLossCapJpy: parseAmount(monthCap),
      sessionLossCapJpy: parseAmount(sessionCap),
    });
    setBusy(false);
    setDone(true);
  }

  async function handleClear() {
    setTarget("");
    setMonthCap("");
    setSessionCap("");
    setBusy(true);
    await saveGoals(DEFAULT_GOALS);
    setBusy(false);
    setDone(true);
  }

  return (
    <CardBody className="space-y-5">
      <p className="text-[13px] leading-relaxed text-muted">
        「今月いくら勝ちたい」を決めると、ホームでがんばりが見える化されます。
        負けの上限を決めておくと、近づいたときにやさしくお知らせします（使いすぎ見守り）。
        <span className="text-foreground">入れた項目だけ</span>がホームに出ます。空欄のままでも大丈夫です。
      </p>

      <Field label="今月の勝ち目標" hint="¥ ・ 例: 50000">
        <NumberInput
          value={target}
          onChange={edit(setTarget)}
          placeholder="（決めない）"
          inputMode="numeric"
        />
      </Field>

      <Field label="1か月の負けの上限（見守り）" hint="¥ ・ 例: 30000">
        <NumberInput
          value={monthCap}
          onChange={edit(setMonthCap)}
          placeholder="（決めない）"
          inputMode="numeric"
        />
      </Field>

      <Field label="1回の負けの上限（見守り）" hint="¥ ・ 例: 20000">
        <NumberInput
          value={sessionCap}
          onChange={edit(setSessionCap)}
          placeholder="（決めない）"
          inputMode="numeric"
        />
      </Field>
      <p className="-mt-2 text-[11px] leading-relaxed text-subtle">
        1回の上限は、セッションを記録するときに負けがこれをこえると、入力画面でそっとお知らせします。
      </p>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button onClick={handleSave} disabled={busy} size="lg" className="flex-1">
          {busy ? "保存中..." : "目標を保存"}
        </Button>
        <Button onClick={handleClear} variant="ghost" size="lg" disabled={busy} className="sm:flex-none">
          すべて空にする
        </Button>
      </div>
      {done && (
        <p className="rounded-xl border border-profit/30 bg-profit-bg px-4 py-3 text-[12px] text-foreground">
          ✓ 目標を保存しました。ホーム画面でいつでも確認できます。
        </p>
      )}
    </CardBody>
  );
}

function BackupReminder({ lastBackup }: { lastBackup: string | null }) {
  const days = daysSince(lastBackup);
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/12 to-felt/15 px-4 py-3.5">
      <span className="mt-0.5 text-lg" aria-hidden>
        💡
      </span>
      <div>
        <p className="text-[13px] font-medium text-gold-bright">バックアップをおすすめします</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
          {lastBackup === null
            ? "まだ一度もバックアップを保存していません。"
            : `前回のバックアップから ${days} 日が経ちました。`}
          下の「バックアップを保存」で、大切な記録をファイルに残しておきましょう。
        </p>
      </div>
    </div>
  );
}

function StoredDataCard({
  summary,
  loading,
}: {
  summary: Awaited<ReturnType<typeof getBackupSummary>> | null;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>この端末の記録</CardTitle>
      </CardHeader>
      <CardBody>
        {loading ? (
          <p className="text-sm text-muted">読み込み中...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Stat label="セッション" value={`${summary?.sessions ?? 0} 件`} />
            <Stat label="カジノ・店舗" value={`${summary?.venues ?? 0} 件`} />
            <Stat
              label="いちばん古い記録"
              value={summary?.oldest ? formatDate(summary.oldest) : "—"}
            />
            <Stat
              label="いちばん新しい記録"
              value={summary?.newest ? formatDate(summary.newest) : "—"}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-felt/15 px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="font-numeric mt-1 text-base text-foreground">{value}</p>
    </div>
  );
}

function BackupCard({
  count,
  lastBackup,
  onBackedUp,
}: {
  count: number;
  lastBackup: string | null;
  onBackedUp: (ts: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleBackup() {
    setBusy(true);
    setDone(false);
    try {
      const json = await exportJson();
      downloadText(json, suggestBackupFilename());
      const ts = new Date().toISOString();
      localStorage.setItem(LAST_BACKUP_KEY, ts);
      onBackedUp(ts);
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>バックアップ（保存）</CardTitle>
        <span className="text-[11px] text-subtle">
          最後の保存: {lastBackup ? formatDate(lastBackup) : "なし"}
        </span>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-[13px] leading-relaxed text-muted">
          すべての記録を 1 つのファイル（バックアップ）に書き出して、端末に保存します。
          このファイルがあれば、機種変更やデータ消失のときも記録を取り戻せます。
        </p>
        <Button onClick={handleBackup} disabled={busy || count === 0} size="lg" className="w-full">
          {busy ? "保存中..." : "バックアップを保存"}
        </Button>
        {count === 0 && (
          <p className="text-[11px] text-subtle">記録がまだありません。1件追加すると保存できます。</p>
        )}
        {done && (
          <p className="rounded-xl border border-profit/30 bg-profit-bg px-4 py-3 text-[12px] text-foreground">
            ✓ バックアップファイルを保存しました。スマホの場合は「ファイル」アプリやダウンロードフォルダに入ります。大切に保管してください。
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function RestoreCard() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RestoreResult | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      const text = await file.text();
      const res = await importJsonBackup(text);
      setResult(res);
    } catch {
      setResult({ added: 0, skipped: 0, venuesAdded: 0, error: "ファイルの読み込みに失敗しました。" });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>復元（読み込み）</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-[13px] leading-relaxed text-muted">
          以前に保存したバックアップファイルを読み込みます。
          <span className="text-foreground">今ある記録はそのまま残り</span>
          、足りない記録だけが追加されます（同じ記録は自動でスキップ）。
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFile}
          className="hidden"
        />
        <Button
          variant="secondary"
          size="lg"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full"
        >
          {busy ? "読み込み中..." : "バックアップファイルを選ぶ"}
        </Button>
        {result && (
          <div
            className={`rounded-xl border px-4 py-3 text-[12px] ${
              result.error
                ? "border-loss/30 bg-loss-bg text-loss"
                : "border-profit/30 bg-profit-bg text-foreground"
            }`}
          >
            {result.error ? (
              result.error
            ) : (
              <>
                ✓ {result.added} 件の記録を復元しました。
                {result.skipped > 0 && `（${result.skipped} 件はすでにあったのでスキップ）`}
                {result.venuesAdded > 0 && ` カジノ ${result.venuesAdded} 件も追加。`}
                {result.added === 0 && result.skipped === 0 && "新しく追加する記録はありませんでした。"}
              </>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function CloudCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>クラウド同期（複数の端末で使う）</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-[13px] leading-relaxed text-muted">
          ログインすると、スマホとパソコンなど複数の端末で同じ記録を見られます。
          自動のバックアップ場所としても安心です。
        </p>
        <Link href="/account">
          <Button variant="secondary" size="lg" className="w-full">
            クラウド同期を開く
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
}

function DangerCard({ count }: { count: number }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleDelete() {
    setBusy(true);
    await clearAll();
    setBusy(false);
    setConfirming(false);
    setDone(true);
  }

  return (
    <Card className="border-loss/25">
      <CardHeader>
        <CardTitle className="text-loss/90">取り扱い注意</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-[13px] leading-relaxed text-muted">
          この端末のすべての記録を消します。<span className="text-loss">元に戻せません。</span>
          先に上で「バックアップを保存」しておくことを強くおすすめします。
        </p>

        {done ? (
          <p className="rounded-xl border border-border-subtle bg-felt/15 px-4 py-3 text-[12px] text-muted">
            この端末の記録を削除しました。
          </p>
        ) : !confirming ? (
          <Button
            variant="danger"
            size="lg"
            onClick={() => setConfirming(true)}
            disabled={count === 0}
            className="w-full"
          >
            すべてのデータを削除
          </Button>
        ) : (
          <div className="space-y-3 rounded-xl border border-loss/40 bg-loss-bg p-4">
            <p className="text-[13px] font-medium text-foreground">
              本当に {count} 件の記録をすべて削除しますか？
            </p>
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button variant="danger" size="lg" onClick={handleDelete} disabled={busy} className="flex-1">
                {busy ? "削除中..." : "はい、削除します"}
              </Button>
              <Button variant="ghost" size="lg" onClick={() => setConfirming(false)} className="flex-1">
                やめる
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
