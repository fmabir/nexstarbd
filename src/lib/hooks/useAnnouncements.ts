"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Announcement } from "@/lib/types";

export function useAnnouncements(tournamentId: string | null) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;

    if (tournamentId === null) {
      q = query(
        collection(db, "announcements"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
    } else {
      q = query(
        collection(db, "announcements"),
        where("tournamentId", "==", tournamentId),
        orderBy("createdAt", "desc"),
        limit(20)
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));

      if (tournamentId === null) {
        docs = docs.sort((a, b) => {
          if (b.isPinned !== a.isPinned) return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
          return 0;
        });
      }

      setAnnouncements(docs);
      setLoading(false);
    });

    return unsub;
  }, [tournamentId]);

  return { announcements, loading };
}
