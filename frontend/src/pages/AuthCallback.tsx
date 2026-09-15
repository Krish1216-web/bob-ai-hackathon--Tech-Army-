import React, { useEffect } from "react";
import { useAuth } from "../AuthContext";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { supabase, persistProfile } from "../supabase";

export default function AuthCallback({ navigate }: { navigate: (to: string) => void }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Check if URL contains auth hash fragments
    const hash = window.location.hash;
    const search = window.location.search;

    if (hash.includes("access_token=") || search.includes("code=")) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          try {
            localStorage.setItem("chainguard_auth_user", JSON.stringify(session.user));
          } catch {}
          persistProfile(session.user).catch(() => {});
        }
        if (window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname + "#/app");
        }
        window.location.hash = "/app";
        navigate("/app");
      }).catch(() => {
        window.location.hash = "/app";
        navigate("/app");
      });
      return;
    }

    if (!loading) {
      if (window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + "#/app");
      }
      window.location.hash = "/app";
      navigate("/app");
    }
  }, [user, loading, navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#080d1c", display: "grid", placeItems: "center", color: "#f8fafc" }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(8,181,229,0.1)", border: "1px solid #08b5e5", display: "grid", placeItems: "center", color: "#08b5e5" }}>
          <ShieldCheck size={26} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <RefreshCw size={18} className="animate-spin" style={{ color: "#08b5e5" }} />
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#c7d5e8" }}>Authenticating with ChainGuard Control Tower...</span>
        </div>
      </div>
    </div>
  );
}
