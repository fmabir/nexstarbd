"use client";

import { useState, useEffect } from "react";
import { collection, query, where, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";
import type { ApprovalStatus } from "@/lib/types";

interface MyReg {
  id: string;
  approvalStatus: ApprovalStatus;
  isWaitlisted: boolean;
  slotNumber: number | null;
}

export function useMyRegistration(tournamentId: string) {
  const { user } = useAuth();
  const [myReg, setMyReg] = useState<MyReg | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMyReg(null);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "registrations"),
      where("tournamentId", "==", tournamentId),
      where("userId", "==", user.uid),
      limit(1)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setMyReg(null);
      } else {
        const d = snap.docs[0];
        const data = d.data();
        setMyReg({
          id: d.id,
          approvalStatus: data.approvalStatus,
          isWaitlisted: data.isWaitlisted,
          slotNumber: data.slotNumber ?? null,
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user, tournamentId]);

  return { myReg, loading };
}
