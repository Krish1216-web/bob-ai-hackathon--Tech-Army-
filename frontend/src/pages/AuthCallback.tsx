import React, { useEffect } from "react";
import { useAuth } from "../AuthContext";
import { RefreshCw, ShieldCheck } from "lucide-react";

export default function AuthCallback({ navigate }: { navigate: (to: string) => void }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + "#/app");
      }
      navigate(user ? "/app" : "/login");
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
