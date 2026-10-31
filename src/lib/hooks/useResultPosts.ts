"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { ResultPost } from "@/lib/types";

/**
 * The published Results feed. Members only: with nobody signed in it returns
 * `locked` and fetches nothing. Posts come through /api/results (not a
 * Firestore listener) because the collection is closed to the browser.
 */
export function useResultPosts() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<ResultPost[]>([]);
  // Tagged with the uid it was fetched for, so a signed-out or switched
  // account never sees the previous one's feed
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/results", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setPosts(data.posts);
          setError(false);
          setLoadedFor(user.uid);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoadedFor(user.uid);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const ready = Boolean(user && loadedFor === user.uid);
  return {
    posts: ready ? posts : [],
    loading: authLoading || Boolean(user && !ready),
    locked: !authLoading && !user,
    error: ready && error,
  };
}
