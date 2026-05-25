"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import {
  emailToNickname,
  isCloudEnabled,
  useAuth,
  validateNickname,
} from "@/lib/supabase/auth";
import { syncWithCloud, type SyncResult } from "@/lib/supabase/sync";

export function AccountClient() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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
            クラウド機能の設定が見つかりません。
          </p>
        </CardBody>
      </Card>
    );
  }

  if (loading) {
    return <p className="text-center text-sm text-muted">読み込み中...</p>;
  }

  if (user) {
    const displayNickname =
      (user.user_metadata?.nickname as string | undefined) ?? emailToNickname(user.email);

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
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-felt/40 text-gold-bright">
            <span className="font-display text-2xl">♠</span>
          </div>
          <div>
            <p className="font-display text-xl text-foreground">{displayNickname}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-subtle">
              ログイン中
            </p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-felt/15 p-5 text-left">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
              最終同期
            </div>
            <div className="font-numeric mt-1 text-sm text-foreground">
              {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString("ja-JP") : "まだ同期していません"}
            </div>
            <p className="mt-2 text-[11px] text-subtle">
              この端末のデータをクラウドに保存。別の端末から同じニックネームでログイン → 同期を押すと反映されます。
            </p>
            <Button onClick={doSync} disabled={busy} className="mt-4 w-full">
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

          <p className="text-[10px] leading-relaxed text-subtle">
            記録はこの端末に保存され、「今すぐ同期する」を押したぶんがクラウドにバックアップされます。
            別の端末でも同じニックネームでログインすれば、いつでも呼び出せます。
          </p>
        </CardBody>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const nickErr = validateNickname(nickname);
    if (nickErr) {
      setError(nickErr);
      return;
    }
    if (password.length < 4) {
      setError("パスワードは4文字以上にしてください");
      return;
    }
    setBusy(true);
    if (mode === "signin") {
      const { error } = await signIn(nickname, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(nickname, password);
      if (error) setError(error);
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
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "signup" ? "bg-gold/15 text-gold-bright" : "text-muted hover:text-foreground"
            }`}
          >
            新規作成
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="ニックネーム"
            required
            hint={mode === "signup" ? "あとから変えられます" : undefined}
          >
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例: hajime"
              maxLength={32}
              required
              autoComplete="username"
            />
          </Field>
          <Field label="パスワード" required hint="4文字以上">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={4}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </Field>

          {error && (
            <div className="rounded-xl border border-loss/30 bg-loss-bg p-3 text-[12px] text-loss">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" disabled={busy} className="w-full">
            {busy
              ? "処理中..."
              : mode === "signin"
              ? "ログイン"
              : "アカウントを作る"}
          </Button>
        </form>

        <div className="space-y-1.5 rounded-xl border border-border-subtle bg-felt/10 p-3 text-[11px] leading-relaxed text-subtle">
          <p>
            <span className="text-gold-bright">メール登録は不要。</span>ニックネームとパスワードだけではじめられます。
          </p>
          <p>パスワードは忘れないように保管してください。複数の端末で同じ記録を見たいときは、同じニックネームでログインします。</p>
        </div>
      </CardBody>
    </Card>
  );
}
