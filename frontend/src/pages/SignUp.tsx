import { Maritime3DBackground } from "../Maritime3DBackground";
﻿import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, Sparkles, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

export default function SignUp({ navigate }: { navigate: (to: string) => void }) {
  const { user, signUp, signInWithGoogle } = useAuth();

  React.useEffect(() => {
    if (user) {
      window.location.hash = "/app";
      navigate("/app");
    }
  }, [user, navigate]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Use at least 8 characters with a mix of letters and numbers.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please check again.");
      return;
    }

    if (!termsAgreed) {
      setErrorMsg("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUp(email.trim(), password, fullName.trim());
      setLoading(false);

      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (msg.includes("already registered") || msg.includes("user already exists")) {
          setErrorMsg("An account with this email already exists. Please sign in instead.");
        } else if (msg.includes("password")) {
          setErrorMsg("Use at least 8 characters with a mix of letters and numbers.");
        } else if (msg.includes("fetch") || msg.includes("network")) {
          setErrorMsg("Unable to reach the authentication service. Please try again.");
        } else {
          setErrorMsg(error.message || "Failed to create account. Please try again.");
        }
        return;
      }

      // Navigate to app on signup
      if (data?.user || data?.session) {
        window.location.hash = "/app";
        navigate("/app");
      } else {
        window.location.hash = "/app";
        navigate("/app");
      }
    } catch (_err) {
      setLoading(false);
      setErrorMsg("Unable to reach the authentication service. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      const { data, error } = await signInWithGoogle();
      setGoogleLoading(false);
      if (data?.user) {
        window.location.hash = "/app";
        navigate("/app");
      }
    } catch {
      setGoogleLoading(false);
      window.location.hash = "/app";
      navigate("/app");
    }
  };

  return (
    <div className="auth-viewport" style={{ minHeight: "100vh", background: "transparent", display: "flex", color: "#f1f5f9", position: "relative", overflow: "hidden" }}>
      <Maritime3DBackground opacity={0.82} theme="cyber-maritime" />
      {/* Left Column: Brand & Security Features */}
      <div
        className="auth-left-banner"
        style={{
          flex: "1.1",
          background: "transparent",
          zIndex: 1,
          padding: "50px 60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "450px", height: "450px", background: "radial-gradient(circle, rgba(8,181,229,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

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
            <Sparkles size={12} /> Enterprise Logistics SaaS
          </div>

          <h1 style={{ fontSize: "36px", fontWeight: "700", lineHeight: "1.2", margin: "0 0 16px", color: "#f8fafc", letterSpacing: "-0.5px" }}>
            Start with the next-generation <span style={{ color: "#08b5e5" }}>AI Control Tower</span>.
          </h1>
          <p style={{ fontSize: "14px", lineHeight: "1.7", color: "#8fa3c1", maxWidth: "480px", margin: "0 0 32px" }}>
            Join global supply chain operators and logistics teams protecting critical consignments, avoiding port delays, and optimizing fleet utilization with real-time AI.
          </p>

          {/* Benefits Grid */}
          <div style={{ display: "grid", gap: "14px", maxWidth: "480px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "#0e1829", border: "1px solid #1c2b42", borderRadius: "10px", padding: "12px 14px" }}>
              <CheckCircle2 size={18} style={{ color: "#16c784", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "#f1f5f9", display: "block" }}>Autonomous Multi-Corridor Rerouting</strong>
                <span style={{ fontSize: "11px", color: "#8fa3c1" }}>Calculate time & cost savings with instant carrier redeployment recommendations.</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "#0e1829", border: "1px solid #1c2b42", borderRadius: "10px", padding: "12px 14px" }}>
              <CheckCircle2 size={18} style={{ color: "#08b5e5", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "#f1f5f9", display: "block" }}>LiveCold™ Cold Chain Excursion Shield</strong>
                <span style={{ fontSize: "11px", color: "#8fa3c1" }}>24/7 IoT sensor monitoring, FDA 21 CFR Part 11 compliance, and nearest certified cold-hub diversion.</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "#0e1829", border: "1px solid #1c2b42", borderRadius: "10px", padding: "12px 14px" }}>
              <CheckCircle2 size={18} style={{ color: "#ff8a00", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "#f1f5f9", display: "block" }}>Dynamic Fleet Capacity Matcher</strong>
                <span style={{ fontSize: "11px", color: "#8fa3c1" }}>Turn idle capacity into operational resilience with 91%+ AI asset matching scores.</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "#627795", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px" }}>
          <span>© 2026 ChainGuard AI · Enterprise Grade</span>
          <span>Supabase Auth · End-to-End Encrypted</span>
        </div>
      </div>

      {/* Right Column: Sign Up Card */}
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
            maxWidth: "440px",
            background: "rgba(14, 23, 42, 0.86)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 1,
            border: "1px solid #20314f",
            borderRadius: "16px",
            padding: "36px 32px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 6px", color: "#f8fafc" }}>Create your account</h2>
            <p style={{ fontSize: "13px", color: "#8fa3c1", margin: 0 }}>Start optimizing logistics operations in minutes.</p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{ background: "rgba(255,65,77,0.1)", border: "1px solid rgba(255,65,77,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "18px", fontSize: "12px", color: "#ff6570", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div style={{ background: "rgba(22,199,132,0.1)", border: "1px solid #16c784", borderRadius: "8px", padding: "12px 14px", marginBottom: "18px", fontSize: "12px", color: "#16c784", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "4px" }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <UserIcon size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#627795" }} />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Alex Mercer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(10, 24, 52, 0.75)",
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
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "4px" }}>Work Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#627795" }} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="alex@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(10, 24, 52, 0.75)",
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
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "4px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#627795" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(10, 24, 52, 0.75)",
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

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "4px" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#627795" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(10, 24, 52, 0.75)",
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

            {/* Terms Checkbox */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "2px" }}>
              <input
                type="checkbox"
                id="terms"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                style={{ marginTop: "3px", accentColor: "#08b5e5", cursor: "pointer" }}
              />
              <label htmlFor="terms" style={{ fontSize: "11px", color: "#8fa3c1", lineHeight: "1.4", cursor: "pointer" }}>
                I agree to the <span style={{ color: "#08b5e5" }}>Terms of Service</span> and <span style={{ color: "#08b5e5" }}>Privacy Policy</span>
              </label>
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
                marginTop: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Creating your account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
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
              background: "rgba(10, 24, 52, 0.75)",
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

          {/* Switch to Sign In */}
          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "#8fa3c1" }}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{ background: "transparent", color: "#08b5e5", fontWeight: "700", padding: 0, cursor: "pointer", marginLeft: "4px" }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
