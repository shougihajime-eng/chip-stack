import { EditSessionClient } from "./EditSessionClient";

export const metadata = { title: "セッションを編集" };

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 pt-6 pb-12 sm:px-8 sm:pt-10 xl:px-12">
      <header className="mb-8">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
          ♥ Edit Session ♦
        </p>
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl xl:text-5xl">
          セッションを編集
        </h1>
        <p className="mt-2 text-sm text-muted">細部まで正しく刻み直しましょう。</p>
      </header>
      <div className="mx-auto w-full max-w-2xl">
        <EditSessionClient id={numericId} />
      </div>
    </div>
  );
}
