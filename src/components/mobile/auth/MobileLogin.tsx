"use client";

import { useId } from "react";
import { useLoginFlow, type LoginMode } from "@/lib/hooks/useLoginFlow";
import { ArtTile, BackLink, Wordmark, art, mBtn, mInput } from "@/components/mobile/ui/primitives";
import { CheckIcon } from "@/components/mobile/ui/icons";

const linkBtn = "text-m-red-text font-semibold active:opacity-70";
const backBtn = "block mx-auto py-2 px-3 text-[14px] font-medium text-m-dim active:text-m-text";

const heading: Record<Exclude<LoginMode, "success">, { title: string; subtitle: string }> = {
  signin: { title: "Welcome back", subtitle: "Sign in to register for tournaments" },
  signup: { title: "Create account", subtitle: "Create your player account" },
  verify: { title: "Verify your email", subtitle: "Check your email for a code" },
  forgot: { title: "Reset password", subtitle: "Reset your password" },
  "verify-reset": { title: "Enter your code", subtitle: "Enter the code we sent you" },
};

function Field({
  label,
  aside,
  ...input
}: { label: string; aside?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-[14px] font-medium text-m-text">
          {label}
        </label>
        {aside}
      </div>
      <input id={id} className={mInput} {...input} />
    </div>
  );
}

function Spinner() {
  return <div className="w-8 h-8 border-2 border-m-red border-t-transparent rounded-full animate-spin" />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="m-app min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center">{children}</div>
  );
}

