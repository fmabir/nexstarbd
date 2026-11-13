"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  signInWithCustomToken,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface AuthContextValue {
  user: User | null;
  /** True when the signed-in user's email is in the server's ADMIN_EMAILS list. */
  isAdmin: boolean;
  /** False until the admin check for the current user has come back. */
  roleResolved: boolean;
  loading: boolean;
  /**
   * Makes sure the server has a session cookie for the signed-in user, making
   * a new one if it's missing or expired. Resolves true when it had to.
   */
  ensureSession: () => Promise<boolean>;
  transitioning: boolean;
  transitionMessage: string;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  initiateSignup: (email: string, password: string, displayName: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  sendPasswordResetOtp: (email: string) => Promise<void>;
  resetPasswordWithOtp: (email: string, otp: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Tagged with the uid it was fetched for, so a previous user's answer can
  // never be mistaken for the current user's.
  const [role, setRole] = useState<{ uid: string; isAdmin: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");
  const router = useRouter();
  // The session request in flight, so sign-in and ensureSession never post twice
  const sessionRequest = useRef<Promise<void> | null>(null);

  const postSession = useCallback((token: string) => {
    const req = fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to create session");
    });
    sessionRequest.current = req;
    req.then(
      () => { if (sessionRequest.current === req) sessionRequest.current = null; },
      () => { if (sessionRequest.current === req) sessionRequest.current = null; }
    );
    return req;
  }, []);

  // Firebase can still have the user signed in while the server's session
  // cookie is gone or expired (cookies cleared, two weeks up, or a cookie
  // from before session cookies). Server checks would then treat them as
  // signed out — and /admin would bounce to the login page and back — so
  // make a new one from a fresh ID token.
  const ensureSession = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) return false;
    if (sessionRequest.current) {
      try {
        await sessionRequest.current;
        return false;
      } catch {
        // fall through and check for ourselves
      }
    }
    const check = await fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : { valid: false }))
      .catch(() => ({ valid: false }));
    if (check.valid) return false;
    await postSession(await current.getIdToken());
    return true;
  }, [postSession]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Ask the server which side of the app this user belongs to. The browser
  // can't know: ADMIN_EMAILS never leaves the server.
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    let cancelled = false;
    ensureSession()
      .catch(() => false)
      .then((renewed) => {
        // Pages the server drew while the cookie was missing showed a signed-out view
        if (renewed && !cancelled) router.refresh();
        return fetch("/api/auth/role");
      })
      .then((r) => (r.ok ? r.json() : { isAdmin: false }))
      .then((d) => {
        if (!cancelled) setRole({ uid, isAdmin: Boolean(d.isAdmin) });
      })
      .catch(() => {
        if (!cancelled) setRole({ uid, isAdmin: false });
      });
    return () => {
      cancelled = true;
    };
  }, [user, ensureSession, router]);

  // Derived rather than stored: signing out, or signing in as someone else,
  // drops back to "not an admin" without another render pass.
  const isAdmin = Boolean(user && role?.uid === user.uid && role.isAdmin);
  const roleResolved = !user || role?.uid === user.uid;

  const showTransition = (msg: string, ms = 1200) => {
    setTransitionMessage(msg);
    setTransitioning(true);
    return delay(ms).then(() => setTransitioning(false));
  };

  const startTransition = (msg: string) => {
    setTransitionMessage(msg);
    setTransitioning(true);
  };

  const endTransition = () => setTransitioning(false);

  const createSession = async (customToken?: string) => {
    let token: string;
    if (customToken) {
      const credential = await signInWithCustomToken(auth, customToken);
      token = await credential.user.getIdToken();
    } else {
      token = await auth.currentUser!.getIdToken();
    }
    await postSession(token);
  };

  const signOut = async () => {
    setTransitionMessage("Signing out…");
    setTransitioning(true);
    await delay(600);
    await firebaseSignOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    setTransitioning(false);
    window.location.href = "/";
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    await createSession();
  };

  const initiateSignup = async (email: string, password: string, displayName: string) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "email-already-in-use") {
        const err = new Error("email-already-in-use") as Error & { code: string };
        err.code = "auth/email-already-in-use";
        throw err;
      }
      throw new Error(data.error || "Failed to send OTP");
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "otp-expired") throw new Error("otp-expired");
      throw new Error("invalid-otp");
    }
    await createSession(data.customToken);
  };

  const resendOtp = async (email: string) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, resendOnly: true }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to resend OTP");
    }
  };

  const sendPasswordResetOtp = async (email: string) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "password_reset" }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "no-account") throw new Error("no-account");
      throw new Error(data.error || "Failed to send reset code");
    }
  };

  const resetPasswordWithOtp = async (email: string, otp: string, newPassword: string) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "otp-expired") throw new Error("otp-expired");
      if (data.error === "weak-password") throw new Error("weak-password");
      throw new Error("invalid-otp");
    }
    await createSession(data.customToken);
  };

  return (
    <AuthContext.Provider value={{
      user, isAdmin, roleResolved, loading, ensureSession, transitioning, transitionMessage,
      signOut, signInWithEmail,
      initiateSignup, verifyOtp, resendOtp,
      sendPasswordResetOtp, resetPasswordWithOtp,
      showTransition, startTransition, endTransition,
    } as AuthContextValue & {
      showTransition: (msg: string, ms?: number) => Promise<void>;
      startTransition: (msg: string) => void;
      endTransition: () => void;
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

type FullAuthContext = AuthContextValue & {
  showTransition: (msg: string, ms?: number) => Promise<void>;
  startTransition: (msg: string) => void;
  endTransition: () => void;
};

export function useAuthTransition() {
  const ctx = useContext(AuthContext) as FullAuthContext | null;
  if (!ctx) throw new Error("useAuthTransition must be used within AuthProvider");
  return {
    showTransition: ctx.showTransition,
    startTransition: ctx.startTransition,
    endTransition: ctx.endTransition,
  };
}
