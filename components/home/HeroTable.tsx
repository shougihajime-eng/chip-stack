"use client";

import { AnimatedJpy, CountUp } from "@/components/ui/CountUp";
import { PlayingCard, type Rank, type Suit } from "@/components/ui/PlayingCard";
import { RouletteWheel } from "@/components/ui/RouletteWheel";
import { ChipStack, Chip } from "@/components/ui/ChipStack";
import { GoldParticles } from "@/components/ui/GoldParticles";
import { cn } from "@/lib/utils";

interface Props {
  total: number;
  count: number;
  winRate: number;
  avg: number;
  thisMonth: number;
  thisMonthCount: number;
  thisYear: number;
}

/**
 * Cinematic poker-table hero — large on PC, compact on mobile.
 * Layout (xl+):
 *   [chip stacks + roulette wheel] [center: 5 cards + total P/L + sub-numbers] [chip stacks + roulette wheel]
 * Mobile:
 *   [2 cards + total P/L]
 */
export function HeroTable({ total, count, winRate, avg, thisMonth, thisMonthCount, thisYear }: Props) {
  const totalTone =
    total > 0 ? "text-profit" : total < 0 ? "text-loss" : "text-foreground";

  // The five hand cards (royal flush-ish for fun): 10♠ J♠ Q♠ K♠ A♠
  const hand: { rank: Rank; suit: Suit; tilt: number }[] = [
    { rank: "10", suit: "♠", tilt: -16 },
    { rank: "J", suit: "♠", tilt: -8 },
    { rank: "Q", suit: "♠", tilt: 0 },
    { rank: "K", suit: "♠", tilt: 8 },
    { rank: "A", suit: "♠", tilt: 16 },
  ];

  // Mobile hand: just A♠ + A♥
  const mobileHand: { rank: Rank; suit: Suit; tilt: number }[] = [
    { rank: "A", suit: "♠", tilt: -9 },
    { rank: "A", suit: "♥", tilt: 9 },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border-strong animate-hero-glow">
      {/* Felt base */}
      <div className="absolute inset-0 bg-gradient-to-br from-felt-bright/30 via-felt/55 to-felt-deep/80" />

      {/* Top + center spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_85%_at_50%_-15%,rgba(240,208,136,0.22),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_50%_55%,rgba(240,208,136,0.10),transparent_70%)]" />

      {/* Sweeping cinematic light */}
      <div className="pointer-events-none absolute -inset-y-10 -left-1/4 w-[140%]">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-gold-bright/12 to-transparent blur-2xl animate-spot-sweep" />
      </div>

      {/* Felt curve overlay (simulates oval poker table edge on large screens) */}
      <div className="pointer-events-none absolute inset-0 hidden xl:block">
        <div
          className="absolute inset-x-12 top-6 bottom-6 rounded-[50%/30%] border border-gold/20"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(21, 106, 68, 0.4), rgba(6,40,21,0.2) 70%, transparent 100%)",
            boxShadow:
              "inset 0 0 80px rgba(0,0,0,0.5), inset 0 0 0 6px rgba(212,173,95,0.08)",
          }}
        />
      </div>

      {/* Gold filigree borders */}
      <div className="absolute inset-x-8 top-3 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="absolute inset-x-8 bottom-3 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="absolute inset-y-8 left-3 w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent" />
      <div className="absolute inset-y-8 right-3 w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent" />

      {/* Floating gold sparkles */}
      <GoldParticles count={24} />

      {/* Decorative roulette wheel — far left (PC only) */}
      <div className="pointer-events-none absolute -left-16 top-1/2 hidden -translate-y-1/2 opacity-80 lg:block">
        <RouletteWheel size={260} />
      </div>
      {/* Decorative roulette wheel — far right (PC only) */}
      <div className="pointer-events-none absolute -right-16 top-1/2 hidden -translate-y-1/2 opacity-80 lg:block">
        <div className="animate-roulette-spin-rev" style={{ animation: "none" }}>
          <RouletteWheel size={260} />
        </div>
      </div>

      {/* Decorative chip stacks (PC only) */}
      <div className="pointer-events-none absolute left-[18%] bottom-6 hidden xl:block">
        <ChipStack colors={["red", "blue", "green", "gold", "black"]} float />
      </div>
      <div className="pointer-events-none absolute right-[18%] bottom-6 hidden xl:block">
        <ChipStack colors={["gold", "purple", "red", "green", "blue"]} float />
      </div>
      <div className="pointer-events-none absolute left-[28%] bottom-12 hidden xl:block">
        <ChipStack colors={["green", "red", "gold"]} width={64} float />
      </div>
      <div className="pointer-events-none absolute right-[28%] bottom-12 hidden xl:block">
        <ChipStack colors={["black", "gold", "red"]} width={64} float />
      </div>

      {/* Single floating chip (mobile/tablet decorative) */}
      <div className="pointer-events-none absolute right-4 top-4 lg:hidden">
        <Chip color="gold" size={36} label="A" />
      </div>
      <div className="pointer-events-none absolute left-4 bottom-4 lg:hidden">
        <Chip color="red" size={32} />
      </div>

      {/* Content */}
      <div className="relative px-4 py-12 sm:px-10 sm:py-16 xl:px-16 xl:py-24">
        {/* PC: 5-card royal-flush hand fanned out */}
        <div className="mb-8 hidden justify-center xl:flex">
          <div className="flex items-end" style={{ paddingTop: 16 }}>
            {hand.map((c, i) => (
              <div
                key={i}
                className="hand-card relative -mx-4"
                style={{
                  ["--hand-tilt" as string]: `${c.tilt}deg`,
                  zIndex: i + 1,
                  transform: `translateY(${Math.abs(c.tilt) * 0.4}px)`,
                }}
              >
                <PlayingCard
                  rank={c.rank}
                  suit={c.suit}
                  tilt={c.tilt}
                  size="md"
                  flipIn
                  flipDelay={i * 110}
                />
              </div>
            ))}
          </div>
        </div>

        {/* sm/md: 3-card hand */}
        <div className="mb-4 hidden items-end justify-center gap-2 sm:flex xl:hidden">
          <PlayingCard rank="A" suit="♠" tilt={-12} size="md" flipIn flipDelay={0} />
          <PlayingCard rank="K" suit="♥" tilt={0} size="lg" flipIn flipDelay={120} />
          <PlayingCard rank="Q" suit="♦" tilt={12} size="md" flipIn flipDelay={240} />
        </div>

        {/* mobile: 2 cards */}
        <div className="mb-2 flex items-center justify-center gap-4 sm:hidden">
          {mobileHand.map((c, i) => (
            <PlayingCard
              key={i}
              rank={c.rank}
              suit={c.suit}
              tilt={c.tilt}
              size="md"
              flipIn
              flipDelay={i * 140}
            />
          ))}
        </div>

        {/* Center: Total P/L stack */}
        <div className="relative z-10 flex flex-col items-center text-center animate-number-rise">
          <div className="mb-3 flex items-center gap-2.5">
            <span aria-hidden className="text-gold/70">♠</span>
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-gold sm:text-[12px]">
              Total P&nbsp;/&nbsp;L
            </p>
            <span aria-hidden className="text-suit-red/70">♥</span>
          </div>
          {count > 0 && (
            <p className="mb-2 hidden font-display text-[13px] italic text-gold-bright/90 sm:block">
              {moodPhrase(total, winRate, count)}
            </p>
          )}

          <div
            className={cn(
              "font-numeric mt-1 text-5xl font-semibold tracking-tight animate-number-glow sm:text-7xl xl:text-[110px] xl:leading-none",
              totalTone,
            )}
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}
          >
            <AnimatedJpy amount={total} durationMs={1400} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] tracking-wide text-muted sm:text-[14px]">
            <span className="font-numeric">
              <CountUp value={count} durationMs={900} /> セッション
            </span>
            <span className="hidden text-gold/40 sm:inline">·</span>
            <span className="font-numeric">
              勝率 <span className="text-foreground">{winRate}%</span>
            </span>
            <span className="hidden text-gold/40 sm:inline">·</span>
            <span className="font-numeric">
              平均/回{" "}
              <span className="text-foreground">
                {avg >= 0 ? "+" : "−"}¥{Math.abs(avg).toLocaleString("ja-JP")}
              </span>
            </span>
          </div>

          {/* PC: extra sub-stats below total */}
          <div className="mt-10 hidden gap-12 xl:flex">
            <SubStat label="今月" value={thisMonth} sub={`${thisMonthCount} 回`} />
            <SubStatDivider />
            <SubStat label="今年" value={thisYear} />
          </div>
        </div>
      </div>
    </section>
  );
}

