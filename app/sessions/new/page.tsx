import { SessionForm } from "@/components/sessions/SessionForm";
import { PlayingCard } from "@/components/ui/PlayingCard";
import { Chip } from "@/components/ui/ChipStack";

export const metadata = { title: "新しいセッション" };

export default function NewSessionPage() {
  return (
    <div className="relative mx-auto w-full max-w-[1400px] px-5 pt-6 pb-12 sm:px-8 sm:pt-10 xl:px-12">
      {/* PC decorative side flourishes */}
      <div className="pointer-events-none absolute left-4 top-32 hidden xl:block">
        <PlayingCard rank="A" suit="♠" tilt={-12} size="lg" />
      </div>
      <div className="pointer-events-none absolute right-4 top-32 hidden xl:block">
        <PlayingCard rank="K" suit="♥" tilt={12} size="lg" />
      </div>
      <div className="pointer-events-none absolute right-12 bottom-12 hidden animate-chip-float xl:block">
        <Chip color="gold" size={64} label="¥" />
      </div>
      <div className="pointer-events-none absolute left-12 bottom-24 hidden animate-chip-float-slow xl:block">
        <Chip color="red" size={52} />
      </div>

      <header className="mb-8 text-center xl:text-left">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
          ♦ New Session ♣
        </p>
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl xl:text-5xl">
          今日のセッションを<br className="sm:hidden" />刻む
        </h1>
        <p className="mt-2 text-sm text-muted">
          記録した瞬間から、収支はあなたの実力の一部になります。
        </p>
      </header>

      <div className="mx-auto w-full max-w-2xl">
        <SessionForm />
      </div>
    </div>
  );
}
