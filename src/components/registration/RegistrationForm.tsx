"use client";

import { useRegistrationForm } from "@/lib/hooks/useRegistrationForm";

const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card";
const labelClass = "block text-sm font-semibold text-foreground mb-1.5";
const errorClass = "text-primary text-xs mt-1";

export function RegistrationForm({ tournamentId, userId }: { tournamentId: string; userId: string }) {
  const {
    ts, loading, submitting, formError, errors, handleSubmit,
    squadName, setSquadName, leaderName, setLeaderName, leaderUid, setLeaderUid,
    whatsapp, setWhatsapp, bkash, setBkash, transactionId, setTransactionId,
  } = useRegistrationForm(tournamentId, userId);

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

      {/* Payment section - only for paid tournaments */}
      {!ts?.isFree && (
        <div className="border-t border-border pt-1 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Payment Verification</p>

          {/* bKash Send Money info */}
          {ts?.bkashNumber && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-4 space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">💸 Send Money via bKash (Personal)</p>
              <p className="font-mono text-2xl font-bold text-amber-900 tracking-widest">{ts.bkashNumber}</p>
              <p className="text-xs text-amber-700">Send money to this bKash number, then enter your transaction ID below.</p>
            </div>
          )}

          {/* bKash number — always visible for paid tournaments */}
          <div className="bg-amber-50 border-2 border-amber-400 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl shrink-0">💳</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-0.5">bKash Send Money (Personal)</p>
              <p className="font-mono text-xl font-bold text-amber-900 tracking-widest">01757788900</p>
              <p className="text-xs text-amber-700 mt-0.5">Send the fee to this number, then enter your transaction ID below.</p>
            </div>
          </div>

          {/* Transaction ID */}
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
