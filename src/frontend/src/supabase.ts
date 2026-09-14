import { createClient, type User } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://ginxkxhzrxwjgcfksklf.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbnhreGh6cnh3amdjZmtza2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MDc0MDksImV4cCI6MjEwNDk4MzQwOX0.Lhf6VBtXzUy4PR86fsp_UewSBiNiMvc-zcV-OQf3TKM";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export async function signInWithPassword(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email: string, password: string, fullName?: string) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: {
        full_name: fullName || email.split("@")[0]
      }
    }
  });
}

export async function signInWithGoogle() {
  const redirectTo = `${window.location.origin}/`;

  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "select_account"
      }
    }
  });
}

export async function resetPasswordForEmail(email: string) {
  const redirectTo = `${window.location.origin}/#login`;
  return await supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function persistProfile(user: User | null, provider: string = "email") {
  if (!user) {
    return { data: null, error: null };
  }

  const email = user.email || "";
  const normalizedProvider = (user.app_metadata?.provider || provider || "email").toLowerCase();
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.fullName || email.split("@")[0];
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

  try {
    return await supabase.from("profiles").upsert({
      id: user.id,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      provider: normalizedProvider,
      updated_at: new Date().toISOString()
    }, { onConflict: "id" });
  } catch (e) {
    console.warn("Profile table upsert skipped (table might be optional):", e);
    return { data: null, error: null };
  }
}
