"use client";

import { getSupabase } from "./client";
import { getDb } from "@/lib/db/db";
import type { Session } from "@/lib/db/schema";

interface CloudSession {
  id: string;
  user_id: string;
  play_date: string;
  game: string;
  format: string;
  country: string;
  venue: string;
  currency: string;
  buy_in: number;
  cash_out: number;
  fx_rate: number;
  pnl_local: number;
  pnl_jpy: number;
  duration_minutes: number | null;
  reentries: number | null;
  tourney_title: string | null;
  tourney_place: number | null;
  tourney_entrants: number | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

function toCloudPayload(s: Session, userId: string) {
  return {
    user_id: userId,
    play_date: s.playDate,
    game: s.game,
    format: s.format,
    country: s.country,
    venue: s.venue,
    currency: s.currency,
    buy_in: s.buyIn,
    cash_out: s.cashOut,
    fx_rate: s.fxRate,
    pnl_local: s.pnlLocal,
    pnl_jpy: s.pnlJpy,
    duration_minutes: s.durationMinutes ?? null,
    reentries: s.reentries ?? null,
    tourney_title: s.tourneyTitle ?? null,
    tourney_place: s.tourneyPlace ?? null,
    tourney_entrants: s.tourneyEntrants ?? null,
    memo: s.memo ?? null,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

function fromCloud(c: CloudSession): Omit<Session, "id"> {
  return {
    playDate: c.play_date,
    game: c.game as Session["game"],
    format: c.format as Session["format"],
    country: c.country as Session["country"],
    venue: c.venue,
    currency: c.currency as Session["currency"],
    buyIn: Number(c.buy_in),
    cashOut: Number(c.cash_out),
    fxRate: Number(c.fx_rate),
    pnlLocal: Number(c.pnl_local),
    pnlJpy: Number(c.pnl_jpy),
    durationMinutes: c.duration_minutes,
    reentries: c.reentries ?? null,
    tourneyTitle: c.tourney_title ?? null,
    tourneyPlace: c.tourney_place,
    tourneyEntrants: c.tourney_entrants,
    memo: c.memo ?? "",
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    cloudId: c.id,
    syncedAt: c.updated_at,
  };
}

export interface SyncResult {
  pushed: number;
  pulled: number;
  errors: string[];
}

/**
 * Two-way sync between local IndexedDB and Supabase cloud.
 * Strategy:
 *  - Push any local rows where cloudId is null OR updatedAt > syncedAt
 *  - Pull all rows from cloud, merge by cloudId (cloud wins on tie)
 */
export async function syncWithCloud(userId: string): Promise<SyncResult> {
  const supa = getSupabase();
  if (!supa) return { pushed: 0, pulled: 0, errors: ["Supabase not configured"] };

  const db = getDb();
  const errors: string[] = [];
  let pushed = 0;
  let pulled = 0;

  // 1. PUSH new / updated local sessions
  const localAll = await db.sessions.toArray();
  const toInsert = localAll.filter((s) => !s.cloudId);
  const toUpdate = localAll.filter((s) => s.cloudId && (!s.syncedAt || s.updatedAt > s.syncedAt));

  if (toInsert.length > 0) {
    const payload = toInsert.map((s) => toCloudPayload(s, userId));
    const { data, error } = await supa
      .from("sessions")
      .insert(payload)
      .select("id, created_at");
    if (error) {
      errors.push(`insert: ${error.message}`);
    } else if (data) {
      // Map results back to local rows in order
      for (let i = 0; i < toInsert.length && i < data.length; i += 1) {
        const local = toInsert[i];
        const cloud = data[i] as { id: string };
        if (local.id != null) {
          await db.sessions.update(local.id, {
            cloudId: cloud.id,
            syncedAt: new Date().toISOString(),
          });
          pushed += 1;
        }
      }
    }
  }

  if (toUpdate.length > 0) {
    for (const s of toUpdate) {
      if (!s.cloudId || s.id == null) continue;
      const { error } = await supa
        .from("sessions")
        .update(toCloudPayload(s, userId))
        .eq("id", s.cloudId)
        .eq("user_id", userId);
      if (error) {
        errors.push(`update ${s.cloudId}: ${error.message}`);
      } else {
        await db.sessions.update(s.id, { syncedAt: new Date().toISOString() });
        pushed += 1;
      }
    }
  }

  // 2. PULL all cloud sessions
  const { data: cloudRows, error: pullErr } = await supa
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (pullErr) {
    errors.push(`pull: ${pullErr.message}`);
    return { pushed, pulled, errors };
  }

  for (const c of (cloudRows ?? []) as CloudSession[]) {
    const existing = await db.sessions.where("cloudId").equals(c.id).first();
    if (!existing) {
      await db.sessions.add({ ...fromCloud(c) });
      pulled += 1;
    } else if (existing.id != null && c.updated_at > (existing.syncedAt ?? "")) {
      // Cloud is newer; merge in
      await db.sessions.update(existing.id, fromCloud(c));
      pulled += 1;
    }
  }

  return { pushed, pulled, errors };
}
