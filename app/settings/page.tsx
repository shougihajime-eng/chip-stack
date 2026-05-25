import { SettingsClient } from "./SettingsClient";

export const metadata = { title: "設定・データの保管" };

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pt-6 pb-12 sm:px-8 sm:pt-10">
      <header className="mb-8">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
          ✦ Settings &amp; Backup ✦
        </p>
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          設定とデータの保管
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          今月の目標づくりと、大切な記録を守るための場所です。目標の設定・バックアップ（保存）・復元（読み込み）ができます。
        </p>
      </header>
      <SettingsClient />
    </div>
  );
}
