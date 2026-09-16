"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
    fetch("/api/auth/role")
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
  }, [user]);

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
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error("Failed to create session");
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
      user, isAdmin, roleResolved, loading, transitioning, transitionMessage,
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
