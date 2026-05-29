"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, signOut, signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";

type Mode = "signin" | "forgot" | "verify-reset";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (searchParams.get("error") === "forbidden") {
      setError("This account does not have admin access.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setInfo("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();

      const res = await fetch("/api/auth/admin-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.status === 403) {
        await signOut(auth);
        setError("This account does not have admin access.");
        return;
      }
      if (!res.ok) throw new Error("session-error");

      router.push("/admin");
    } catch (err) {
      const msg = (err as Error).message ?? "";
      if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found"))
        setError("Incorrect email or password.");
      else if (msg.includes("session-error"))
        setError("Failed to create session. Please try again.");
      else
        setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "password_reset" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "no-account") { setError("No account found with this email."); return; }
        throw new Error();
      }
      setOtpDigits(["", "", "", "", "", ""]);
      setNewPassword(""); setConfirmPassword("");
      switchMode("verify-reset");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    setLoading(true);
    try {
      const resetRes = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const resetData = await resetRes.json();
      if (!resetRes.ok) {
        if (resetData.error === "otp-expired") { setError("Code expired. Request a new one."); return; }
        if (resetData.error === "weak-password") { setError("Password must be at least 6 characters."); return; }
        setError("Incorrect code. Please try again.");
        return;
      }

      // Sign in with custom token, then create admin session
      const credential = await signInWithCustomToken(auth, resetData.customToken);
      const token = await credential.user.getIdToken();

      const sessionRes = await fetch("/api/auth/admin-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (sessionRes.status === 403) {
        await signOut(auth);
        setError("This account does not have admin access.");
        switchMode("signin");
        return;
      }
      if (!sessionRes.ok) throw new Error();

      router.push("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(""); setInfo("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "password_reset" }),
      });
      if (!res.ok) throw new Error();
      setInfo("A new code has been sent.");
      setResendCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Failed to resend. Please try again.");
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setOtpDigits(pasted.split("")); otpRefs.current[5]?.focus(); }
  };

  const inputClass = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  const Logo = () => (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-0 mb-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/banners/lnsbd.png" alt="NexStarBD logo" style={{ height: "100px", width: "auto", display: "block", transform: "translateY(-8px) translateX(8px)" }} />
        <h1 className="font-brand font-bold text-4xl text-white tracking-wide">
          NexStar<span className="text-primary">B</span><span className="text-green-700">D</span>
        </h1>
      </div>
      <p className="text-gray-400 text-sm mt-2">Admin Panel</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Logo />

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="font-display text-2xl text-foreground tracking-wide mb-2">
            {mode === "signin" && "Admin Login"}
            {mode === "forgot" && "Reset Password"}
            {mode === "verify-reset" && "Enter Reset Code"}
          </h2>

          {mode === "verify-reset" && (
            <p className="text-sm text-muted-foreground mb-5">
              Code sent to <span className="font-semibold text-foreground">{email}</span>
            </p>
          )}
          {mode === "forgot" && !error && (
            <p className="text-sm text-muted-foreground mb-5">
              {email
                ? <>We&apos;ll send a reset code to <span className="font-semibold text-foreground">{email}</span></>
                : "Enter your admin email to receive a reset code."
              }
            </p>
          )}

          {error && (
            <div className="bg-primary-light border border-primary rounded-xl px-4 py-3 text-primary text-sm mb-4">
              {error}
            </div>
          )}
          {info && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm mb-4">
              {info}
            </div>
          )}

          {/* Sign in */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="email" className={inputClass} placeholder="admin@nexstarbd.com" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold">Password</label>
                  <button type="button" onClick={() => switchMode("forgot")}
                    className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password" className={inputClass} placeholder="••••••••" />
              </div>
              <Button type="submit" loading={loading} className="w-full mt-2">Sign In</Button>
            </form>
          )}

          {/* Forgot — send OTP */}
          {mode === "forgot" && (
            <form onSubmit={handleSendResetOtp} className="space-y-4">
              {!email && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required autoComplete="email" className={inputClass} placeholder="admin@nexstarbd.com" />
                </div>
              )}
              <Button type="submit" loading={loading} className="w-full">Send Reset Code</Button>
              {email && (
                <div className="text-center text-xs text-muted-foreground">
                  Wrong email?{" "}
                  <button type="button" onClick={() => setEmail("")} className="text-primary hover:underline">Change it</button>
                </div>
              )}
              <div className="text-center">
                <button type="button" onClick={() => switchMode("signin")}
                  className="text-xs text-muted-foreground hover:underline">← Back to Sign In</button>
              </div>
            </form>
          )}

          {/* OTP + new password */}
          {mode === "verify-reset" && (
            <form onSubmit={handleVerifyReset} className="space-y-4">
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input key={i} ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 text-center text-xl font-bold border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                    style={{ height: "52px" }} />
                ))}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  required placeholder="Min. 6 characters" className={inputClass} autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  required placeholder="Repeat new password" className={inputClass} autoComplete="new-password" />
              </div>
              <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
              <div className="text-center text-sm text-muted-foreground">
                Didn&apos;t get the code?{" "}
                <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
                  className="text-primary font-semibold hover:underline disabled:opacity-50">
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                </button>
              </div>
              <div className="text-center">
                <button type="button" onClick={() => switchMode("forgot")}
                  className="text-xs text-muted-foreground hover:underline">← Back</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
