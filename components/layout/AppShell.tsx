import Link from "next/link";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        {/* Gold filigree under header */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <ChipLogo />
            <span className="font-display text-[16px] font-medium tracking-wide text-foreground">
              Casino <span className="text-gold">Ledger</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink href="/">ホーム</NavLink>
            <NavLink href="/sessions">セッション</NavLink>
            <NavLink href="/account">アカウント</NavLink>
            <NavLink href="/sessions/new" emphasis>
              新規
            </NavLink>
          </nav>
          <Link
            href="/account"
            className="ml-2 grid h-8 w-8 place-items-center rounded-full border border-border text-muted transition-colors hover:border-gold/50 hover:text-gold-bright sm:hidden"
            title="アカウント"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
              <path
                d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 pb-28 sm:pb-12">{children}</main>

      <BottomNav />
    </div>
  );
}

function ChipLogo() {
  return (
    <span className="relative grid h-8 w-8 place-items-center transition-transform group-hover:scale-105">
      <svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full">
        {/* Outer ring with notches (chip edge) */}
        <circle cx="16" cy="16" r="15" fill="#0c4d31" stroke="rgba(212,173,95,0.5)" strokeWidth="0.5" />
        {/* Chip notches */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <rect
            key={deg}
            x="14.5"
            y="0.5"
            width="3"
            height="3.5"
            fill="rgba(212,173,95,0.9)"
            transform={`rotate(${deg} 16 16)`}
          />
        ))}
        {/* Inner felt circle */}
        <circle cx="16" cy="16" r="10" fill="#062815" stroke="rgba(212,173,95,0.7)" strokeWidth="0.6" />
      </svg>
      <span className="relative z-10 font-display text-[13px] font-semibold text-gold-bright">♠</span>
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
        className="ml-2 rounded-full border border-gold/40 bg-gradient-to-b from-gold/15 to-gold/5 px-4 py-1.5 text-xs font-medium tracking-wide text-gold-bright transition-all hover:border-gold/70 hover:from-gold/25 hover:to-gold/10"
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}
