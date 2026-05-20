import { AccountClient } from "./AccountClient";

export const metadata = { title: "アカウント" };

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-md px-5 pt-8 pb-12 sm:px-8 sm:pt-12">
      <header className="mb-8 text-center">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-gold">Account</p>
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          クラウド同期
        </h1>
        <p className="mt-2 text-sm text-muted">
          ログインすると、iPhone と PC で同じ記録が見られます。
        </p>
      </header>
      <AccountClient />
    </div>
  );
}
