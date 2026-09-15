import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, AlertTriangle, CheckCircle2, RefreshCw, Zap, KeyRound } from "lucide-react";

export default function Login({ navigate }: { navigate: (to: string) => void }) {
  const { signIn, signInWithGoogle, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const doSignIn = async (targetEmail: string, targetPass: string) => {
    setErrorMsg(null);
    if (!targetEmail.trim() || !targetPass.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signIn(targetEmail.trim(), targetPass);
      setLoading(false);

      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials") || msg.includes("wrong password")) {
          setErrorMsg("Email or password is incorrect. You can click '1-Click Demo' below or create a new account.");
        } else if (msg.includes("email not confirmed") || msg.includes("unconfirmed")) {
          setErrorMsg("Please verify your email before signing in.");
        } else if (msg.includes("fetch") || msg.includes("network")) {
          setErrorMsg("Unable to reach the authentication service. Please check your network and try again.");
        } else {
          setErrorMsg(error.message || "Failed to sign in. Please check your credentials.");
        }
        return;
      }

      if (data?.session || data?.user) {
        window.location.hash = "/app";
        navigate("/app");
      }
    } catch (_err) {
      setLoading(false);
      setErrorMsg("Unable to reach the authentication service. Please try again.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSignIn(email, password);
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    doSignIn(demoEmail, "Password123!");
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setGoogleLoading(false);
        setErrorMsg("Google sign-in could not be completed. Please try again.");
      }
    } catch {
      setGoogleLoading(false);
      setErrorMsg("Google sign-in could not be completed. Please try again.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    try {
      const { error } = await resetPassword(resetEmail.trim());
      setResetLoading(false);
      if (error) {
        setErrorMsg(error.message || "Unable to send password reset email.");
      } else {
        setResetSent(true);
      }
    } catch {
      setResetLoading(false);
      setErrorMsg("Unable to send password reset link.");
    }
  };

  return (
    <div className="auth-viewport" style={{ minHeight: "100vh", background: "#080d1c", display: "flex", color: "#f1f5f9" }}>
      {/* Left Column: Brand & Control Tower Presentation */}
      <div
        className="auth-left-banner"
        style={{
          flex: "1.1",
          background: "linear-gradient(145deg, #0b1426 0%, #060a14 100%)",
          borderRight: "1px solid #1e2c45",
          padding: "50px 60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Glow overlay */}
        <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "450px", height: "450px", background: "radial-gradient(circle, rgba(8,181,229,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: "450px", height: "450px", background: "radial-gradient(circle, rgba(22,199,132,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div>
          <div
            onClick={() => navigate("/")}
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#08b5e5", marginBottom: "40px" }}
          >
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(8,181,229,0.12)", border: "1px solid rgba(8,181,229,0.3)", display: "grid", placeItems: "center" }}>
              <ShieldCheck size={22} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "14px", letterSpacing: "1px", fontWeight: "700", fontSize: "14px" }}>
              <span><b>CHAIN</b><b>GUARD</b><b>AI</b></span>
            </div>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(8,181,229,0.08)", border: "1px solid rgba(8,181,229,0.2)", borderRadius: "20px", padding: "4px 12px", fontSize: "11px", color: "#08b5e5", marginBottom: "20px" }}>
            <Sparkles size={12} /> IBM BoB AI Innovation Hackathon 2026
          </div>

          <h1 style={{ fontSize: "36px", fontWeight: "700", lineHeight: "1.2", margin: "0 0 16px", color: "#f8fafc", letterSpacing: "-0.5px" }}>
            Welcome back to the <span style={{ color: "#08b5e5" }}>control tower</span>.
          </h1>
          <p style={{ fontSize: "14px", lineHeight: "1.7", color: "#8fa3c1", maxWidth: "480px", margin: "0 0 36px" }}>
            Monitor disruptions, optimize fleet utilization and protect cold-chain shipments from one unified intelligent workspace.
          </p>

          {/* Operational Micro-Preview */}
          <div style={{ background: "#0e1829", border: "1px solid #202e48", borderRadius: "12px", padding: "18px 20px", maxWidth: "480px", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #1c283f", paddingBottom: "10px" }}>
              <span style={{ fontSize: "11px", color: "#16c784", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
                <i className="dot green" /> NETWORK LIVE SYNCHRONIZED
              </span>
              <span style={{ fontSize: "10px", color: "#627795" }}>Supabase + watsonx</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center" }}>
              <div style={{ background: "#131f36", padding: "10px 8px", borderRadius: "8px", border: "1px solid #1e2c45" }}>
                <strong style={{ display: "block", fontSize: "18px", color: "#ff414d" }}>4</strong>
                <span style={{ fontSize: "10px", color: "#8fa3c1" }}>Active Events</span>
              </div>
              <div style={{ background: "#131f36", padding: "10px 8px", borderRadius: "8px", border: "1px solid #1e2c45" }}>
                <strong style={{ display: "block", fontSize: "18px", color: "#ff8a00" }}>8</strong>
                <span style={{ fontSize: "10px", color: "#8fa3c1" }}>Critical Cargo</span>
              </div>
              <div style={{ background: "#131f36", padding: "10px 8px", borderRadius: "8px", border: "1px solid #1e2c45" }}>
                <strong style={{ display: "block", fontSize: "18px", color: "#08b5e5" }}>$4.8M</strong>
                <span style={{ fontSize: "10px", color: "#8fa3c1" }}>Protected Value</span>
              </div>
            </div>

            <div style={{ marginTop: "12px", fontSize: "11px", color: "#8fa3c1", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={13} style={{ color: "#ff414d", flexShrink: 0 }} />
              <span>Priority alert: <b>SHP-1042</b> (mRNA Vaccines) Mundra reroute ready</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: "12px", color: "#627795", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px" }}>
          <span>© 2026 ChainGuard AI · Enterprise Grade</span>
          <span>ISO/IEC 27001 · FDA 21 CFR Compliant</span>
        </div>
      </div>

      {/* Right Column: Sign In Form Card */}
      <div
        className="auth-right-container"
        style={{
          flex: "0.9",
          minWidth: "380px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 30px"
        }}
      >
        <div
          className="auth-card"
          style={{
            width: "100%",
            maxWidth: "430px",
            background: "#0e172a",
            border: "1px solid #20314f",
            borderRadius: "16px",
            padding: "32px 28px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 6px", color: "#f8fafc" }}>Sign in</h2>
            <p style={{ fontSize: "13px", color: "#8fa3c1", margin: 0 }}>Access your ChainGuard control tower.</p>
          </div>

          {/* Quick 1-Click Demo Login Bar */}
          <div style={{ background: "rgba(8,181,229,0.06)", border: "1px solid rgba(8,181,229,0.22)", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#08b5e5", display: "flex", alignItems: "center", gap: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <Zap size={13} fill="#08b5e5" /> 1-Click Demo Login
              </span>
              <span style={{ fontSize: "10px", color: "#627795" }}>Supabase Live Auth</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin@chainguard.ai")}
                disabled={loading || googleLoading}
                style={{
                  background: "#131f36",
                  border: "1px solid #283e5f",
                  borderRadius: "6px",
                  padding: "7px 10px",
                  color: "#f8fafc",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px"
                }}
                title="admin@chainguard.ai / Password123!"
              >
                <KeyRound size={12} style={{ color: "#08b5e5" }} />
                <span>Admin (Full Access)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("user@chainguard.ai")}
                disabled={loading || googleLoading}
                style={{
                  background: "#131f36",
                  border: "1px solid #283e5f",
                  borderRadius: "6px",
                  padding: "7px 10px",
                  color: "#f8fafc",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px"
                }}
                title="user@chainguard.ai / Password123!"
              >
                <KeyRound size={12} style={{ color: "#16c784" }} />
                <span>Operations Lead</span>
              </button>
            </div>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div style={{ background: "rgba(255,65,77,0.1)", border: "1px solid rgba(255,65,77,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "18px", fontSize: "12px", color: "#ff6570", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "5px" }}>Email address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#627795" }} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@chainguard.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#131f36",
                    border: "1px solid #243550",
                    borderRadius: "8px",
                    padding: "9px 12px 9px 38px",
                    color: "#f8fafc",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>Password</label>
                <button
                  type="button"
                  onClick={() => { setShowResetModal(true); setResetSent(false); setResetEmail(email); }}
                  style={{ background: "transparent", color: "#08b5e5", fontSize: "11px", fontWeight: "600", padding: 0, cursor: "pointer" }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#627795" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#131f36",
                    border: "1px solid #243550",
                    borderRadius: "8px",
                    padding: "9px 38px 9px 38px",
                    color: "#f8fafc",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", color: "#627795", cursor: "pointer", display: "grid", placeItems: "center", padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              style={{
                width: "100%",
                background: "#08b5e5",
                color: "#001824",
                fontWeight: "700",
                fontSize: "13px",
                padding: "11px",
                borderRadius: "8px",
                marginTop: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s ease",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "18px 0", color: "#627795", fontSize: "11px", fontWeight: "600" }}>
            <div style={{ flex: 1, height: "1px", background: "#202e48" }} />
            <span>OR</span>
            <div style={{ flex: 1, height: "1px", background: "#202e48" }} />
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            style={{
              width: "100%",
              background: "#131f36",
              border: "1px solid #243550",
              color: "#f8fafc",
              fontWeight: "600",
              fontSize: "13px",
              padding: "10px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: googleLoading ? "not-allowed" : "pointer"
            }}
          >
            {googleLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Switch to Sign Up */}
          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "#8fa3c1" }}>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={{ background: "transparent", color: "#08b5e5", fontWeight: "700", padding: 0, cursor: "pointer", marginLeft: "4px" }}
            >
              Create account
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "380px", background: "#0e172a", border: "1px solid #243550", borderRadius: "12px", padding: "26px", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 8px", color: "#f1f5f9" }}>Reset Password</h3>
            <p style={{ fontSize: "12px", color: "#8fa3c1", margin: "0 0 16px" }}>
              Enter your registered email address and we will send you a link to reset your password.
            </p>

            {resetSent ? (
              <div style={{ background: "rgba(22,199,132,0.1)", border: "1px solid #16c784", borderRadius: "8px", padding: "14px", textAlign: "center", color: "#16c784", fontSize: "12px", marginBottom: "16px" }}>
                <CheckCircle2 size={24} style={{ margin: "0 auto 8px" }} />
                <strong>Password reset link sent!</strong>
                <p style={{ margin: "4px 0 0", color: "#c7d5e8", fontSize: "11px" }}>Please check your inbox to proceed.</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={{ width: "100%", background: "#131f36", border: "1px solid #243550", borderRadius: "6px", padding: "9px 12px", color: "#f8fafc", fontSize: "12px", outline: "none", marginBottom: "14px" }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    style={{ flex: 1, background: "#1b263b", border: "1px solid #2a3c58", color: "#8fa3c1", padding: "8px", borderRadius: "6px", fontSize: "12px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    style={{ flex: 1, background: "#08b5e5", color: "#001824", fontWeight: "700", padding: "8px", borderRadius: "6px", fontSize: "12px" }}
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}

            {resetSent && (
              <button
                onClick={() => setShowResetModal(false)}
                style={{ width: "100%", background: "#08b5e5", color: "#001824", fontWeight: "700", padding: "8px", borderRadius: "6px", fontSize: "12px" }}
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
