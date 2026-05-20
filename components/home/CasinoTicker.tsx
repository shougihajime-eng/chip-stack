import type { Session } from "@/lib/db/schema";

interface Props {
  sessions: Session[];
}

/**
 * A horizontally scrolling marquee that whispers little bits of casino flavor:
 * - top venues, favorite games, "place your bets", live stats.
 * Decorative; uses CSS marquee.
 */
export function CasinoTicker({ sessions }: Props) {
  const items = buildItems(sessions);

  // Duplicate items so the marquee loops smoothly
  const loop = [...items, ...items];

  return (
    <div className="relative hidden overflow-hidden rounded-2xl border border-border bg-surface/40 py-2 backdrop-blur-sm sm:block">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />
      <div className="flex w-max animate-marquee gap-12 px-6">
        {loop.map((t, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-2.5 text-[11px] uppercase tracking-[0.18em]"
          >
            <span aria-hidden className={t.suitClass}>{t.suit}</span>
            <span className="text-muted">{t.label}</span>
            <span className="font-numeric tracking-normal text-foreground">{t.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

interface Item {
  suit: "♠" | "♥" | "♦" | "♣";
  suitClass: string;
  label: string;
  value: string;
}

function buildItems(sessions: Session[]): Item[] {
  const items: Item[] = [];

  // ① total bankroll moved
  const totalIn = sessions.reduce((s, x) => s + Math.abs(x.pnlJpy), 0);
  items.push({
    suit: "♠",
    suitClass: "text-foreground",
    label: "Money on the felt",
    value: "¥" + Math.round(totalIn).toLocaleString("ja-JP"),
  });

  // ② favorite game
  if (sessions.length > 0) {
    const byGame = new Map<string, number>();
    for (const s of sessions) byGame.set(s.game, (byGame.get(s.game) ?? 0) + 1);
    const top = [...byGame.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top) {
      items.push({
        suit: "♣",
        suitClass: "text-gold-bright",
        label: "Favorite table",
        value: `${top[0]} · ${top[1]}回`,
      });
    }
  }

  // ③ favorite venue
  if (sessions.length > 0) {
    const byVenue = new Map<string, number>();
    for (const s of sessions) {
      const v = (s.venue || "").trim();
      if (!v) continue;
      byVenue.set(v, (byVenue.get(v) ?? 0) + 1);
    }
    const top = [...byVenue.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top) {
      items.push({
        suit: "♥",
        suitClass: "text-suit-red",
        label: "Lucky house",
        value: `${top[0]}`,
      });
    }
  }

  // ④ countries visited
  const countries = new Set(sessions.map((s) => s.country));
  if (countries.size > 0) {
    items.push({
      suit: "♦",
      suitClass: "text-gold",
      label: "Countries played",
      value: `${countries.size} 国`,
    });
  }

  // ⑤ filler invitations
  items.push({
    suit: "♠",
    suitClass: "text-gold-bright",
    label: "✦ Place your bets ✦",
    value: "Le jeu est fait",
  });

  if (items.length < 6) {
    items.push({
      suit: "♥",
      suitClass: "text-suit-red",
      label: "Tonight's vibe",
      value: "Velvet & gold",
    });
  }

  return items;
}
