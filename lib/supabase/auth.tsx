"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session as AuthSession, User } from "@supabase/supabase-js";
import { getSupabase, isCloudEnabled } from "./client";

/**
 * Convert a nickname to a pseudo-email that Supabase Auth will accept.
 * No real email is involved — this is just a unique identifier.
 */
export function nicknameToEmail(nickname: string): string {
  const cleaned = nickname
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
  return `${cleaned || "user"}@chipstack.local`;
}

export function emailToNickname(email: string | undefined | null): string {
  if (!email) return "ゲスト";
  return email.split("@")[0] ?? "ゲスト";
}

export function validateNickname(nickname: string): string | null {
  const trimmed = nickname.trim();
  if (trimmed.length < 2) return "ニックネームは2文字以上にしてください";
  if (trimmed.length > 32) return "ニックネームは32文字以内にしてください";
  if (!/^[a-zA-Z0-9_\-ぁ-んァ-ヶ一-龯]+$/.test(trimmed)) {
    return "使えるのは英数字・アンダースコア・ハイフン・ひらがな・カタカナ・漢字です";
  }
  return null;
}

interface AuthCtx {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (nickname: string, password: string) => Promise<{ error: string | null }>;
  signUp: (nickname: string, password: string) => Promise<{ error: string | null }>;
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

  const signIn: AuthCtx["signIn"] = async (nickname, password) => {
    const supa = getSupabase();
    if (!supa) return { error: "クラウド機能が無効になっています" };
    const email = nicknameToEmail(nickname);
    const { error } = await supa.auth.signInWithPassword({ email, password });
    if (!error) return { error: null };
    if (/Invalid login/i.test(error.message)) {
      return { error: "ニックネームかパスワードが違います" };
    }
    return { error: error.message };
  };

  const signUp: AuthCtx["signUp"] = async (nickname, password) => {
    const supa = getSupabase();
    if (!supa) return { error: "クラウド機能が無効になっています" };
    const email = nicknameToEmail(nickname);
    const { data, error } = await supa.auth.signUp({
      email,
      password,
      options: { data: { nickname: nickname.trim() } },
    });
    if (error) {
      if (/already registered|already exists/i.test(error.message)) {
        return { error: "そのニックネームはすでに使われています" };
      }
      return { error: error.message };
    }
    // mailer_autoconfirm is on at the Supabase project level, so this should auto-sign-in
    if (!data.session) {
      // Try to sign in immediately
      const { error: signInError } = await supa.auth.signInWithPassword({ email, password });
      if (signInError) return { error: signInError.message };
    }
    return { error: null };
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
      signIn: async () => ({ error: "AuthProvider が見つかりません" } as const),
      signUp: async () => ({ error: "AuthProvider が見つかりません" } as const),
      signOut: async () => {},
    };
  }
  return ctx;
}

export { isCloudEnabled };
