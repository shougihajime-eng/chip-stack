import Link from "next/link";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-gold/40 bg-gradient-to-br from-gold/20 to-felt/30 text-[10px] tracking-widest text-gold transition-colors group-hover:border-gold/70">
              CL
            </span>
            <span className="font-display text-[15px] font-medium tracking-wide text-foreground">
              Casino <span className="text-gold">Ledger</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink href="/">ホーム</NavLink>
            <NavLink href="/sessions">セッション</NavLink>
            <NavLink href="/sessions/new" emphasis>
              新規
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 pb-28 sm:pb-12">{children}</main>

      <BottomNav />
    </div>
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
