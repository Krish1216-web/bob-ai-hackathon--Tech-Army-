import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  supabase,
  signInWithPassword as supabaseSignIn,
  signUpWithPassword as supabaseSignUp,
  signInWithGoogle as supabaseSignInWithGoogle,
  signOut as supabaseSignOut,
  resetPasswordForEmail as supabaseResetPassword,
  persistProfile
} from "./supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
  signInWithGoogle: () => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = true;

  useEffect(() => {
    // Clear any obsolete demo user from previous mock sessions
    localStorage.removeItem("chainguard_demo_user");

    // 1. Initial Session Check with Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        persistProfile(session.user);
      }
      setLoading(false);
    }).catch((err) => {
      console.warn("Error getting Supabase session:", err);
      setLoading(false);
    });

    // 2. Subscribe to auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        persistProfile(session.user);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await supabaseSignIn(email, password);
      if (result.error) {
        setLoading(false);
        return result;
      }
      setUser(result.data?.user ?? null);
      setSession(result.data?.session ?? null);
      if (result.data?.user) {
        await persistProfile(result.data.user);
      }
      setLoading(false);
      return result;
    } catch (err: any) {
      setLoading(false);
      return { data: null, error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const result = await supabaseSignUp(email, password, fullName);
      if (result.error) {
        setLoading(false);
        return result;
      }
      if (result.data?.user) {
        await persistProfile(result.data.user);
      }
      setLoading(false);
      return result;
    } catch (err: any) {
      setLoading(false);
      return { data: null, error: err };
    }
  };

  const signInWithGoogle = async () => {
    return await supabaseSignInWithGoogle();
  };

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem("chainguard_demo_user");
    setUser(null);
    setSession(null);
    const res = await supabaseSignOut();
    setLoading(false);
    return res;
  };

  const resetPassword = async (email: string) => {
    return await supabaseResetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
