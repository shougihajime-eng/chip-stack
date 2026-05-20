import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="flex items-baseline gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        {label}
        {required && <span className="text-gold/70">*</span>}
        {hint && <span className="ml-auto text-[10px] normal-case tracking-normal text-subtle">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface/50 px-3.5 text-[15px] text-foreground placeholder:text-subtle transition-colors focus:border-gold/60 focus:bg-surface-elevated focus:outline-none";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      inputMode="decimal"
      pattern="[0-9]*[.,]?[0-9]*"
      {...props}
      className={cn(inputClass, "font-numeric text-right tabular tracking-tight", props.className)}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          inputClass,
          "appearance-none pr-9 text-[15px]",
          props.className,
        )}
      />
      <svg
        viewBox="0 0 12 8"
        className="pointer-events-none absolute right-3.5 top-1/2 h-2.5 w-3 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M1 1.5L6 6.5L11 1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[96px] w-full rounded-xl border border-border bg-surface/50 p-3.5 text-[14px] leading-relaxed text-foreground placeholder:text-subtle transition-colors focus:border-gold/60 focus:bg-surface-elevated focus:outline-none",
        props.className,
      )}
    />
  );
}
