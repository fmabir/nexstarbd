"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Tournament } from "@/lib/types";

export function useTournaments(status?: string) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const constraints = status
      ? [where("status", "==", status), orderBy("startsAt", "asc")]
      : [orderBy("startsAt", "desc")];

    const q = query(collection(db, "tournaments"), ...constraints);

    const unsub = onSnapshot(
      q,
      (snap) => {
        setTournaments(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tournament))
        );
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [status]);

  return { tournaments, loading, error };
}
