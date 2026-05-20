"use client";

import { formatJpy } from "@/lib/currency";

/**
 * Full-screen overlay shown after saving a session.
 * A casino chip "drops in" with the recorded P/L stamped on it.
 */
export function ChipDrop({ amount }: { amount: number }) {
  const tone =
    amount > 0 ? "text-profit" : amount < 0 ? "text-loss" : "text-foreground";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/65 backdrop-blur-sm animate-overlay-fade">
      <div className="animate-chip-drop">
        <div
          className="relative grid h-56 w-56 place-items-center rounded-full sm:h-64 sm:w-64"
          style={{
            background:
              "conic-gradient(from 0deg, #d4ad5f 0deg 30deg, #6b5630 30deg 60deg, #d4ad5f 60deg 90deg, #6b5630 90deg 120deg, #d4ad5f 120deg 150deg, #6b5630 150deg 180deg, #d4ad5f 180deg 210deg, #6b5630 210deg 240deg, #d4ad5f 240deg 270deg, #6b5630 270deg 300deg, #d4ad5f 300deg 330deg, #6b5630 330deg 360deg)",
            boxShadow:
              "0 30px 80px -10px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.4)",
          }}
        >
          <div
            className="grid h-44 w-44 place-items-center rounded-full border-[3px] border-gold/80 sm:h-52 sm:w-52"
            style={{
              background:
                "radial-gradient(circle at 50% 35%, #156a44 0%, #062815 75%)",
              boxShadow:
                "inset 0 6px 18px rgba(228, 201, 135, 0.18), inset 0 -6px 24px rgba(0,0,0,0.5)",
            }}
          >
            <div className="text-center">
              <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-gold-bright">
                ♠ Recorded ♥
              </div>
              <div className={`font-numeric mt-2 text-2xl font-semibold sm:text-3xl ${tone}`}>
                {formatJpy(amount, { sign: true })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
