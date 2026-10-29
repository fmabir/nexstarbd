"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export type LoginMode = "signin" | "signup" | "verify" | "forgot" | "verify-reset" | "success";

/**
 * Everything the sign-in page does — sign in, sign up with an emailed OTP,
 * and password reset — without the markup, so the desktop card and the
 * phone layout run the same flow.
 */
export function useLoginFlow() {
  const { user, loading, signInWithEmail, initiateSignup, verifyOtp, resendOtp, sendPasswordResetOtp, resetPasswordWithOtp } = useAuth();
  const [localOverlay, setLocalOverlay] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next = nextParam ?? "/";

  /**
   * One sign-in form, two destinations.
   *
   * An explicit ?next= always wins (e.g. someone was bounced here from a
   * tournament registration page). Otherwise admins land on the dashboard and
   * players land on the public site.
   */
  const destinationFor = (isAdmin: boolean) => {
    if (nextParam) return nextParam;
    return isAdmin ? "/admin" : "/";
  };

  /** Asks the server whether this session is an admin one. */
  const resolveDestination = async () => {
    try {
      const res = await fetch("/api/auth/role");
      const { isAdmin } = res.ok ? await res.json() : { isAdmin: false };
      return destinationFor(Boolean(isAdmin));
    } catch {
      return destinationFor(false);
    }
  };

  const [mode, setMode] = useState<LoginMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-fill OTP from email link
  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const urlOtp = searchParams.get("otp");
    const urlType = searchParams.get("type");
    if (urlEmail && urlOtp && urlOtp.length === 6) {
      setEmail(urlEmail);
      setOtpDigits(urlOtp.split(""));
      setMode(urlType === "password_reset" ? "verify-reset" : "verify");
    }
  }, [searchParams]);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    resolveDestination().then((dest) => {
      if (!cancelled) router.replace(dest);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, nextParam, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const switchMode = (m: LoginMode) => {
    setMode(m);
    setError("");
    setInfo("");
    setEmail("");
    setPassword("");
    setDisplayName("");
    setOtpDigits(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
  };

  const showSuccess = (msg: string, redirectTo: string) => {
    setSuccessMsg(msg);
    setMode("success");
    setTimeout(() => router.replace(redirectTo), 2200);
  };

  const friendlyError = (msg: string) => {
    if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found"))
      return "Incorrect email or password.";
    if (msg.includes("email-already-in-use")) return "An account with this email already exists.";
    if (msg.includes("weak-password")) return "Password must be at least 6 characters.";
    if (msg.includes("invalid-email")) return "Please enter a valid email address.";
    if (msg.includes("too-many-requests")) return "Too many attempts. Please try again later.";
    if (msg.includes("otp-expired")) return "The code expired. Please request a new one.";
    if (msg.includes("invalid-otp")) return "Incorrect code. Please try again.";
    if (msg.includes("no-account")) return "No account found with this email.";
    return "Something went wrong. Please try again.";
  };

  const handleForgotClick = () => {
    const savedEmail = email; // carry email over intentionally
    switchMode("forgot");
    setEmail(savedEmail); // restore only email, everything else stays cleared
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      setLocalOverlay("Welcome back! Taking you in…");
      await signInWithEmail(email, password);
      const dest = await resolveDestination();
      if (dest.startsWith("/admin")) {
        setLocalOverlay("Welcome back, admin — opening your dashboard…");
      }
      await new Promise((r) => setTimeout(r, 900));
      router.replace(dest);
    } catch (err) {
      setLocalOverlay(null);
      setError(friendlyError((err as Error).message ?? ""));
      setBusy(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setBusy(true);
    const savedEmail = email;
    try {
      await initiateSignup(email, password, displayName);
      setOtpDigits(["", "", "", "", "", ""]);
      switchMode("verify");
      setEmail(savedEmail);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(friendlyError((err as Error).message ?? ""));
    } finally {
      setBusy(false);
    }
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setError(""); setBusy(true);
    const savedEmail = email;
    try {
      await sendPasswordResetOtp(email);
      setOtpDigits(["", "", "", "", "", ""]);
      setNewPassword(""); setConfirmPassword("");
      switchMode("verify-reset");
      setEmail(savedEmail);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(friendlyError((err as Error).message ?? ""));
    } finally {
      setBusy(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) {
      setTimeout(() => otpRefs.current[index + 1]?.focus(), 0);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setOtpDigits(pasted.split("")); otpRefs.current[5]?.focus(); }
  };

  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    setError(""); setBusy(true);
    try {
      await verifyOtp(email, otp);
      showSuccess("Your account has been created. Welcome to NexStarBD!", next);
    } catch (err) {
      setError(friendlyError((err as Error).message ?? ""));
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setBusy(true);
    try {
      await resetPasswordWithOtp(email, otp, newPassword);
      showSuccess("Your password has been reset successfully. Signing you in…", await resolveDestination());
    } catch (err) {
      setError(friendlyError((err as Error).message ?? ""));
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(""); setInfo("");
    try {
      if (mode === "verify-reset") await sendPasswordResetOtp(email);
      else await resendOtp(email);
      setInfo("A new code has been sent.");
      setResendCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError((err as Error).message || "Failed to resend.");
    }
  };

  return {
    user, loading, localOverlay, mode, email, setEmail, password, setPassword,
    displayName, setDisplayName, otpDigits, newPassword, setNewPassword,
    confirmPassword, setConfirmPassword, successMsg, error, setError, info, busy,
    resendCooldown, otpRefs, switchMode, handleForgotClick, handleSignIn,
    handleSignUp, handleSendResetOtp, handleOtpInput, handleOtpKeyDown,
    handleOtpPaste, handleVerifySignup, handleVerifyReset, handleResend,
  };
}
