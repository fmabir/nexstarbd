"use client";

import { Suspense } from "react";
import { useLoginFlow } from "@/lib/hooks/useLoginFlow";
import { MobileLogin } from "@/components/mobile/auth/MobileLogin";

const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card";

function LoginForm() {
  const {
    user, loading, localOverlay, mode, email, setEmail, password, setPassword,
    displayName, setDisplayName, otpDigits, newPassword, setNewPassword,
    confirmPassword, setConfirmPassword, successMsg, error, info, busy,
    resendCooldown, otpRefs, switchMode, handleForgotClick, handleSignIn,
    handleSignUp, handleSendResetOtp, handleOtpInput, handleOtpKeyDown,
    handleOtpPaste, handleVerifySignup, handleVerifyReset, handleResend,
  } = useLoginFlow();

  const OtpBoxes = () => (
    <div className="flex gap-1.5 sm:gap-2 justify-center" onPaste={handleOtpPaste}>
      {otpDigits.map((digit, i) => (
        <input key={i} ref={(el) => { otpRefs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          onChange={(e) => handleOtpInput(i, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(i, e)}
          onKeyUp={(e) => {
            const input = e.target as HTMLInputElement;
            if (input.value && i < 5 && !otpDigits[i + 1]) {
              setTimeout(() => otpRefs.current[i + 1]?.focus(), 0);
            }
          }}
          className="flex-1 min-w-0 max-w-[3.25rem] h-13 text-center text-xl font-bold border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card" />
      ))}
    </div>
  );

  const ResendButton = () => (
    <div className="text-center text-sm text-muted-foreground">
      Didn&apos;t get the code?{" "}
      <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
        className="text-primary font-semibold hover:underline disabled:opacity-50">
        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!loading && user) return null;

  if (localOverlay) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="flex items-center gap-0 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/banners/lnsbd.png" alt="NexStarBD" style={{ height: "72px", width: "auto", transform: "translateY(-6px) translateX(6px)" }} />
          <span className="font-brand font-bold text-3xl tracking-wide">
            NexStar<span className="text-pink-800">B</span><span className="text-green-800">D</span>
          </span>
        </div>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">{localOverlay}</p>
      </div>
    );
  }

  // Success screen
  if (mode === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-foreground font-semibold text-base mb-1">{successMsg}</p>
          <p className="text-muted-foreground text-sm">Redirecting you now…</p>
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">

        {/* Logo */}
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-0 mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/banners/lnsbd.png" alt="NexStarBD logo" style={{ height: "88px", width: "auto", display: "block", transform: "translateY(-8px) translateX(8px)" }} />
            <h1 className="font-brand font-bold text-3xl text-foreground tracking-wide">
              NexStar<span className="text-pink-800">B</span><span className="text-green-800">D</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "signin" && "Sign in to register for tournaments"}
            {mode === "signup" && "Create your player account"}
            {mode === "verify" && "Check your email for a code"}
            {mode === "forgot" && "Reset your password"}
            {mode === "verify-reset" && "Enter the code we sent you"}
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm mb-4">{error}</div>}
        {info && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm mb-4">{info}</div>}

        {/* Signup OTP verify */}
        {mode === "verify" && (
          <form onSubmit={handleVerifySignup} className="space-y-5">
            <p className="text-sm text-muted-foreground text-center">
              We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
            </p>
            <OtpBoxes />
            <button type="submit" disabled={busy}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
              {busy ? "Verifying…" : "Verify Email"}
            </button>
            <ResendButton />
            <div className="text-center">
              <button type="button" onClick={() => switchMode("signup")} className="text-xs text-muted-foreground hover:underline py-2 px-2 inline-block">← Back</button>
            </div>
          </form>
        )}

        {/* Forgot — send OTP */}
        {mode === "forgot" && (
          <form onSubmit={handleSendResetOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com" required className={inputClass} autoComplete="email" />
            </div>
            {email && email.includes("@") && (
              <p className="text-sm text-muted-foreground text-center">
                We&apos;ll send a reset code to <span className="font-semibold text-foreground">{email}</span>
              </p>
            )}
            <button type="submit" disabled={busy}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
              {busy ? "Sending…" : "Send Reset Code"}
            </button>
            {email && (
              <div className="text-center text-xs text-muted-foreground">
                Wrong email?{" "}
                <button type="button" onClick={() => setEmail("")} className="text-primary hover:underline">Change it</button>
              </div>
            )}
            <div className="text-center">
              <button type="button" onClick={() => switchMode("signin")} className="text-xs text-muted-foreground hover:underline py-2 px-2 inline-block">← Back to Sign In</button>
            </div>
          </form>
        )}

        {/* Password reset OTP + new password */}
        {mode === "verify-reset" && (
          <form onSubmit={handleVerifyReset} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enter the code sent to <span className="font-semibold text-foreground">{email}</span>
            </p>
            <OtpBoxes />
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters" required className={inputClass} autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password" required className={inputClass} autoComplete="new-password" />
            </div>
            <button type="submit" disabled={busy}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
              {busy ? "Resetting…" : "Reset Password"}
            </button>
            <ResendButton />
            <div className="text-center">
              <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-muted-foreground hover:underline py-2 px-2 inline-block">← Back</button>
            </div>
          </form>
        )}

        {/* Sign in / Sign up */}
        {(mode === "signin" || mode === "signup") && (
          <form onSubmit={mode === "signup" ? handleSignUp : handleSignIn} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Your Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Safwan" className={inputClass} autoComplete="name" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com" required className={inputClass} autoComplete="email" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-foreground">Password</label>
                {mode === "signin" && (
                  <button type="button" onClick={handleForgotClick} className="text-xs text-primary hover:underline py-1 px-1 -mr-1">
                    Forgot password?
                  </button>
                )}
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                required className={inputClass}
                autoComplete={mode === "signup" ? "new-password" : "current-password"} />
            </div>
            <button type="submit" disabled={busy}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        )}

        {(mode === "signin" || mode === "signup") && (
          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>Don&apos;t have an account?{" "}
                <button onClick={() => switchMode("signup")} className="text-primary font-semibold hover:underline py-2 px-1 inline-block">Create one</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => switchMode("signin")} className="text-primary font-semibold hover:underline py-2 px-1 inline-block">Sign in</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="m-app min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      {/* Phone layout — same flow (useLoginFlow), its own design */}
      <div className="md:hidden">
        <MobileLogin />
      </div>
      <div className="hidden md:block">
        <LoginForm />
      </div>
    </Suspense>
  );
}
