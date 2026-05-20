"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { SessionForm } from "@/components/sessions/SessionForm";
import { getSession } from "@/lib/db/sessions";

export function EditSessionClient({ id }: { id: number }) {
  const session = useLiveQuery(() => (Number.isFinite(id) ? getSession(id) : undefined), [id]);

  if (session === undefined) {
    return <p className="px-1 text-sm text-muted">読み込み中...</p>;
  }
  if (!session) {
    return (
      <p className="px-1 text-sm text-loss">
        セッションが見つかりませんでした。
      </p>
    );
  }

  return <SessionForm initial={session} />;
}
