import { cn } from "@/lib/utils";

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Props {
  rank: Rank;
  suit: Suit;
  /** rotation in degrees */
  tilt?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** start face-down then flip to face up on mount */
  flipIn?: boolean;
  /** ms delay before flip starts */
  flipDelay?: number;
}

const sizeMap = {
  sm: { w: 56, h: 80, font: "text-sm", center: "text-2xl", corner: "text-[10px]" },
  md: { w: 88, h: 124, font: "text-base", center: "text-4xl", corner: "text-[13px]" },
  lg: { w: 112, h: 160, font: "text-lg", center: "text-5xl", corner: "text-[16px]" },
  xl: { w: 144, h: 200, font: "text-xl", center: "text-6xl", corner: "text-[18px]" },
};

export function PlayingCard({
  rank,
  suit,
  tilt = 0,
  size = "md",
  className,
  flipIn = false,
  flipDelay = 0,
}: Props) {
  const red = suit === "♥" || suit === "♦";
  const dim = sizeMap[size];

  return (
    <div
      className={cn("relative", flipIn && "animate-card-deal", className)}
      style={{
        width: dim.w,
        height: dim.h,
        perspective: 800,
        animationDelay: flipIn ? `${flipDelay}ms` : undefined,
      }}
    >
      {/* Tilt wrapper */}
      <div
        className="relative h-full w-full"
        style={{
          transform: `rotate(${tilt}deg)`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* Card face */}
        <div
          className="absolute inset-0 rounded-[8%] border border-gold-deep/30 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.5)]"
          style={{
            background:
              "linear-gradient(180deg, #fdf8ec 0%, #f5edd6 100%)",
          }}
        >
          {/* Subtle felt-paper grain */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[8%] opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.3) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.3) 1px, transparent 1px)",
              backgroundSize: "4px 4px, 5px 5px",
            }}
          />
          {/* Top-left corner */}
          <div
            className={cn(
              "absolute left-2 top-1.5 flex flex-col items-center leading-none",
              dim.corner,
              red ? "text-suit-red" : "text-[#0d1816]",
            )}
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            <span className="leading-none">{rank}</span>
            <span className="mt-0.5 leading-none">{suit}</span>
          </div>
          {/* Bottom-right corner (rotated 180) */}
          <div
            className={cn(
              "absolute right-2 bottom-1.5 flex flex-col items-center leading-none",
              dim.corner,
              red ? "text-suit-red" : "text-[#0d1816]",
            )}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              transform: "rotate(180deg)",
            }}
          >
            <span className="leading-none">{rank}</span>
            <span className="mt-0.5 leading-none">{suit}</span>
          </div>
          {/* Center large pip */}
          <div
            className={cn(
              "absolute inset-0 grid place-items-center",
              dim.center,
              red ? "text-suit-red" : "text-[#0d1816]",
            )}
            style={{ fontWeight: 500 }}
          >
            <span style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}>{suit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
