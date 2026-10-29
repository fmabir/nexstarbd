"use client";

import { useId } from "react";
import { useRegistrationForm } from "@/lib/hooks/useRegistrationForm";
import { Caption, EmptyState, mBtn, mCard, mInput } from "@/components/mobile/ui/primitives";
import { AlertIcon, LockIcon, WalletIcon } from "@/components/mobile/ui/icons";

// Shown when a paid tournament has no bKash number of its own (matches desktop)
const FALLBACK_BKASH = "01757788900";

function Field({
  label,
  error,
  hint,
  ...input
}: { label: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block mb-1.5 text-[14px] font-medium text-m-text">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        className={`${mInput} ${error ? "border-m-red" : ""}`}
        {...input}
      />
      {hint && !error && <p className="mt-1.5 text-[12px] text-m-faint">{hint}</p>}
      {error && <p className="mt-1.5 text-[13px] text-m-red-text">{error}</p>}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={title} className={`${mCard} p-4 space-y-4`}>
      <Caption>{title}</Caption>
      {children}
    </div>
  );
}

export function MobileRegistrationForm({ tournamentId, userId }: { tournamentId: string; userId: string }) {
  const f = useRegistrationForm(tournamentId, userId);

  if (f.loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-m-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!f.ts?.isRegistrationOpen) {
    return (
      <EmptyState
        icon={<LockIcon size={22} />}
        title="Registration is currently closed."
        text="Check back later for upcoming tournaments."
      />
    );
  }

  const paid = !f.ts.isFree;

  return (
    <form onSubmit={f.handleSubmit} className="space-y-3" noValidate>
      {f.isFull && (
        <div className="flex gap-3 rounded-2xl border border-m-amber/35 bg-m-amber/10 p-4 text-[14px] text-m-text">
          <AlertIcon size={20} className="shrink-0 text-m-amber-text" />
          <p>
            All {f.ts.maxSlots} slots are full. You will be added to the{" "}
            <strong className="text-m-amber-text">waiting list</strong>.
          </p>
        </div>
      )}

      {f.formError && (
        <div className="rounded-2xl border border-m-red/40 bg-m-red/10 px-4 py-3 text-[14px] text-m-red-text" role="alert">
          {f.formError}
        </div>
      )}

      <Group title="Squad">
        <Field
          label="Squad name *"
          type="text"
          value={f.squadName}
          onChange={(e) => f.setSquadName(e.target.value)}
          placeholder="e.g. Fire Dragons"
          error={f.errors.squadName}
        />
      </Group>

      <Group title="Squad leader">
        <Field
          label="Leader name *"
          type="text"
          value={f.leaderName}
          onChange={(e) => f.setLeaderName(e.target.value)}
          placeholder="In-game name"
          error={f.errors.leaderName}
        />
        <Field
          label="Leader UID *"
          type="text"
          inputMode="numeric"
          value={f.leaderUid}
          onChange={(e) => f.setLeaderUid(e.target.value)}
          placeholder="Free Fire UID"
          error={f.errors.leaderUid}
        />
      </Group>

      <Group title="Contact">
        <Field
          label="WhatsApp number *"
          type="tel"
          value={f.whatsapp}
          onChange={(e) => f.setWhatsapp(e.target.value)}
          placeholder="+880 1XXX-XXXXXX"
          error={f.errors.whatsapp}
        />
        <Field
          label="bKash number (leader)"
          type="tel"
          value={f.bkash}
          onChange={(e) => f.setBkash(e.target.value)}
          placeholder="+880 1XXX-XXXXXX"
        />
      </Group>

      {paid && (
        <Group title="Payment verification">
          <div className="flex items-center gap-3 rounded-xl border border-m-amber/35 bg-m-amber/10 p-3.5">
            <span className="w-10 h-10 shrink-0 rounded-xl bg-m-amber/15 text-m-amber-text flex items-center justify-center">
              <WalletIcon size={20} />
            </span>
            <div className="min-w-0">
              <Caption color="text-m-amber-text">
                Send {f.ts.registrationFee ?? "the fee"} · bKash Send Money (Personal)
              </Caption>
              <p className="font-mono text-[20px] font-bold tracking-widest text-m-text">
                {f.ts.bkashNumber ?? FALLBACK_BKASH}
              </p>
            </div>
          </div>
          <Field
            label="Transaction ID *"
            type="text"
            value={f.transactionId}
            onChange={(e) => f.setTransactionId(e.target.value)}
            placeholder="e.g., TXN1234567890"
            hint="Enter the transaction ID you received after sending via bKash Send Money."
            error={f.errors.transactionId}
          />
        </Group>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={f.submitting}
          className={`${f.isFull ? mBtn.warning : mBtn.primary} w-full disabled:opacity-60`}
        >
          {f.submitting ? "Submitting…" : f.isFull ? "Join waiting list" : "Register squad"}
        </button>
      </div>
    </form>
  );
}
