"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  durationMs?: number;
  /** initial render value (default 0) */
  from?: number;
}

/**
 * Animates the displayed integer from `from` to `value` on mount and on value change.
 * Easing: cubic-out for slot-machine-style "fast then settle" feel.
 */
export function CountUp({ value, durationMs = 1100, from = 0 }: Props) {
  const [display, setDisplay] = useState(from);
  const prevValueRef = useRef<number>(from);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const startedAt = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(start + (end - start) * eased);
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevValueRef.current = end;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      prevValueRef.current = value;
    };
  }, [value, durationMs]);

  return <>{display}</>;
}

/**
 * Format a JPY amount with sign and ¥ — returns React node with animated digits.
 */
export function AnimatedJpy({ amount, durationMs }: { amount: number; durationMs?: number }) {
  const sign = amount > 0 ? "+" : amount < 0 ? "−" : "";
  const absVal = Math.abs(amount);
  return (
    <span className="tabular">
      {sign}¥<CountUpFormatted value={absVal} durationMs={durationMs} />
    </span>
  );
}

function CountUpFormatted({ value, durationMs }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(0);
  const prevValueRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const startedAt = performance.now();
    const dur = durationMs ?? 1100;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(start + (end - start) * eased);
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevValueRef.current = end;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      prevValueRef.current = value;
    };
  }, [value, durationMs]);

  return <>{display.toLocaleString("ja-JP")}</>;
}
