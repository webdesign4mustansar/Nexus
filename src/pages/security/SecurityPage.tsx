import { useState, useRef, useEffect } from "react";

// ─── Password Strength ────────────────────────────────────────────────────────

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)               score++;
  if (pw.length >= 12)              score++;
  if (/[A-Z]/.test(pw))            score++;
  if (/[0-9]/.test(pw))            score++;
  if (/[^A-Za-z0-9]/.test(pw))     score++;

  if (score <= 1) return { score, label: "Very Weak",  color: "#dc2626" };
  if (score === 2) return { score, label: "Weak",       color: "#f97316" };
  if (score === 3) return { score, label: "Fair",       color: "#eab308" };
  if (score === 4) return { score, label: "Strong",     color: "#22c55e" };
  return              { score: 5, label: "Very Strong", color: "#16a34a" };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  const checks = [
    { label: "At least 8 characters",         ok: password.length >= 8          },
    { label: "At least 12 characters",        ok: password.length >= 12         },
    { label: "Uppercase letter (A-Z)",         ok: /[A-Z]/.test(password)        },
    { label: "Number (0-9)",                   ok: /[0-9]/.test(password)        },
    { label: "Special character (!@#$...)",    ok: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div style={{ marginTop: 8 }}>
      {/* Bars */}
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            flex: 1, height: 5, borderRadius: 999,
            background: i <= score ? color : "#e5e7eb",
            transition: "background 0.2s",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#6b7280" }}>Password strength</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{password ? label : "—"}</span>
      </div>
      {/* Checklist */}
      {password && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {checks.map((c) => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, color: c.ok ? "#16a34a" : "#d1d5db" }}>{c.ok ? "✓" : "○"}</span>
              <span style={{ fontSize: 12, color: c.ok ? "#166534" : "#9ca3af" }}>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────

function OTPInput({ onComplete }: { onComplete: (code: string) => void }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = [...otp];
    digits.forEach((d, i) => { if (i < 6) next[i] = d; });
    setOtp(next);
    const lastFilled = Math.min(digits.length, 5);
    refs.current[lastFilled]?.focus();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  }

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }} onPaste={handlePaste}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          style={{
            width: 44, height: 52, textAlign: "center",
            fontSize: 22, fontWeight: 700, color: "#111827",
            border: digit ? "2px solid #2563eb" : "1.5px solid #e5e7eb",
            borderRadius: 10, background: digit ? "#eff6ff" : "#f9fafb",
            outline: "none", transition: "all 0.15s",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SecurityPage() {
  // Password section
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [pwSaved, setPwSaved]       = useState(false);

  // 2FA section
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAStep, setTwoFAStep]       = useState<"off" | "qr" | "verify" | "done">("off");
  const [otpResult, setOtpResult]       = useState<"" | "success" | "error">("");
  const [resendTimer, setResendTimer]   = useState(0);

  // Sessions
  const sessions = [
    { device: "Chrome on Windows",   location: "Lahore, PK",     time: "Now",          current: true  },
    { device: "Safari on iPhone",    location: "Lahore, PK",     time: "2 hours ago",  current: false },
    { device: "Firefox on macOS",    location: "Karachi, PK",    time: "Yesterday",    current: false },
  ];

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  function savePassword() {
    if (!currentPw || !newPw || newPw !== confirmPw) return;
    setPwSaved(true);
    setTimeout(() => { setPwSaved(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }, 2500);
  }

  function verifyOTP(code: string) {
    // Mock: any 6-digit code works except "000000"
    if (code === "000000") { setOtpResult("error"); return; }
    setOtpResult("success");
    setTimeout(() => { setTwoFAStep("done"); setTwoFAEnabled(true); setOtpResult(""); }, 1000);
  }

  const inputStyle = (val: string): React.CSSProperties => ({
    width: "100%", fontSize: 13, padding: "9px 12px",
    border: `1px solid ${val ? "#2563eb" : "#e5e7eb"}`,
    borderRadius: 8, background: "#f9fafb", color: "#111827",
    boxSizing: "border-box", outline: "none",
  });

  const { score } = getStrength(newPw);
  const canSave = currentPw && newPw && confirmPw === newPw && score >= 3;

  return (
    <div style={{ padding: "1.5rem", maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 1.5rem" }}>
        Security & Access
      </h1>

      {/* ── Password Section ── */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem", marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 1rem" }}>
          🔑 Change Password
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Current Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"} value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                style={inputStyle(currentPw)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>New Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"} value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Enter new password"
                style={{ ...inputStyle(newPw), paddingRight: 40 }}
              />
              <button onClick={() => setShowPw((s) => !s)} style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#6b7280",
              }}>{showPw ? "🙈" : "👁️"}</button>
            </div>
            <PasswordStrengthMeter password={newPw} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Confirm New Password</label>
            <input
              type={showPw ? "text" : "password"} value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Confirm new password"
              style={{ ...inputStyle(confirmPw), borderColor: confirmPw && confirmPw !== newPw ? "#ef4444" : confirmPw ? "#22c55e" : "#e5e7eb" }}
            />
            {confirmPw && confirmPw !== newPw && (
              <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>Passwords do not match</p>
            )}
          </div>

          <button
            onClick={savePassword}
            disabled={!canSave}
            style={{
              padding: "10px", borderRadius: 8, border: "none",
              background: canSave ? (pwSaved ? "#16a34a" : "#2563eb") : "#e5e7eb",
              color: canSave ? "#fff" : "#9ca3af",
              fontSize: 14, fontWeight: 600, cursor: canSave ? "pointer" : "not-allowed",
              transition: "background 0.2s",
            }}
          >
            {pwSaved ? "✓ Password Updated!" : "Update Password"}
          </button>
        </div>
      </div>

      {/* ── 2FA Section ── */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>
              📱 Two-Factor Authentication
            </h2>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Add an extra layer of security to your account
            </p>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
            background: twoFAEnabled ? "#f0fdf4" : "#fef2f2",
            color: twoFAEnabled ? "#166534" : "#991b1b",
            border: twoFAEnabled ? "1px solid #bbf7d0" : "1px solid #fecaca",
          }}>
            {twoFAEnabled ? "✓ Enabled" : "✗ Disabled"}
          </div>
        </div>

        {twoFAStep === "off" && !twoFAEnabled && (
          <button onClick={() => setTwoFAStep("qr")} style={{
            padding: "9px 20px", borderRadius: 8, border: "none",
            background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            Enable 2FA
          </button>
        )}

        {twoFAStep === "qr" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>
              1. Install <strong>Google Authenticator</strong> or <strong>Authy</strong> on your phone.
            </p>
            <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>
              2. Scan this QR code:
            </p>
            {/* Mock QR code */}
            <div style={{
              width: 140, height: 140, background: "#111827", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 60,
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,16px)", gap: 2 }}>
                {Array.from({ length: 49 }, (_, i) =>
                  [0,1,2,3,4,5,6,7,14,21,28,35,42,43,44,45,46,47,48,8,15,22,29,36,6,13,20,27,34,41,48].includes(i)
                ).map((filled, i) => (
                  <div key={i} style={{ width: 14, height: 14, background: filled ? "#fff" : "transparent", borderRadius: 1 }} />
                ))}
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Or enter this code manually: <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" }}>NEXUS-2FA-{Math.random().toString(36).slice(2,8).toUpperCase()}</code>
            </p>
            <button onClick={() => { setTwoFAStep("verify"); setResendTimer(30); }} style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start",
            }}>
              Next: Verify Code →
            </button>
          </div>
        )}

        {twoFAStep === "verify" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>
              Enter the <strong>6-digit code</strong> from your authenticator app:
            </p>
            <OTPInput onComplete={verifyOTP} />
            {otpResult === "error" && (
              <p style={{ fontSize: 12, color: "#dc2626", textAlign: "center", margin: 0 }}>
                ✗ Invalid code. Try again.
              </p>
            )}
            {otpResult === "success" && (
              <p style={{ fontSize: 12, color: "#16a34a", textAlign: "center", margin: 0 }}>
                ✓ Code verified!
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button onClick={() => setTwoFAStep("qr")} style={{
                fontSize: 12, padding: "6px 14px", borderRadius: 6,
                border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", cursor: "pointer",
              }}>← Back</button>
              <button
                disabled={resendTimer > 0}
                onClick={() => setResendTimer(30)}
                style={{
                  fontSize: 12, padding: "6px 14px", borderRadius: 6,
                  border: "1px solid #e5e7eb", background: "#f9fafb",
                  color: resendTimer > 0 ? "#9ca3af" : "#374151", cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                }}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
              </button>
            </div>
          </div>
        )}

        {twoFAStep === "done" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px",
              fontSize: 13, color: "#166534",
            }}>
              ✅ 2FA is now active. Your account is more secure.
            </div>
            <button onClick={() => { setTwoFAEnabled(false); setTwoFAStep("off"); }} style={{
              fontSize: 12, padding: "6px 14px", borderRadius: 6, alignSelf: "flex-start",
              border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", cursor: "pointer",
            }}>Disable 2FA</button>
          </div>
        )}
      </div>

      {/* ── Active Sessions ── */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 1rem" }}>
          💻 Active Sessions
        </h2>
        {sessions.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 0", borderBottom: i < sessions.length - 1 ? "1px solid #f3f4f6" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{s.device.includes("iPhone") ? "📱" : "💻"}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{s.device}</p>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{s.location} · {s.time}</p>
              </div>
            </div>
            {s.current ? (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0",
              }}>Current</span>
            ) : (
              <button style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 6,
                background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", cursor: "pointer",
              }}>Revoke</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
