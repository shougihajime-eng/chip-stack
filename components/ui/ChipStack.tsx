import { cn } from "@/lib/utils";

const PALETTE: Record<string, { rim: string; rimDark: string; face: string; stripe: string }> = {
  red:    { rim: "#d8475a", rimDark: "#7b1c2a", face: "#1a0c0e", stripe: "#f5ecd4" },
  blue:   { rim: "#4a8cd8", rimDark: "#1f4577", face: "#0c1422", stripe: "#f5ecd4" },
  green:  { rim: "#3dd185", rimDark: "#1a6b41", face: "#0c1a13", stripe: "#f5ecd4" },
  black:  { rim: "#2a2620", rimDark: "#0c0a07", face: "#08090a", stripe: "#d4ad5f" },
  gold:   { rim: "#f0d088", rimDark: "#8a7240", face: "#3a2d12", stripe: "#1a1208" },
  purple: { rim: "#a464d8", rimDark: "#4a2974", face: "#180d22", stripe: "#f5ecd4" },
};

interface ChipProps {
  color?: keyof typeof PALETTE;
  size?: number;
  className?: string;
  label?: string;
  spin?: boolean;
}

export function Chip({ color = "gold", size = 56, className, label, spin }: ChipProps) {
  const p = PALETTE[color];
  return (
    <div
      className={cn("relative inline-block select-none", spin && "animate-chip-spin", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)]">
        <defs>
          <radialGradient id={`chip-${color}-face`} cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor={p.rim} stopOpacity="0.95" />
            <stop offset="55%" stopColor={p.face} />
            <stop offset="100%" stopColor={p.rimDark} />
          </radialGradient>
        </defs>

        {/* outer rim */}
        <circle cx="32" cy="32" r="30" fill={p.rimDark} />
        <circle cx="32" cy="32" r="30" fill={`url(#chip-${color}-face)`} />

        {/* edge notches (8 stripes) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const deg = i * 45;
          return (
            <rect
              key={i}
              x="29"
              y="1"
              width="6"
              height="7"
              fill={p.stripe}
              opacity="0.95"
              transform={`rotate(${deg} 32 32)`}
            />
          );
        })}

        {/* inner ring */}
        <circle cx="32" cy="32" r="22" fill="none" stroke={p.stripe} strokeOpacity="0.85" strokeWidth="0.6" />
        <circle cx="32" cy="32" r="20" fill="none" stroke={p.rim} strokeOpacity="0.5" strokeWidth="0.5" strokeDasharray="1 2" />

        {/* center disc */}
        <circle cx="32" cy="32" r="17" fill={p.face} stroke={p.stripe} strokeOpacity="0.65" strokeWidth="0.45" />

        {/* highlight gloss */}
        <ellipse cx="24" cy="22" rx="11" ry="4" fill="rgba(255,255,255,0.18)" />

        {label && (
          <text
            x="32"
            y="34"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-display), serif"
            fontWeight="600"
            fontSize="11"
            fill={p.stripe}
            letterSpacing="0.5"
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

interface StackProps {
  /** chips bottom-to-top */
  colors: (keyof typeof PALETTE)[];
  width?: number;
  className?: string;
  float?: boolean;
}

/**
 * Side-profile stack of poker chips, viewed slightly from above.
 */
export function ChipStack({ colors, width = 86, className, float }: StackProps) {
  const chipH = 11;
  const chipW = width;
  const height = chipH * colors.length + 14;

  return (
    <div
      className={cn("relative", float && "animate-chip-float", className)}
      style={{ width: chipW, height }}
      aria-hidden
    >
      <svg viewBox={`0 0 ${chipW} ${height}`} className="absolute inset-0 h-full w-full drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]">
        <defs>
          {Object.entries(PALETTE).map(([k, p]) => (
            <linearGradient key={k} id={`stack-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={p.rim} />
              <stop offset="50%" stopColor={p.face} />
              <stop offset="100%" stopColor={p.rimDark} />
            </linearGradient>
          ))}
        </defs>

        {colors.map((c, i) => {
          const idx = colors.length - 1 - i;
          const p = PALETTE[c];
          const yTop = 8 + idx * chipH;
          return (
            <g key={i}>
              {/* side */}
              <rect x="3" y={yTop + 4} width={chipW - 6} height={chipH} fill={`url(#stack-${c})`} />
              {/* stripes */}
              {Array.from({ length: 6 }).map((_, j) => (
                <rect
                  key={j}
                  x={3 + 4 + j * ((chipW - 6 - 8) / 5)}
                  y={yTop + 6}
                  width="2.5"
                  height={chipH - 4}
                  fill={p.stripe}
                  opacity="0.7"
                />
              ))}
              {/* top oval */}
              <ellipse cx={chipW / 2} cy={yTop + 4} rx={(chipW - 6) / 2} ry="4" fill={p.face} stroke={p.rim} strokeWidth="0.6" />
              <ellipse cx={chipW / 2} cy={yTop + 4} rx={(chipW - 6) / 2 - 4} ry="2.2" fill="none" stroke={p.stripe} strokeOpacity="0.55" strokeWidth="0.6" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
