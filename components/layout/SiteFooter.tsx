import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative mt-12 border-t border-border-subtle">
      <div className="rope-sheen absolute inset-x-0 top-0 h-px" />
      <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 xl:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="font-display text-base text-foreground">
              Casino <span className="text-gold">Ledger</span>
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
              一回ごとの記録が、あなたのカジノの実力を形にする。
              収支・時給・連勝記録まで、上品にまとめる大人のプレイヤー帳簿。
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-muted">
            <Link href="/" className="transition-colors hover:text-gold-bright">ホーム</Link>
            <Link href="/sessions" className="transition-colors hover:text-gold-bright">セッション一覧</Link>
            <Link href="/settings" className="transition-colors hover:text-gold-bright">設定・バックアップ</Link>
            <Link href="/account" className="transition-colors hover:text-gold-bright">クラウド同期</Link>
          </nav>
        </div>

        {/* Responsible-play + safety strip */}
        <div className="mt-8 flex flex-col gap-3 border-t border-border-subtle pt-5 text-[11px] leading-relaxed text-subtle sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-felt/30 px-2.5 py-1 font-medium text-gold/90">
              <span aria-hidden>🔞</span> 20歳以上
            </span>
            <span>記録はお使いの端末に保存されます（サーバーへ自動送信なし）。</span>
          </div>
          <p className="sm:text-right">
            賭けは余裕資金で。のめり込みに注意し、つらいと感じたら休みましょう。
          </p>
        </div>

        <p className="mt-4 text-[10px] text-subtle">
          © {new Date().getFullYear()} Casino Ledger. 記録・分析のための個人用ツールです。実際の賭博を助長・あっせんするものではありません。
        </p>
      </div>
    </footer>
  );
}
