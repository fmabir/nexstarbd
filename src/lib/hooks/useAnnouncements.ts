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
    const q = query(
      collection(db, "announcements"),
      where("tournamentId", "==", tournamentId),
      orderBy("isPinned", "desc"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsub = onSnapshot(q, (snap) => {
      setAnnouncements(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement))
      );
      setLoading(false);
    });

    return unsub;
  }, [tournamentId]);

  return { announcements, loading };
}
