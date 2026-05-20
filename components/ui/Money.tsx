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
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
    display: "text-5xl sm:text-6xl",
  }[size];

  const tone =
    amount > 0 ? "text-profit" : amount < 0 ? "text-loss" : "text-muted";

  return (
    <span
      className={cn(
        "font-numeric tabular font-medium",
        sizeClass,
        signed ? tone : "text-foreground",
        className,
      )}
    >
      {formatJpy(amount, { sign: signed })}
    </span>
  );
}
