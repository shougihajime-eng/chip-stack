"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session as AuthSession, User } from "@supabase/supabase-js";
import { getSupabase, isCloudEnabled } from "./client";

interface AuthCtx {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirm?: boolean }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) {
      setLoading(false);
      return;
    }
    supa.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supa.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const supa = getSupabase();
    if (!supa) return { error: "クラウド機能が無効になっています" };
    const { error } = await supa.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp: AuthCtx["signUp"] = async (email, password) => {
    const supa = getSupabase();
    if (!supa) return { error: "クラウド機能が無効になっています" };
    const { data, error } = await supa.auth.signUp({ email, password });
    if (error) return { error: error.message };
    const needsConfirm = !data.session && !!data.user;
    return { error: null, needsConfirm };
  };

  const signOut = async () => {
    const supa = getSupabase();
    if (!supa) return;
    await supa.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      user: null,
      session: null,
      loading: false,
      signIn: async () => ({ error: "AuthProvider が見つかりません" }),
      signUp: async () => ({ error: "AuthProvider が見つかりません" }),
      signOut: async () => {},
    };
  }
  return ctx;
}

export { isCloudEnabled };
