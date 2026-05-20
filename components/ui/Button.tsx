"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "border-gold/50 bg-gradient-to-b from-gold/25 to-gold/8 text-gold-bright shadow-[inset_0_1px_0_rgba(228,201,135,0.25)] hover:from-gold/35 hover:to-gold/15 hover:border-gold/70 active:scale-[0.98]",
  secondary:
    "border-border bg-surface/60 text-foreground hover:border-border-strong hover:bg-surface-elevated active:scale-[0.98]",
  ghost: "border-transparent text-muted hover:text-foreground hover:bg-surface/40",
  danger:
    "border-loss/40 bg-loss/10 text-loss hover:bg-loss/15 hover:border-loss/60 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "btn-chip inline-flex select-none items-center justify-center gap-2 rounded-full border font-medium tracking-wide transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});
