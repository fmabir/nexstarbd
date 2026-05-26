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
import type { Registration } from "@/lib/types";

export function useRegistrations(tournamentId: string) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "registrations"),
      where("tournamentId", "==", tournamentId),
      where("status", "!=", "removed"),
      orderBy("status"),
      orderBy("registeredAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setRegistrations(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration))
      );
      setLoading(false);
    });

    return unsub;
  }, [tournamentId]);

  return { registrations, loading };
}