/** Sign in / sign up / reset for phones — full screen, same flow as the desktop card. */
export function MobileLogin() {
  const f = useLoginFlow();

  if (f.loading) {
    return (
      <Centered>
        <Spinner />
      </Centered>
    );
  }

  if (f.user) return null;

  if (f.localOverlay) {
    return (
      <Centered>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/banners/lnsbd.png" alt="NexStarBD" className="w-16 h-16" />
        <Spinner />
        <p className="text-[14px] font-medium text-m-dim">{f.localOverlay}</p>
      </Centered>
    );
  }

  if (f.mode === "success") {
    return (
      <Centered>
        <span className="w-16 h-16 rounded-full bg-m-green/15 text-m-green-text flex items-center justify-center">
          <CheckIcon size={30} />
        </span>
        <p className="text-[17px] font-semibold text-m-text max-w-[18rem]">{f.successMsg}</p>
        <p className="text-[14px] text-m-dim">Redirecting you now…</p>
        <Spinner />
      </Centered>
    );
  }

  const h = heading[f.mode];

  // Called, not rendered as <OtpBoxes/>, so the inputs keep focus between keystrokes
  const otpBoxes = () => (
    <div className="flex gap-2 justify-center" onPaste={f.handleOtpPaste}>
      {f.otpDigits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            f.otpRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => f.handleOtpInput(i, e.target.value)}
          onKeyDown={(e) => f.handleOtpKeyDown(i, e)}
          onKeyUp={(e) => {
            const input = e.target as HTMLInputElement;
            if (input.value && i < 5 && !f.otpDigits[i + 1]) {
              setTimeout(() => f.otpRefs.current[i + 1]?.focus(), 0);
            }
          }}
          className="m-field flex-1 min-w-0 max-w-14 h-14 rounded-xl border border-m-line text-center font-sans font-semibold text-[24px] tabular-nums text-m-text focus:outline-none focus:border-m-red focus:ring-2 focus:ring-m-red/25"
        />
      ))}
    </div>
  );

  const resend = () => (
    <p className="text-center text-[14px] text-m-dim">
      Didn&apos;t get the code?{" "}
      <button type="button" onClick={f.handleResend} disabled={f.resendCooldown > 0} className={`${linkBtn} disabled:opacity-50`}>
        {f.resendCooldown > 0 ? `Resend in ${f.resendCooldown}s` : "Resend"}
      </button>
    </p>
  );

  const sentTo = (lead: string) => (
    <p className="text-[14px] text-m-dim text-center">
      {lead} <span className="font-semibold text-m-text break-all">{f.email}</span>
    </p>
  );

  const submit = (idle: string, working: string) => (
    <button type="submit" disabled={f.busy} className={`${mBtn.primary} w-full disabled:opacity-60`}>
      {f.busy ? working : idle}
    </button>
  );

  return (
    <div className="m-app min-h-dvh flex flex-col px-5 pt-2 pb-10">
      <div className="h-12 flex items-center justify-between">
        <BackLink href="/" label="Home" />
        <Wordmark size={24} />
      </div>

      <div className="mt-2 mb-7">
        <ArtTile src={art.squad} sizes="100vw" className="w-full h-52" />
        <h1 className="mt-6 font-m-display font-bold text-[34px] leading-[1.05] text-m-text">{h.title}</h1>
        <p className="mt-1.5 text-[15px] text-m-dim">{h.subtitle}</p>
      </div>

      {f.error && (
        <div className="mb-4 rounded-xl border border-m-red/40 bg-m-red/10 px-4 py-3 text-[14px] text-m-red-text" role="alert">
          {f.error}
        </div>
      )}
      {f.info && (
        <div className="mb-4 rounded-xl border border-m-green/35 bg-m-green/10 px-4 py-3 text-[14px] text-m-green-text" role="status">
          {f.info}
        </div>
      )}

      {f.mode === "verify" && (
        <form onSubmit={f.handleVerifySignup} className="space-y-5">
          {sentTo("We sent a 6-digit code to")}
          {otpBoxes()}
          {submit("Verify email", "Verifying…")}
          {resend()}
          <button type="button" onClick={() => f.switchMode("signup")} className={backBtn}>
            ← Back
          </button>
        </form>
      )}

      {f.mode === "forgot" && (
        <form onSubmit={f.handleSendResetOtp} className="space-y-4">
          <Field
            label="Email"
            type="email"
            value={f.email}
            onChange={(e) => f.setEmail(e.target.value)}
            placeholder="you@gmail.com"
            required
            autoComplete="email"
          />
          {f.email && f.email.includes("@") && sentTo("We'll send a reset code to")}
          {submit("Send reset code", "Sending…")}
          {f.email && (
            <p className="text-center text-[13px] text-m-dim">
              Wrong email?{" "}
              <button type="button" onClick={() => f.setEmail("")} className={linkBtn}>
                Change it
              </button>
            </p>
          )}
          <button type="button" onClick={() => f.switchMode("signin")} className={backBtn}>
            ← Back to sign in
          </button>
        </form>
      )}

      {f.mode === "verify-reset" && (
        <form onSubmit={f.handleVerifyReset} className="space-y-4">
          {sentTo("Enter the code sent to")}
          {otpBoxes()}
          <Field
            label="New password"
            type="password"
            value={f.newPassword}
            onChange={(e) => f.setNewPassword(e.target.value)}
            placeholder="Min. 6 characters"
            required
            autoComplete="new-password"
          />
          <Field
            label="Confirm password"
            type="password"
            value={f.confirmPassword}
            onChange={(e) => f.setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            required
            autoComplete="new-password"
          />
          {submit("Reset password", "Resetting…")}
          {resend()}
          <button type="button" onClick={() => f.switchMode("forgot")} className={backBtn}>
            ← Back
          </button>
        </form>
      )}

      {(f.mode === "signin" || f.mode === "signup") && (
        <>
          <form onSubmit={f.mode === "signup" ? f.handleSignUp : f.handleSignIn} className="space-y-4">
            {f.mode === "signup" && (
              <Field
                label="Your name"
                type="text"
                value={f.displayName}
                onChange={(e) => f.setDisplayName(e.target.value)}
                placeholder="e.g. Safwan"
                autoComplete="name"
              />
            )}
            <Field
              label="Email"
              type="email"
              value={f.email}
              onChange={(e) => f.setEmail(e.target.value)}
              placeholder="you@gmail.com"
              required
              autoComplete="email"
            />
            <Field
              label="Password"
              aside={
                f.mode === "signin" && (
                  <button type="button" onClick={f.handleForgotClick} className={`${linkBtn} text-[13px] py-1`}>
                    Forgot password?
                  </button>
                )
              }
              type="password"
              value={f.password}
              onChange={(e) => f.setPassword(e.target.value)}
              placeholder={f.mode === "signup" ? "Min. 6 characters" : "Your password"}
              required
              autoComplete={f.mode === "signup" ? "new-password" : "current-password"}
            />
            <div className="pt-1">{submit(f.mode === "signin" ? "Sign in" : "Create account", "Please wait…")}</div>
          </form>

          <p className="mt-6 text-center text-[14px] text-m-dim">
            {f.mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => f.switchMode(f.mode === "signin" ? "signup" : "signin")}
              className={`${linkBtn} py-2`}
            >
              {f.mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </>
      )}
    </div>
  );
}
