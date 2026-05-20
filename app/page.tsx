import Link from "next/link";
import { HomeDashboard } from "@/components/home/HomeDashboard";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 pt-6 pb-12 sm:px-8 sm:pt-10 xl:px-12">
      <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
            ✦ Tonight at the Table ✦
          </p>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl xl:text-5xl">
            ようこそ、<span className="text-gold-bright">Casino Ledger</span> へ
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted xl:text-base">
            一回ごとの記録が、あなたのカジノの実力を形にしていきます。
          </p>
          <Link
            href="/account"
            className="btn-chip mt-3 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-gold/40 bg-gradient-to-b from-gold/15 to-gold/5 px-3.5 text-[11px] font-medium tracking-wide text-gold-bright transition-colors hover:border-gold/70 hover:from-gold/25 sm:hidden"
            aria-label="クラウドと同期"
            title="クラウドと同期"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
              <path
                d="M7 18h10a4 4 0 0 0 .9-7.9 6 6 0 0 0-11.6-1A4.5 4.5 0 0 0 7 18z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 13v-3M10 12l2-2 2 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            クラウドと同期
          </Link>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="rounded-full border border-border-subtle bg-felt/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gold/80">
            High Stakes Lounge
          </span>
          <span className="font-numeric text-[11px] text-subtle">
            {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
          </span>
        </div>
      </header>
      <HomeDashboard />
    </div>
  );
}
