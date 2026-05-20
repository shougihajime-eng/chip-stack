import Link from "next/link";
import { SessionList } from "@/components/sessions/SessionList";

export const metadata = { title: "セッション一覧" };

export default function SessionsPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 pt-6 pb-12 sm:px-8 sm:pt-10 xl:px-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
            ♠ Sessions ♥
          </p>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl xl:text-5xl">
            あなたの記録
          </h1>
          <p className="mt-2 hidden text-sm text-muted xl:block">
            すべての一局が、あなたの軌跡。フィルタで切り取って、勝ち筋を探しましょう。
          </p>
        </div>
        <Link
          href="/sessions/new"
          className="hidden h-11 shrink-0 items-center rounded-full border border-gold/50 bg-gradient-to-b from-gold/20 to-gold/5 px-5 text-xs font-medium tracking-wide text-gold-bright transition-all hover:border-gold/80 hover:from-gold/30 hover:to-gold/10 hover:shadow-[0_0_18px_rgba(240,208,136,0.35)] sm:inline-flex"
        >
          + 新しいセッション
        </Link>
      </header>
      <SessionList />
    </div>
  );
}
