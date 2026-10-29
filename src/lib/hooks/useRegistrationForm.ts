"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface TournamentState {
  name: string;
  allUids: string[];
  registeredCount: number;
  maxSlots: number;
  isRegistrationOpen: boolean;
  status: string;
  isFree: boolean;
  registrationFee: string | null;
  bkashNumber: string | null;
}

/**
 * State, validation, and submit for squad registration, without the markup —
 * the desktop form and the phone form both run on it.
 */
export function useRegistrationForm(tournamentId: string, userId: string) {
  const router = useRouter();
  const [ts, setTs] = useState<TournamentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [squadName, setSquadName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderUid, setLeaderUid] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bkash, setBkash] = useState("");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    fetch(`/api/register?tournamentId=${tournamentId}`)
      .then((r) => r.json())
      .then((data) => { setTs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tournamentId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!squadName.trim()) e.squadName = "Required";
    if (!leaderName.trim()) e.leaderName = "Required";
    if (!leaderUid.trim()) e.leaderUid = "Required";
    if (!whatsapp.trim()) e.whatsapp = "Required";

    if (!ts?.isFree && !transactionId.trim()) {
      e.transactionId = "Transaction ID required for paid tournaments";
    }

    const existing = ts?.allUids || [];
    if (leaderUid.trim() && existing.includes(leaderUid.trim())) {
      e.leaderUid = "This UID is already registered";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, userId, squadName, leaderName, leaderUid, whatsapp, bkash, transactionId: transactionId || null }),
      });

      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Something went wrong"); return; }

      router.push(`/my-registration/${data.registrationId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isFull = (ts?.registeredCount || 0) >= (ts?.maxSlots || 12);

  return {
    ts, loading, submitting, formError, errors, isFull, handleSubmit,
    squadName, setSquadName, leaderName, setLeaderName, leaderUid, setLeaderUid,
    whatsapp, setWhatsapp, bkash, setBkash, transactionId, setTransactionId,
  };
}
