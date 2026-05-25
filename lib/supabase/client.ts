"use client";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// No generated Supabase types in this project, so the Database generic stays loose.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChipStackClient = ReturnType<typeof createClient<any, "chip_stack", any>>;

let _client: ChipStackClient | null = null;

export function getSupabase(): ChipStackClient | null {
  if (!url || !anon) return null;
  if (typeof window === "undefined") return null;
  if (!_client) {
    _client = createClient(url, anon, {
      db: { schema: "chip_stack" },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "chip-stack-auth",
      },
    });
  }
  return _client;
}

export function isCloudEnabled(): boolean {
  return !!(url && anon);
}
