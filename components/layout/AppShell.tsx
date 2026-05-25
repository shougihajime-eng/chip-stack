import Link from "next/link";
import { BottomNav } from "./BottomNav";
import { SiteFooter } from "./SiteFooter";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header
        className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Gold velvet rope sheen under header */}
        <div className="rope-sheen absolute inset-x-0 bottom-0 h-px" />
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 xl:px-12">
          <Link href="/" className="group flex items-center gap-3">
            <ChipLogo />
            <span className="font-display text-[17px] font-medium tracking-wide text-foreground">
              Casino <span className="text-gold">Ledger</span>
            </span>
            <span className="hidden items-center gap-1 rounded-full border border-border-subtle bg-felt/40 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-gold/80 sm:inline-flex">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-live-blink rounded-full bg-gold" />
              </span>
              Open Table
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink href="/">ホーム</NavLink>
            <NavLink href="/sessions">セッション</NavLink>
            <NavLink href="/account">クラウド</NavLink>
            <NavLink href="/settings">設定</NavLink>
            <NavLink href="/sessions/new" emphasis>
              + 新規セッション
            </NavLink>
          </nav>
          <Link
            href="/account"
            className="btn-chip ml-2 inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-gold/40 bg-gradient-to-b from-gold/15 to-gold/5 px-3 text-[11px] font-medium tracking-wide text-gold-bright transition-colors hover:border-gold/70 hover:from-gold/25 sm:hidden"
            aria-label="クラウドと同期"
            title="クラウドと同期"
          >
            <CloudIcon className="h-4 w-4" />
            <span>クラウド</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <div className="relative z-10 pb-28 sm:pb-0">
        <SiteFooter />
      </div>

      <BottomNav />
    </div>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path
        d="M7 18h10a4 4 0 0 0 .9-7.9 6 6 0 0 0-11.6-1A4.5 4.5 0 0 0 7 18z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 13v-3M10 12l2-2 2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChipLogo() {
  return (
    <span className="relative grid h-9 w-9 place-items-center transition-transform group-hover:scale-110 group-hover:rotate-12">
      <svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="logo-felt" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a7a52" />
            <stop offset="100%" stopColor="#062815" />
          </radialGradient>
        </defs>
        {/* Outer ring with notches (chip edge) */}
        <circle cx="16" cy="16" r="15" fill="url(#logo-felt)" stroke="rgba(212,173,95,0.7)" strokeWidth="0.6" />
        {/* Chip notches */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <rect
            key={deg}
            x="14.5"
            y="0.5"
            width="3"
            height="3.5"
            fill="rgba(240,208,136,0.95)"
            transform={`rotate(${deg} 16 16)`}
          />
        ))}
        {/* Inner felt circle */}
        <circle cx="16" cy="16" r="10" fill="#062815" stroke="rgba(240,208,136,0.85)" strokeWidth="0.7" />
      </svg>
      <span className="relative z-10 font-display text-[14px] font-semibold text-gold-bright">♠</span>
    </span>
  );
}

function NavLink({
  href,
  children,
  emphasis,
}: {
  href: string;
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  if (emphasis) {
    return (
      <Link
        href={href}
        className="ml-3 rounded-full border border-gold/50 bg-gradient-to-b from-gold/20 to-gold/5 px-4 py-1.5 text-xs font-medium tracking-wide text-gold-bright transition-all hover:border-gold/80 hover:from-gold/30 hover:to-gold/10 hover:shadow-[0_0_18px_rgba(240,208,136,0.35)]"
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted transition-colors hover:text-foreground hover:bg-surface/50"
    >
      {children}
    </Link>
  );
}
