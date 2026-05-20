import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  return (
    <Tag
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur-sm",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold/30 before:to-transparent",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex items-baseline justify-between px-5 pt-5 sm:px-6 sm:pt-6", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-[11px] font-medium uppercase tracking-[0.18em] text-muted", className)}>{children}</h2>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 pb-5 pt-3 sm:px-6 sm:pb-6", className)}>{children}</div>;
}
