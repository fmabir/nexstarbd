"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Winner } from "@/lib/types";

export function useTournamentWinners(tournamentId: string) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "winners"),
      where("tournamentId", "==", tournamentId)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Winner))
          .sort((a, b) => a.position - b.position);
        setWinners(docs);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [tournamentId]);

  return { winners, loading };
}
