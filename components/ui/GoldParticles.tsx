import { useMemo } from "react";

interface Props {
  count?: number;
  className?: string;
}

interface Particle {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  size: number;
  opacity: number;
}

/**
 * Slow rising gold sparkles — purely decorative.
 * Positions are pseudo-deterministic from index so SSR and client agree.
 */
export function GoldParticles({ count = 18, className }: Props) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }).map((_, i) => {
      const seed = (i * 2654435761) >>> 0;
      const r1 = ((seed % 1000) / 1000);
      const r2 = (((seed >> 8) % 1000) / 1000);
      const r3 = (((seed >> 16) % 1000) / 1000);
      const r4 = (((seed >> 4) % 1000) / 1000);
      const r5 = (((seed >> 12) % 1000) / 1000);
      const r6 = (((seed >> 20) % 1000) / 1000);
      return {
        left: r1 * 100,
        delay: r2 * 7,
        duration: 7 + r3 * 7,
        drift: (r4 - 0.5) * 80,
        size: 2 + r5 * 3,
        opacity: 0.35 + r6 * 0.45,
      };
    });
  }, [count]);

  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden " + (className ?? "")} aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-gold-bright animate-particle-drift"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px rgba(240,208,136,0.7)`,
            ["--drift-x" as string]: `${p.drift}px`,
            ["--drift-dur" as string]: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
