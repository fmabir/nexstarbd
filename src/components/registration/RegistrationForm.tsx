"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TournamentState {
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

const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white";
const labelClass = "block text-sm font-semibold text-foreground mb-1.5";
const errorClass = "text-primary text-xs mt-1";

export function RegistrationForm({ tournamentId, userId }: { tournamentId: string; userId: string }) {
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

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ts?.isRegistrationOpen) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🔒</p>
        <p className="font-semibold text-foreground">Registration is currently closed.</p>
        <p className="text-muted-foreground text-sm mt-1">Check back later for upcoming tournaments.</p>
      </div>
    );
  }

  const isFull = (ts.registeredCount || 0) >= (ts.maxSlots || 12);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Payment notice for paid tournaments */}
      {!ts?.isFree && ts?.bkashNumber && (
        <div className="bg-secondary/10 border border-secondary rounded-xl px-4 py-3 space-y-2">
          <p className="text-sm font-semibold text-secondary flex items-center gap-2">
            📱 Payment Required
          </p>
          <p className="text-sm text-foreground">
            Send Money via bKash to: <span className="font-bold text-lg">{ts.bkashNumber}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            After sending payment, enter your transaction ID below to complete registration.
          </p>
        </div>
      )}

      {/* Waitlist notice */}
      {isFull && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 font-medium">
          ⚠️ All 12 slots are full. You will be added to the <strong>waiting list</strong>.
        </div>
      )}

      {formError && (
        <div className="bg-primary-light border border-primary rounded-xl px-4 py-3 text-primary text-sm font-medium">
          {formError}
        </div>
      )}

      {/* Squad Name */}
      <div>
        <label className={labelClass}>Squad Name *</label>
        <input type="text" value={squadName} onChange={(e) => setSquadName(e.target.value)}
          className={inputClass} placeholder="e.g. Fire Dragons" />
        {errors.squadName && <p className={errorClass}>{errors.squadName}</p>}
      </div>

      {/* Divider */}
      <div className="border-t border-border pt-1">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Squad Leader</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Leader Name *</label>
            <input type="text" value={leaderName} onChange={(e) => setLeaderName(e.target.value)}
              className={inputClass} placeholder="In-game name" />
            {errors.leaderName && <p className={errorClass}>{errors.leaderName}</p>}
          </div>
          <div>
            <label className={labelClass}>Leader UID *</label>
            <input type="text" inputMode="numeric" value={leaderUid} onChange={(e) => setLeaderUid(e.target.value)}
              className={inputClass} placeholder="Free Fire UID" />
            {errors.leaderUid && <p className={errorClass}>{errors.leaderUid}</p>}
          </div>
        </div>
      </div>

      {/* WhatsApp + bKash */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>WhatsApp Number *</label>
          <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
            className={inputClass} placeholder="+880 1XXX-XXXXXX" />
          {errors.whatsapp && <p className={errorClass}>{errors.whatsapp}</p>}
        </div>
        <div>
          <label className={labelClass}>bKash Number (Leader)</label>
          <input type="tel" value={bkash} onChange={(e) => setBkash(e.target.value)}
            className={inputClass} placeholder="+880 1XXX-XXXXXX" />
        </div>
      </div>

      {/* Transaction ID - only for paid tournaments */}
      {!ts?.isFree && (
        <div className="border-t border-border pt-1">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Payment Verification</p>
          <div>
            <label className={labelClass}>Transaction ID *</label>
            <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
              className={inputClass} placeholder="e.g., TXN1234567890" />
            <p className="text-xs text-muted-foreground mt-1">Enter the transaction ID you received after sending via bKash Send Money.</p>
            {errors.transactionId && <p className={errorClass}>{errors.transactionId}</p>}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors ${
          submitting ? "opacity-60 cursor-not-allowed" : ""
        } ${isFull ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-primary hover:bg-primary-dark text-white"}`}
      >
        {submitting ? "Submitting…" : isFull ? "Join Waiting List" : "Register Squad"}
      </button>
    </form>
  );
}
