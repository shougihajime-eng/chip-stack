"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { isCloudEnabled, useAuth } from "@/lib/supabase/auth";
import { syncWithCloud, type SyncResult } from "@/lib/supabase/sync";

export function AccountClient() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("chip-stack-last-sync") : null,
  );

  if (!isCloudEnabled()) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-sm text-muted">
            クラウド機能の設定が見つかりません。管理者に連絡してください。
          </p>
        </CardBody>
      </Card>
    );
  }

  if (loading) {
    return <p className="text-center text-sm text-muted">読み込み中...</p>;
  }

  if (user) {
    async function doSync() {
      if (!user) return;
      setBusy(true);
      setSyncResult(null);
      const res = await syncWithCloud(user.id);
      setSyncResult(res);
      if (res.errors.length === 0) {
        const ts = new Date().toISOString();
        localStorage.setItem("chip-stack-last-sync", ts);
        setLastSyncedAt(ts);
      }
      setBusy(false);
    }

    return (
      <Card>
        <CardBody className="space-y-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-felt/40 text-gold-bright mx-auto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
              <path
                d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="font-display text-base text-foreground">{user.email}</p>
            <p className="mt-1 text-[11px] text-subtle">ログイン中</p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-felt/15 p-5 text-left">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
              最終同期
            </div>
            <div className="font-numeric mt-1 text-sm text-foreground">
              {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString("ja-JP") : "未同期"}
            </div>
            <p className="mt-2 text-[11px] text-subtle">
              押すと、このデバイスとクラウドのデータを照合して両方を最新にします。
            </p>
            <Button
              onClick={doSync}
              disabled={busy}
              className="mt-4 w-full"
            >
              {busy ? "同期中..." : "今すぐ同期する"}
            </Button>
          </div>

          {syncResult && (
            <div
              className={`rounded-xl border px-4 py-3 text-left text-[12px] ${
                syncResult.errors.length === 0
                  ? "border-profit/30 bg-profit-bg text-foreground"
                  : "border-loss/30 bg-loss-bg text-foreground"
              }`}
            >
              <div className="font-numeric font-medium">
                ↑ アップロード {syncResult.pushed} 件 / ↓ ダウンロード {syncResult.pulled} 件
              </div>
              {syncResult.errors.length > 0 && (
                <div className="mt-1 text-loss">{syncResult.errors.join(" / ")}</div>
              )}
            </div>
          )}

          <Button variant="ghost" onClick={signOut} className="w-full">
            ログアウト
          </Button>
        </CardBody>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error, needsConfirm } = await signUp(email, password);
      if (error) {
        setError(error);
      } else if (needsConfirm) {
        setNotice("確認メールを送信しました。受信トレイをご確認ください。");
      } else {
        setNotice("アカウントを作成し、ログインしました。");
      }
    }
    setBusy(false);
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <div className="flex gap-2 rounded-xl border border-border bg-surface/40 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
              setNotice(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "signin" ? "bg-gold/15 text-gold-bright" : "text-muted hover:text-foreground"
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
              setNotice(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "signup" ? "bg-gold/15 text-gold-bright" : "text-muted hover:text-foreground"
            }`}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="メールアドレス" required>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </Field>
          <Field label="パスワード" required hint={mode === "signup" ? "6文字以上" : undefined}>
            <Input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </Field>

          {error && (
            <div className="rounded-xl border border-loss/30 bg-loss-bg p-3 text-[12px] text-loss">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-xl border border-gold/30 bg-gold/8 p-3 text-[12px] text-gold-bright">
              {notice}
            </div>
          )}

          <Button type="submit" size="lg" disabled={busy} className="w-full">
            {busy
              ? "処理中..."
              : mode === "signin"
              ? "ログイン"
              : "アカウントを作成"}
          </Button>
        </form>

        <p className="text-center text-[11px] text-subtle">
          {mode === "signin"
            ? "ログインすると、iPhone と PC で同じデータが見られます。"
            : "登録は無料です。メールアドレスでログインできます。"}
        </p>
      </CardBody>
    </Card>
  );
}
