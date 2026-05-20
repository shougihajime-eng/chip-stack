import { HomeDashboard } from "@/components/home/HomeDashboard";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-8 pb-12 sm:px-8 sm:pt-12">
      <header className="mb-8">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-gold">Dashboard</p>
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          ようこそ、Casino Ledger へ
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          一回ごとの記録が、あなたのカジノの実力を形にしていきます。
        </p>
      </header>
      <HomeDashboard />
    </div>
  );
}
