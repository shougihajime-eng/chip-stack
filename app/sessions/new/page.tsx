import { SessionForm } from "@/components/sessions/SessionForm";

export const metadata = { title: "新しいセッション" };

export default function NewSessionPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pt-8 pb-12 sm:px-8 sm:pt-12">
      <header className="mb-8">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-gold">New Session</p>
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          今日のセッションを<br className="sm:hidden" />刻む
        </h1>
        <p className="mt-2 text-sm text-muted">
          記録した瞬間から、収支はあなたの実力の一部になります。
        </p>
      </header>
      <SessionForm />
    </div>
  );
}
