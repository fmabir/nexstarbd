"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface PublicSquad {
  id: string;
  squadName: string;
  slotNumber: number | null;
  isWaitlisted: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
}

export function useRegistrations(tournamentId: string) {
  const [squads, setSquads] = useState<PublicSquad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "registrations"),
      where("tournamentId", "==", tournamentId),
      orderBy("slotNumber", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setSquads(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            squadName: data.squadName,
            slotNumber: data.slotNumber ?? null,
            isWaitlisted: data.isWaitlisted ?? false,
            approvalStatus: data.approvalStatus ?? "pending",
          };
        })
      );
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [tournamentId]);

  return { squads, loading };
}
