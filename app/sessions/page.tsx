import Link from "next/link";
import { SessionList } from "@/components/sessions/SessionList";

export const metadata = { title: "セッション一覧" };

export default function SessionsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-8 pb-12 sm:px-8 sm:pt-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-gold">Sessions</p>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            あなたの記録
          </h1>
        </div>
        <Link
          href="/sessions/new"
          className="hidden h-10 shrink-0 items-center rounded-full border border-gold/40 bg-gradient-to-b from-gold/15 to-gold/5 px-5 text-xs font-medium tracking-wide text-gold-bright transition-all hover:border-gold/70 sm:inline-flex"
        >
          + 新しいセッション
        </Link>
      </header>
      <SessionList />
    </div>
  );
}
