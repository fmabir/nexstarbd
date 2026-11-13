"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Registration } from "@/lib/types";

/**
 * Every registration the signed-in player has made, newest first, including
 * their own WhatsApp, bKash and transaction ID. Empty when signed out.
 *
 * Comes from /api/my-registrations rather than a Firestore listener: the
 * private fields aren't readable from the browser. Not live — call again
 * (remount) to refresh.
 */
export function useMyRegistrations(): { registrations: Registration[]; loading: boolean; error: string | null } {
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState<{ uid: string; registrations: Registration[]; error: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/my-registrations", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (!cancelled) setResult({ uid: user.uid, registrations: data.registrations, error: null });
      } catch (err) {
        if (!cancelled) setResult({ uid: user.uid, registrations: [], error: err instanceof Error ? err.message : "Failed" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Tagged with the uid it was fetched for: a signed-out or switched account never sees the last one's
  const mine = user && result?.uid === user.uid ? result : null;
  return {
    registrations: mine?.registrations ?? [],
    loading: authLoading || Boolean(user && !mine),
    error: mine?.error ?? null,
  };
}
