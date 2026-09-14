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
  const isConfigured = Boolean(supabase);

  useEffect(() => {
    if (!supabase) {
      // Check if there is a local demo session stored
      const demoUserJson = localStorage.getItem("chainguard_demo_user");
      if (demoUserJson) {
        try {
          const parsed = JSON.parse(demoUserJson);
          setUser(parsed);
          setSession({ user: parsed } as any);
        } catch {
          // ignore
        }
      }
      setLoading(false);
      return;
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        persistProfile(session.user);
      }
      setLoading(false);
    }).catch(() => {
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
    if (!supabase) {
      // Demo fallback mode when Supabase credentials are pending
      const mockUser: User = {
        id: `demo-${Date.now()}`,
        app_metadata: { provider: "email" },
        user_metadata: { full_name: email.split("@")[0] || "Operations Lead" },
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: email
      } as User;
      localStorage.setItem("chainguard_demo_user", JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({ user: mockUser } as any);
      setLoading(false);
      return { data: { user: mockUser, session: { user: mockUser } }, error: null };
    }

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
    if (!supabase) {
      const mockUser: User = {
        id: `demo-${Date.now()}`,
        app_metadata: { provider: "email" },
        user_metadata: { full_name: fullName || email.split("@")[0] || "Operations Lead" },
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: email
      } as User;
      localStorage.setItem("chainguard_demo_user", JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({ user: mockUser } as any);
      setLoading(false);
      return { data: { user: mockUser, session: { user: mockUser } }, error: null };
    }

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
    if (!supabase) {
      const mockUser: User = {
        id: `google-${Date.now()}`,
        app_metadata: { provider: "google" },
        user_metadata: { full_name: "Google Operations Lead", avatar_url: "" },
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: "lead@chainguard.ai"
      } as User;
      localStorage.setItem("chainguard_demo_user", JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({ user: mockUser } as any);
      return { data: { user: mockUser }, error: null };
    }

    return await supabaseSignInWithGoogle();
  };

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem("chainguard_demo_user");
    setUser(null);
    setSession(null);

    let res = { error: null };
    if (supabase) {
      res = await supabaseSignOut();
    }
    setLoading(false);
    return res;
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { data: { message: "Password reset link simulated in Demo mode." }, error: null };
    }
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
