import { cn } from "@/lib/utils";

interface Props {
  size?: number;
  className?: string;
}

/**
 * Decorative roulette wheel — slowly rotating, gold-and-felt themed.
 * Pure SVG, no interactivity.
 */
export function RouletteWheel({ size = 280, className }: Props) {
  const numbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
    24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
  ];
  const reds = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ]);

  const slotAngle = 360 / numbers.length;
  const cx = 50;
  const cy = 50;
  const outerR = 49;
  const innerR = 28;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-roulette-spin">
        <defs>
          <radialGradient id="rw-hub" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0d088" />
            <stop offset="60%" stopColor="#a98742" />
            <stop offset="100%" stopColor="#5a4824" />
          </radialGradient>
          <radialGradient id="rw-felt" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#156a44" />
            <stop offset="100%" stopColor="#062815" />
          </radialGradient>
          <linearGradient id="rw-spoke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0d088" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8a7240" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Outer gold ring */}
        <circle cx={cx} cy={cy} r={outerR} fill="#1c1208" stroke="#d4ad5f" strokeWidth="0.6" />
        <circle cx={cx} cy={cy} r={outerR - 1.2} fill="none" stroke="rgba(240,208,136,0.55)" strokeWidth="0.25" />

        {/* Number slots */}
        {numbers.map((n, i) => {
          const start = i * slotAngle - 90 - slotAngle / 2;
          const end = start + slotAngle;
          const fill = n === 0 ? "#0f6a3a" : reds.has(n) ? "#8b1f2c" : "#0a0e0d";
          const startRad = (start * Math.PI) / 180;
          const endRad = (end * Math.PI) / 180;
          const x1 = cx + outerR * 0.96 * Math.cos(startRad);
          const y1 = cy + outerR * 0.96 * Math.sin(startRad);
          const x2 = cx + outerR * 0.96 * Math.cos(endRad);
          const y2 = cy + outerR * 0.96 * Math.sin(endRad);
          const xi1 = cx + innerR * Math.cos(startRad);
          const yi1 = cy + innerR * Math.sin(startRad);
          const xi2 = cx + innerR * Math.cos(endRad);
          const yi2 = cy + innerR * Math.sin(endRad);
          const path = `M ${xi1} ${yi1} L ${x1} ${y1} A ${outerR * 0.96} ${outerR * 0.96} 0 0 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 0 0 ${xi1} ${yi1} Z`;

          const mid = (start + end) / 2;
          const tx = cx + (outerR - 6) * Math.cos((mid * Math.PI) / 180);
          const ty = cy + (outerR - 6) * Math.sin((mid * Math.PI) / 180);
          return (
            <g key={n}>
              <path d={path} fill={fill} stroke="rgba(240,208,136,0.5)" strokeWidth="0.18" />
              <text
                x={tx}
                y={ty}
                fontSize="3.2"
                fontFamily="var(--font-display), serif"
                fontWeight="600"
                fill="#f5ecd4"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${mid + 90} ${tx} ${ty})`}
              >
                {n}
              </text>
            </g>
          );
        })}

        {/* Inner felt */}
        <circle cx={cx} cy={cy} r={innerR} fill="url(#rw-felt)" stroke="rgba(240,208,136,0.6)" strokeWidth="0.4" />

        {/* Spokes */}
        {[0, 45, 90, 135].map((deg) => (
          <line
            key={deg}
            x1={cx + innerR * Math.cos((deg * Math.PI) / 180)}
            y1={cy + innerR * Math.sin((deg * Math.PI) / 180)}
            x2={cx + innerR * Math.cos(((deg + 180) * Math.PI) / 180)}
            y2={cy + innerR * Math.sin(((deg + 180) * Math.PI) / 180)}
            stroke="url(#rw-spoke)"
            strokeWidth="0.8"
          />
        ))}

        {/* Hub */}
        <circle cx={cx} cy={cy} r="6" fill="url(#rw-hub)" stroke="#5a4824" strokeWidth="0.4" />
        <circle cx={cx} cy={cy} r="1.6" fill="#f0d088" />
      </svg>

      {/* Counter-rotating ball */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-roulette-spin-rev">
        <circle cx={cx} cy={cy - (innerR + 5)} r="1.6" fill="#fdf8ec" stroke="#a98742" strokeWidth="0.2" />
      </svg>
    </div>
  );
}
