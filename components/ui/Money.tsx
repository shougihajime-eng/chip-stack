import { cn } from "@/lib/utils";
import { formatJpy } from "@/lib/currency";

export function Money({
  amount,
  size = "md",
  signed = true,
  className,
}: {
  amount: number;
  size?: "sm" | "md" | "lg" | "xl" | "display";
  signed?: boolean;
  className?: string;
}) {
  const sizeClass = {
    sm: "text-sm font-medium",
    md: "text-xl font-medium",
    lg: "text-3xl font-semibold tracking-tight",
    xl: "text-5xl font-semibold tracking-tight",
    display: "text-6xl sm:text-7xl font-semibold tracking-tighter",
  }[size];

  const tone =
    amount > 0 ? "text-profit" : amount < 0 ? "text-loss" : "text-muted";

  return (
    <span
      className={cn(
        "font-numeric inline-block",
        sizeClass,
        signed ? tone : "text-foreground",
        className,
      )}
    >
      {formatJpy(amount, { sign: signed })}
    </span>
  );
}