function moodPhrase(total: number, winRate: number, count: number): string {
  if (count < 3) return "新しい物語のはじまり。最初の一手を、丁寧に。";
  if (total >= 0 && winRate >= 55) return "今夜はあなたの夜。ディーラーも一目置いています。";
  if (total >= 0 && winRate >= 40) return "悪くない流れ。ここから上振れを掴みにいきましょう。";
  if (total >= 0) return "勝率は控えめでも、収支はプラス。実力勝ち。";
  if (winRate >= 50) return "勝率は高いのに収支はマイナス。負け方を見直す時。";
  if (winRate >= 35) return "焦らず、規律を取り戻す一局を。";
  return "ヒートは必ず終わる。深呼吸して、休むのも戦略。";
}

function SubStat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  const tone = value > 0 ? "text-profit" : value < 0 ? "text-loss" : "text-muted";
  return (
    <div className="flex flex-col items-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-gold/80">{label}</p>
      <p className={cn("font-numeric mt-2 text-3xl font-semibold tracking-tight", tone)}>
        {value >= 0 ? "+" : "−"}¥{Math.abs(value).toLocaleString("ja-JP")}
      </p>
      {sub && <p className="font-numeric mt-1 text-[11px] text-subtle">{sub}</p>}
    </div>
  );
}

function SubStatDivider() {
  return (
    <div className="self-stretch" aria-hidden>
      <div className="h-full w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
    </div>
  );
}
